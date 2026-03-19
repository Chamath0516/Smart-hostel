import { useCallback, useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { fetchLateStudents, fetchOutsideStudents } from "../api/qrApi";

const CURFEW_HOUR = 22;
const CURFEW_MINUTE = 30;

function getStudentKey(student) {
  if (!student) return "";
  return String(student.email || `${student.name || ""}-${student.phone || ""}`).toLowerCase();
}

function isLateByCurfew(lastExitAt, goingHome, now = new Date()) {
  if (goingHome || !lastExitAt) return false;

  const exitTime = new Date(lastExitAt);
  if (Number.isNaN(exitTime.getTime())) return false;

  const curfewToday = new Date(now);
  curfewToday.setHours(CURFEW_HOUR, CURFEW_MINUTE, 0, 0);

  if (now >= curfewToday) return true;

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  return exitTime < startOfToday;
}

function normalizeLateStudents(data) {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => {
      if (typeof item === "string") return { name: item };
      return item || {};
    })
    .filter(Boolean);
}

export default function OutsideMonitor() {
  const [outside, setOutside] = useState([]);
  const [lateStudents, setLateStudents] = useState([]);
  const [outsideCount, setOutsideCount] = useState(0);
  const [lateCount, setLateCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const gateUrl = `${window.location.origin}/qr`;

  const copyGateUrl = async () => {
    try {
      await navigator.clipboard.writeText(gateUrl);
    } catch {
      // Ignore clipboard errors in unsupported/insecure contexts.
    }
  };

  const openGateUrl = () => {
    window.open(gateUrl, "_blank", "noopener,noreferrer");
  };

  const refreshData = useCallback(async () => {
    try {
      const outsideRes = await fetchOutsideStudents();
      const outsideRows = Array.isArray(outsideRes?.outside) ? outsideRes.outside : [];
      setOutside(outsideRows);
      setOutsideCount(
        typeof outsideRes?.outsideCount === "number" ? outsideRes.outsideCount : outsideRows.length
      );

      try {
        const lateRes = await fetchLateStudents();
        const lateRows = normalizeLateStudents(lateRes?.lateStudents);
        setLateStudents(lateRows);
        setLateCount(typeof lateRes?.lateCount === "number" ? lateRes.lateCount : lateRows.length);
      } catch (lateError) {
        const status = lateError?.response?.status;
        if (status && status !== 403 && status !== 404) throw lateError;

        const computedLateRows = outsideRows.filter((row) =>
          isLateByCurfew(row?.lastExitAt, row?.goingHome)
        );
        const computedLate = computedLateRows.map((row) => row?.student || {});
        setLateStudents(normalizeLateStudents(computedLate));
        setLateCount(computedLate.length);
      }

      setError("");
      setLastUpdated(new Date());
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load outside/late students.");
      setOutside([]);
      setOutsideCount(0);
      setLateStudents([]);
      setLateCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    const intervalId = setInterval(refreshData, 10000);
    return () => clearInterval(intervalId);
  }, [refreshData]);

  const lateStudentKeys = useMemo(() => {
    const keys = new Set();
    lateStudents.forEach((student) => {
      const key = getStudentKey(student);
      if (key) keys.add(key);
    });
    return keys;
  }, [lateStudents]);

  return (
    <div className="dashboard-grid">
      <section className="dashboard-card dashboard-span-2">
        <div className="dashboard-card-head">
          <h3>Outside Students</h3>
          <div className="dashboard-meta">
            <span className="count-badge">Total Outside: {outsideCount}</span>
            <button type="button" className="dashboard-refresh-btn" onClick={refreshData}>
              Refresh
            </button>
          </div>
        </div>

        {lastUpdated ? (
          <p className="dashboard-last-updated">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        ) : null}
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="dashboard-error">{error}</p> : null}

        {!loading && !error && outside.length === 0 ? <p>No students are currently outside.</p> : null}

        {!loading && !error && outside.length > 0 ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email / Phone</th>
                  <th>Destination</th>
                  <th>Last Exit</th>
                  <th>Going Home</th>
                </tr>
              </thead>
              <tbody>
                {outside.map((row, index) => {
                  const student = row?.student || {};
                  const lateByOutside = Boolean(row?.isLate);
                  const lateByList = lateStudentKeys.has(getStudentKey(student));
                  const lateByCurfewFallback = isLateByCurfew(row?.lastExitAt, row?.goingHome);
                  const isLate = lateByOutside || lateByList || lateByCurfewFallback;

                  return (
                    <tr key={`${getStudentKey(student) || "student"}-${index}`} className={isLate ? "late-row" : ""}>
                      <td>{student?.name || "-"}</td>
                      <td>{student?.email || student?.phone || "-"}</td>
                      <td>{row?.destination || "-"}</td>
                      <td>{row?.lastExitAt ? new Date(row.lastExitAt).toLocaleString() : "-"}</td>
                      <td>{row?.goingHome ? "Yes" : "No"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {lateStudents.length > 0 ? (
        <section className="dashboard-card">
          <h3>Late Students</h3>
          <p className="count-badge">Late Count: {lateCount}</p>
          <ul className="dashboard-list">
            {lateStudents.map((student, index) => (
              <li key={`${getStudentKey(student) || student?.name || "late"}-${index}`} className="late-text">
                {student?.name || "Unknown student"}
                {student?.email ? ` (${student.email})` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="dashboard-card">
        <h3>Gate QR Code</h3>
        <p className="dashboard-small-text">Scan to open gate public page</p>
        <div className="dashboard-qr-wrap">
          <QRCodeCanvas value={gateUrl} size={180} />
        </div>
        <p className="dashboard-small-text dashboard-break-all">{gateUrl}</p>
        <div className="dashboard-action-row">
          <button type="button" className="dashboard-refresh-btn" onClick={openGateUrl}>
            Open Public QR
          </button>
          <button type="button" className="dashboard-refresh-btn" onClick={copyGateUrl}>
            Copy URL
          </button>
        </div>
      </section>
    </div>
  );
}

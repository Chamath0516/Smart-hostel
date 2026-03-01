import { useState } from "react";
import { getQrStatus, submitQrScan } from "../api/qrPublicApi";
import "./QrPublicPage.css";

const initialExitForm = { destination: "", goingHome: false };

export default function QrPublicPage() {
  const [studentIdInput, setStudentIdInput] = useState("");
  const [studentId, setStudentId] = useState("");
  const [status, setStatus] = useState("");
  const [exitForm, setExitForm] = useState(initialExitForm);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetFlow = () => {
    setStudentIdInput("");
    setStudentId("");
    setStatus("");
    setExitForm(initialExitForm);
  };

  const onContinue = async () => {
    const value = studentIdInput.trim();
    if (!value) {
      setError("Student ID is required");
      return;
    }

    setLoadingStatus(true);
    setError("");
    setSuccess("");
    try {
      const data = await getQrStatus(value);
      setStudentId(data.studentUserId);
      setStatus(data.status);
    } catch (err) {
      setError(err.message || "Could not fetch student status");
    } finally {
      setLoadingStatus(false);
    }
  };

  const onSubmitExit = async (e) => {
    e.preventDefault();
    if (!exitForm.destination.trim()) {
      setError("Destination is required");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await submitQrScan({
        studentUserId: studentId,
        action: "EXIT",
        destination: exitForm.destination.trim(),
        goingHome: exitForm.goingHome
      });
      setSuccess("Exit scan recorded successfully.");
      resetFlow();
    } catch (err) {
      setError(err.message || "Could not submit exit scan");
    } finally {
      setSubmitting(false);
    }
  };

  const onMarkArrived = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await submitQrScan({
        studentUserId: studentId,
        action: "ENTRY"
      });
      setSuccess("Arrival recorded successfully.");
      resetFlow();
    } catch (err) {
      setError(err.message || "Could not mark arrival");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="qr-page">
      <div className="qr-card">
        <h1>Hostel Gate QR</h1>
        <p className="qr-subtitle">Enter your student ID to continue</p>

        {error ? <div className="qr-alert qr-alert-error">{error}</div> : null}
        {success ? <div className="qr-alert qr-alert-success">{success}</div> : null}

        {!status ? (
          <div className="qr-step">
            <label htmlFor="student-id">Student ID</label>
            <input
              id="student-id"
              type="text"
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
              placeholder="Enter Student ID"
            />
            <button onClick={onContinue} disabled={loadingStatus}>
              {loadingStatus ? "Checking..." : "Continue"}
            </button>
          </div>
        ) : null}

        {status === "INSIDE" ? (
          <form className="qr-step" onSubmit={onSubmitExit}>
            <h2>Going Out</h2>
            <label>Student ID</label>
            <input value={studentId} readOnly />

            <label htmlFor="destination">Destination</label>
            <input
              id="destination"
              type="text"
              value={exitForm.destination}
              onChange={(e) =>
                setExitForm((prev) => ({ ...prev, destination: e.target.value }))
              }
              placeholder="Where are you going?"
            />

            <label className="qr-checkbox">
              <input
                type="checkbox"
                checked={exitForm.goingHome}
                onChange={(e) =>
                  setExitForm((prev) => ({ ...prev, goingHome: e.target.checked }))
                }
              />
              Going Home
            </label>

            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        ) : null}

        {status === "OUTSIDE" ? (
          <div className="qr-step">
            <h2>Arrived</h2>
            <label>Student ID</label>
            <input value={studentId} readOnly />
            <button onClick={onMarkArrived} disabled={submitting}>
              {submitting ? "Submitting..." : "Mark Arrived"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

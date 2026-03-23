import { useState } from "react";
import { getQrStatus, submitQrScan } from "../api/qrPublicApi";
import Layout from "../components/Layout";
import Card from "../components/Card";
import "./QrPublicPage.css";

const initialExitForm = { destination: "", goingHome: false };
const PIN_REGEX = /^\d{4}$/;

export default function QrPublicPage() {
  const [studentIdInput, setStudentIdInput] = useState("");
  const [studentId, setStudentId] = useState("");
  const [status, setStatus] = useState("");
  const [exitForm, setExitForm] = useState(initialExitForm);
  const [securityPin, setSecurityPin] = useState("");
  const [exitSubmitAttempted, setExitSubmitAttempted] = useState(false);
  const [pinSubmitAttempted, setPinSubmitAttempted] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetFlow = () => {
    setStudentIdInput("");
    setStudentId("");
    setStatus("");
    setExitForm(initialExitForm);
    setExitSubmitAttempted(false);
    setSecurityPin("");
    setPinSubmitAttempted(false);
  };

  const hasValidSecurityPin = PIN_REGEX.test(securityPin);

  const onContinue = async () => {
    const value = studentIdInput.trim();
    if (!value) {
      setError("Student ID is required");
      return;
    }

    setStudentId(value);
    setLoadingStatus(true);
    setError("");
    setSuccess("");
    try {
      const data = await getQrStatus(value);
      setStudentId(data.studentId || value);
      setStatus(data.status);
    } catch (err) {
      setError(err.message || "Could not fetch student status");
    } finally {
      setLoadingStatus(false);
    }
  };

  const onSubmitExit = async (e) => {
    e.preventDefault();
    setExitSubmitAttempted(true);
    setPinSubmitAttempted(true);
    if (!exitForm.destination.trim()) {
      return;
    }
    if (!hasValidSecurityPin) {
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await submitQrScan({
        studentId,
        action: "EXIT",
        destination: exitForm.destination.trim(),
        goingHome: exitForm.goingHome,
        securityPin
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
    setPinSubmitAttempted(true);
    if (!hasValidSecurityPin) {
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await submitQrScan({
        studentId,
        action: "ENTRY",
        securityPin
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
    <Layout narrow>
      <div className="qr-page">
        <Card className="qr-card">
          <h1>Hostel Gate QR</h1>
          <p className="qr-subtitle">Enter your student ID to continue</p>

          {error ? <div className="alert alert-error">{error}</div> : null}
          {success ? <div className="alert alert-success">{success}</div> : null}

          {!status ? (
            <div className="qr-step">
              <div className="form-group">
                <label className="form-label" htmlFor="student-id">
                  Student ID
                </label>
                <input
                  id="student-id"
                  className="text-input"
                  type="text"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  placeholder="e.g. IT24102141"
                />
              </div>

              <button className="btn-primary" onClick={onContinue} disabled={loadingStatus}>
                {loadingStatus ? "Checking..." : "Continue"}
              </button>
            </div>
          ) : null}

          {status === "INSIDE" ? (
            <form className="qr-step" onSubmit={onSubmitExit}>
              <h2>Going Out</h2>

              <div className="form-group">
                <label className="form-label">Student ID</label>
                <input className="text-input" value={studentId} readOnly />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="destination">
                  Destination
                </label>
                <input
                  id="destination"
                  className="text-input"
                  type="text"
                  value={exitForm.destination}
                  onChange={(e) =>
                    setExitForm((prev) => ({ ...prev, destination: e.target.value }))
                  }
                  placeholder="Where are you going?"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="security-pin-exit">
                  Security PIN
                </label>
                <input
                  id="security-pin-exit"
                  className="text-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="Enter 4-digit PIN"
                />
              </div>

              {exitSubmitAttempted && !exitForm.destination.trim() ? (
                <div className="alert alert-error">Destination is required</div>
              ) : null}
              {pinSubmitAttempted && !hasValidSecurityPin ? (
                <div className="alert alert-error">Enter a valid 4-digit security PIN</div>
              ) : null}

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

              <button className="btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          ) : null}

          {status === "OUTSIDE" ? (
            <div className="qr-step">
              <h2>Arrived</h2>

              <div className="form-group">
                <label className="form-label">Student ID</label>
                <input className="text-input" value={studentId} readOnly />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="security-pin-entry">
                  Security PIN
                </label>
                <input
                  id="security-pin-entry"
                  className="text-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="Enter 4-digit PIN"
                />
              </div>

              {pinSubmitAttempted && !hasValidSecurityPin ? (
                <div className="alert alert-error">Enter a valid 4-digit security PIN</div>
              ) : null}

              <button className="btn-primary" onClick={onMarkArrived} disabled={submitting}>
                {submitting ? "Submitting..." : "Mark Arrived"}
              </button>
            </div>
          ) : null}
        </Card>
      </div>
    </Layout>
  );
}

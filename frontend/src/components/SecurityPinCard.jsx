import { useEffect, useState } from "react";
import { fetchSecurityPin } from "../api/qrApi";

const getRemainingSeconds = (expiresAt) => {
  if (!expiresAt) return 0;

  const expiryTime = new Date(expiresAt).getTime();
  if (Number.isNaN(expiryTime)) return 0;

  return Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000));
};

export default function SecurityPinCard() {
  const [pinMeta, setPinMeta] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadPin = async () => {
      try {
        const data = await fetchSecurityPin();
        if (!isMounted) return;

        setPinMeta(data);
        setRemainingSeconds(getRemainingSeconds(data?.expiresAt));
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || "Could not load security PIN.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPin();

    const refreshInterval = setInterval(loadPin, 5000);
    const countdownInterval = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          loadPin();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  return (
    <section className="dashboard-card security-pin-card">
      <div className="dashboard-card-head">
        <div>
          <h3>Current Security PIN</h3>
          <p className="dashboard-small-text security-pin-help">
            Share this PIN at the gate. It renews every 60 seconds.
          </p>
        </div>
        <span className="security-pin-badge">Security Only</span>
      </div>

      {loading ? <p>Loading current PIN...</p> : null}
      {error ? <p className="dashboard-error">{error}</p> : null}

      {!loading && !error ? (
        <>
          <div className="security-pin-value">{pinMeta?.pin || "----"}</div>
          <div className="security-pin-meta">
            <span>Remaining: {remainingSeconds}s</span>
            <span>
              Expires:{" "}
              {pinMeta?.expiresAt ? new Date(pinMeta.expiresAt).toLocaleTimeString() : "-"}
            </span>
          </div>
        </>
      ) : null}
    </section>
  );
}

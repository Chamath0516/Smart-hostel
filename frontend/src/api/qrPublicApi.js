const readJson = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }
  return data;
};

export const getQrStatus = async (studentId) => {
  const res = await fetch(`/api/qr/status/${encodeURIComponent(studentId)}`);
  return readJson(res);
};

export const submitQrScan = async (payload) => {
  const res = await fetch("/api/qr/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return readJson(res);
};

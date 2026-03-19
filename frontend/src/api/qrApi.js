import api from "./axios";

export async function fetchOutsideStudents() {
  const res = await api.get("/qr/outside");
  return res.data || {};
}

export async function fetchLateStudents() {
  const res = await api.get("/qr/late");
  return res.data || {};
}

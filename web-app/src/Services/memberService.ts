const API_BASE =
  import.meta.env.DEV
    ? "http://localhost:7071"
    : "";

export async function getMembers() {
  const response = await fetch(
    `${API_BASE}/api/getMembers`
  );

  return response.json();
}
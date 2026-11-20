const API_BASE =
  import.meta.env.DEV
    ? "http://localhost:7071"
    : "";

export async function getInstructors() {
  const response = await fetch(
    `${API_BASE}/api/getInstructors`
  );

  return response.json();
}
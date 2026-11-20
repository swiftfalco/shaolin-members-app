const API_BASE =
  import.meta.env.DEV
    ? "http://localhost:7071"
    : "";

export async function getMemberProgress(
  memberId: string
) {
  const response = await fetch(
    `${API_BASE}/api/getMemberProgress?memberId=${memberId}`
  );

  return response.json();
}
const API_BASE =
  import.meta.env.DEV
    ? "http://localhost:7071"
    : "";

export async function getMemberTechniques(
  memberId: string
) {
  const response = await fetch(
    `${API_BASE}/api/getMemberTechniques?memberId=${memberId}`
  );

  return response.json();
}
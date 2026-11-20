const API_BASE =
  import.meta.env.DEV
    ? "http://localhost:7071"
    : "";

export async function getMemberTechniqueNotes(
  memberId: string
) {
  const response = await fetch(
    `${API_BASE}/api/getMemberTechniqueNotes?memberId=${memberId}`
  );

  return response.json();
}

export async function saveMemberTechniqueNote(
  memberId: string,
  techniqueId: string,
  notes: string
) {
  const response = await fetch(
    `${API_BASE}/api/saveMemberTechniqueNote`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        memberId,
        techniqueId,
        notes,
      }),
    }
  );

  return response.json();
}
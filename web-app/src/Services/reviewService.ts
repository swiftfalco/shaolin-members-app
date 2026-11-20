const API_BASE =
  import.meta.env.DEV
    ? "http://localhost:7071"
    : "";

export async function addStudentReview(
  memberId: string,
  techniqueId: string,
  instructorInitials: string
) : Promise<ReviewResult> {
  const response = await fetch(
    `${API_BASE}/api/addStudentReview`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberId,
        techniqueId,
        instructorInitials,
      }),
    }
  );

  return response.json();
}

export interface ReviewResult {
  success: boolean;
  promoted: boolean;
  memberName: string;
  previousSash: string;
  newSash: string;
  currentPoints: number;
}
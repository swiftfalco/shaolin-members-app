import skfLogo from "./assets/skf-logo.png";

import { useEffect, useState } from "react";
import "./App.css";

import { getMembers } from "./Services/memberService";
import { getMemberTechniques } from "./Services/techniqueService";
import { getMemberProgress } from "./Services/progressServices";
import { addStudentReview } from "./Services/reviewService";
import { getInstructors } from "./Services/instructorService";
import { useMsal } from "@azure/msal-react";

function App() {
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [outstandingTechniques, setOutstandingTechniques] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [instructors, setInstructors] =  useState<any[]>([]);
  const { accounts, instance } = useMsal();
  const isAuthenticated = accounts.length > 0;
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

const [
  showPromotionDialog,
  setShowPromotionDialog,
] = useState(false);

const [
  promotionMessage,
  setPromotionMessage,
] = useState("");

console.log("Accounts:", accounts);
console.log(
  "Active:",
  instance.getActiveAccount()
);

useEffect(() => {
  if (
    !instance.getActiveAccount() &&
    accounts.length > 0
  ) {
    instance.setActiveAccount(
      accounts[0]
    );
  }
}, [accounts, instance]);

    const [showReviewDialog, setShowReviewDialog] =
    useState(false);

  const [selectedTechnique, setSelectedTechnique] =
    useState<any>(null);

  const [instructorInitials, setInstructorInitials] =
    useState("");

  const sashNames: Record<string, string> = {
    "01": "Grey Sash",
    "02": "White Sash",
    "03": "Yellow Sash",
    "04": "Orange Sash",
    "05": "Blue Sash",
  };

  async function loadTechniques(memberId: string) {
    const data = await getMemberTechniques(memberId);

    const sorted = [...(data.outstanding || [])].sort((a, b) => {
      const sashCompare =
        Number(a.SashOrder || 0) -
        Number(b.SashOrder || 0);

      if (sashCompare !== 0) {
        return sashCompare;
      }

      return (
        Number(a.DisplayOrder || 0) -
        Number(b.DisplayOrder || 0)
      );
    });

    setOutstandingTechniques(sorted);
  }

  async function loadProgress(memberId: string) {
    const data = await getMemberProgress(memberId);
    setProgress(data);
  }

  async function reviewTechnique(
    techniqueId: string
  ) {
    if (!selectedMember) {
      return;
    }

const result =
  await addStudentReview(
    selectedMember.rowKey,
    techniqueId,
    instructorInitials
  );
console.log(
  "Review Result:",
  result
);

if (result.promoted) {

  setPromotionMessage(
    `${result.memberName}
     has earned enough points
     to reach
     ${result.newSash} Sash`
  );

  setShowPromotionDialog(
    true
  );
}

    await loadTechniques(
      selectedMember.rowKey
    );

    await loadProgress(
      selectedMember.rowKey
    );
    const refreshedMembers =
  await getMembers();

setMembers(refreshedMembers);

const refreshedMember =
  refreshedMembers.find(
    (m: any ) =>
      m.rowKey ===
      selectedMember.rowKey
  );

if (refreshedMember) {
  setSelectedMember(
    refreshedMember
  );
}
  }
  
  async function confirmReview() {
    if (!selectedTechnique) {
      return;
    }

    if (instructorInitials.trim() === "") {
      alert("Please select an instructor.");
      return;
    }

    await reviewTechnique(
      selectedTechnique.rowKey
    );

    setShowReviewDialog(false);
    setSelectedTechnique(null);
    setInstructorInitials("");
  }

  useEffect(() => {
if (!isAuthenticated) {
setIsAuthorized(null);
return;
}
    async function loadMembers() {
const instructorData =
  await getInstructors();

setInstructors(instructorData);

const currentUser =
  accounts[0]?.username?.toLowerCase();

const authorised =
  instructorData.some(
    (i: any) =>
      i.Email?.toLowerCase() ===
      currentUser
  );

console.log(
  "Current User:",
  currentUser
);

console.log(
  "Instructor Data:",
  instructorData
);

console.log(
  "Authorised:",
  authorised
);


setIsAuthorized(authorised);

if (!authorised) {
  return;
}

const data = await getMembers();

setMembers(data);

if (data.length > 0) {
        setSelectedMember(data[0]);

        await loadTechniques(
          data[0].rowKey
        );

        await loadProgress(
          data[0].rowKey
        );
      }
    }

    loadMembers();
}, [accounts, isAuthenticated]);

  const groupedTechniques =
    outstandingTechniques.reduce(
      (groups: any, technique: any) => {
        const sash =
          technique.SashOrder ?? "00";

        if (!groups[sash]) {
          groups[sash] = [];
        }

        groups[sash].push(technique);

        return groups;
      },
      {}
    );

if (!isAuthenticated) {
  return (
    <div className="login-container">
      <img
        className="login-logo"
        src={skfLogo}
        alt="Shaolin Kung Fu Academy Logo"
      >

        </img>

      <h2>
        Sign in to access the Instructor Dashboard
      </h2>
 
      <button
        className="review-button"
        onClick={() =>
          instance.loginRedirect({
            scopes: [
              "openid",
              "profile",
              "email",
            ],
          })
        }
      >
        Sign In
      </button>
    </div>
  );
}

if (isAuthorized === null) {
  return (
    <div className="instructor-container">
      <h1>Kung Fu Instructor Dashboard</h1>
      <p>Loading...</p>
    </div>
  );
}

if (isAuthorized === false) {
  return (
    <div className="instructor-container">
      <h1>
        Kung Fu Instructor Dashboard
      </h1>

      <p>
        Your account is not authorised
        to access this application.
      </p>

      <p>
        {accounts[0]?.username}
      </p>

      <button
        onClick={() =>
          instance.logoutRedirect()
        }
      >
        Sign Out
      </button>
    </div>
  );
}
  return (
    <div className="instructor-container">
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <h1>
    Kung Fu Instructor Dashboard
  </h1>

  <div>
    <span>
      {accounts[0]?.username}
    </span>

    <button
      onClick={() =>
        instance.logoutRedirect()
      }
      style={{
        marginLeft: "10px",
      }}
    >
      Sign Out
    </button>
  </div>
</div>

{
  showPromotionDialog && (
    <div className="dialog-overlay">
      <div className="dialog-box">

        <h2>
          🎉 Sash Promotion
        </h2>

        <p>
          {promotionMessage}
        </p>

        <button
          onClick={() =>
            setShowPromotionDialog(
              false
            )
          }
        >
          OK
        </button>

      </div>
    </div>
  )
}


      <div className="summary">
        <div className="card">
          <h3>Total Members</h3>
          <p>{members.length}</p>
        </div>
      </div>

      <h2>Select Student</h2>

      <select
        className="member-select"
        value={selectedMember?.rowKey || ""}
        onChange={(e) => {
          const member = members.find(
            (m) => m.rowKey === e.target.value
          );

          if (member) {
            setSelectedMember(member);

            loadTechniques(
              member.rowKey
            );

            loadProgress(
              member.rowKey
            );
          }
        }}
      >
        {members.map((member) => (
          <option
            key={member.rowKey}
            value={member.rowKey}
          >
            {String(member.FirstName).replace(/"/g, "")}{" "}
            {String(member.LastName).replace(/"/g, "")}
          </option>
        ))}
      </select>

      {selectedMember && (
        <>
          <h2>
            {String(
              selectedMember.FirstName
            ).replace(/"/g, "")}{" "}
            {String(
              selectedMember.LastName
            ).replace(/"/g, "")}
          </h2>

          {progress && (
            <div className="progress-card">
              <div className="progress-row">
                <span>
                  <strong>Current Sash:</strong>{" "}
                  {progress.currentSash}
                </span>

                <span>
                  <strong>Current Points:</strong>{" "}
                  {progress.currentPoints}
                </span>
              </div>

              <div className="progress-row">
                <span>
                  <strong>Next Sash:</strong>{" "}
                  {progress.nextSash}
                </span>

                <span>
                  <strong>Points Needed:</strong>{" "}
                  {progress.pointsNeeded}
                </span>
              </div>
            </div>
          )}

          <div className="technique-box">
            <h2>Outstanding Techniques</h2>

            {Object.keys(groupedTechniques)
              .sort()
              .map((sash) => (
                <div
                  key={sash}
                  className="sash-section"
                >
                  <h3>
                    {sashNames[sash] ||
                      `Level ${sash}`}
                  </h3>

                  <ul>
                    {groupedTechniques[sash].map(
                      (technique: any) => (
                        <li
                          key={technique.rowKey}
                          className="technique-item"
                        >
                          <span>
                            {String(
                              technique.Name
                            ).replace(/"/g, "")}
                          </span>

                          <button
                            className="review-button"
                            onClick={() => {
                              setSelectedTechnique(
                                technique
                              );

                              setInstructorInitials("");

                              setShowReviewDialog(
                                true
                              );
                            }}
                          >
                            Review
                          </button>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ))}
          </div>
        </>
      )}

      {showReviewDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h2>Confirm Review</h2>

            <p>
              Mark this technique as
              reviewed?
            </p>

            <p>
              <strong>
                {selectedTechnique?.Name}
              </strong>
            </p>

<select
  className="member-select"
  value={instructorInitials}
  onChange={(e) =>
    setInstructorInitials(
      e.target.value
    )
  }
>
  <option value="">
    Select Instructor
  </option>

  {instructors.map(
    (instructor) => (
      <option
        key={instructor.rowKey}
        value={
          String(
            instructor.Initials
          ).replace(/"/g, "")
        }
      >
        {String(
          instructor.Name
        ).replace(/"/g, "")}
        {" ("}
        {String(
          instructor.Initials
        ).replace(/"/g, "")}
        {")"}
      </option>
    )
  )}
</select>

            <div className="dialog-buttons">
              <button
                onClick={() => {
                  setShowReviewDialog(
                    false
                  );
                  setSelectedTechnique(
                    null
                  );
                }}
              >
                Cancel
              </button>

              <button
                onClick={confirmReview}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
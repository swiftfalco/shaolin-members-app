import skfLogo from "./assets/skf-logo.png";

import { useEffect, useState } from "react";
import "./App.css";

import { getMembers } from "./Services/memberService";
import { getMemberTechniques } from "./Services/techniqueService";
import { getMemberProgress } from "./Services/progressServices";
import { useMsal } from "@azure/msal-react";


function App() {
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [outstandingTechniques, setOutstandingTechniques] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const { accounts, instance } = useMsal();
  const isAuthenticated = accounts.length > 0;
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [techniqueNotes, setTechniqueNotes] = useState<Record<string, string>>({});

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

useEffect(() => {
  const savedNotes =
    localStorage.getItem(
      "member-technique-notes"
    );

  console.log(
    "Loading notes",
    savedNotes
  );
console.log(
  "Current Notes",
  techniqueNotes
);
  if (savedNotes) {
    setTechniqueNotes(
      JSON.parse(savedNotes)
    );
  }
}, []);

useEffect(() => {
  if (Object.keys(techniqueNotes).length === 0) {
    return;
  }

  localStorage.setItem(
    "member-technique-notes",
    JSON.stringify(techniqueNotes)
  );
}, [techniqueNotes]);

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

useEffect(() => {
if (!isAuthenticated) {
setIsAuthorized(null);
return;
}
async function loadMembers() {
  const currentUser =
    accounts[0]?.username?.toLowerCase();

  const memberData =
    await getMembers();
    console.log("MEMBERS", memberData);
    console.log("USER", currentUser);

  const member =
    memberData.find(
      (m: any) =>
        m.Email?.toLowerCase() ===
        currentUser
    );

  if (!member) {
    setIsAuthorized(false);
    return;
  }

  setIsAuthorized(true);

  setSelectedMember(member);

  await loadTechniques(
    member.rowKey
  );

  await loadProgress(
    member.rowKey
  );
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
        Sign in to access the Member Dashboard
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
      <h1>Kung Fu Member's Dashboard</h1>
      <p>Loading...</p>
    </div>
  );
}

if (isAuthorized === false) {
  return (
    <div className="instructor-container">
      <h1>
        Kung Fu Member's Dashboard
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
    Kung Fu Member's Dashboard
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
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        marginBottom: "15px",
                      }}
                    >
                          <span>
                            {String(
                              technique.Name
                            ).replace(/"/g, "")}
                          </span>
                          <textarea
                              placeholder="Add personal notes..."
                              rows={1}
                              value={techniqueNotes[technique.rowKey] || ""}
                              style={{
                                width: "100%",
                                marginTop: "8px",
                                minHeight: "32px",
                                overflow: "hidden",
                                resize: "none"
                              }}
                            onInput={(e) => {
                              e.currentTarget.style.height = "auto";
                              e.currentTarget.style.height =
                              e.currentTarget.scrollHeight + "px";
                              }}
                            onChange={(e) => {
                            console.log("Updating",technique.rowKey, e.target.value);
                            setTechniqueNotes(prev => ({...prev, [technique.rowKey]: e.target.value
                            }));
                            }}
                            />
                          </li>
                      )
                    )}
                  </ul>
                </div>
              ))}
          </div>
        </>
      )}
  </div>
  )}

export default App;

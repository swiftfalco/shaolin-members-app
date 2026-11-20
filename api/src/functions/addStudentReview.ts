import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import {
  TableClient,
  AzureNamedKeyCredential,
} from "@azure/data-tables";
function normalizeQuotes(
  value: unknown
): string {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .replace(/^"+|"+$/g, "");
}

export async function addStudentReview(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {

  const body = (await request.json()) as {
    memberId: string;
    techniqueId: string;
    instructorInitials: string;
  };
const memberId =
  normalizeQuotes(
    body.memberId
  );

const techniqueId =
  normalizeQuotes(
    body.techniqueId
  );

  const account = process.env.STORAGE_ACCOUNT!;
  const key = process.env.STORAGE_KEY!;

  const credential =
    new AzureNamedKeyCredential(
      account,
      key
    );

  const reviewsClient =
    new TableClient(
      `https://${account}.table.core.windows.net`,
      "StudentReviews",
      credential
    );

  const techniquesClient =
    new TableClient(
      `https://${account}.table.core.windows.net`,
      "Techniques",
      credential
    );

  const membersClient =
    new TableClient(
      `https://${account}.table.core.windows.net`,
      "Members",
      credential
    );

  const sashClient =
    new TableClient(
      `https://${account}.table.core.windows.net`,
      "SashLevels",
      credential
    );

  //
  // Save Review
  //

  await reviewsClient.upsertEntity({
partitionKey: memberId,
rowKey: techniqueId,
    InstructorInitials:
      body.instructorInitials,
    ReviewDate:
      new Date().toISOString(),
  });

//
// Calculate Current Points
//

const reviewedIds: string[] = [];

for await (
  const review of reviewsClient.listEntities()
) {

  const reviewPartitionKey =
    String(
      (review as any).partitionKey ??
      (review as any).PartitionKey ??
      ""
    );

  const reviewRowKey =
    String(
      (review as any).rowKey ??
      (review as any).RowKey ??
      ""
    );

 if (
normalizeQuotes(
reviewPartitionKey
) === memberId
) {

    reviewedIds.push(
normalizeQuotes(
reviewRowKey
)
);

  }
}

let currentPoints = 0;

for await (
  const technique of
  techniquesClient.listEntities()
) {

const techniqueId =
normalizeQuotes(
(technique as any).rowKey ??
(technique as any).RowKey
);

  if (
    reviewedIds.includes(
      techniqueId
    )
  ) {

    const points =
      Number(
        String(
          (technique as any)
            .Points ?? 0
        ).replace(/"/g, "")
      );

    currentPoints += points;
  }
}

  //
  // Load Sash Levels
  //

  const sashLevels: any[] = [];

  for await (
    const sash of
    sashClient.listEntities()
  ) {

    sashLevels.push({
      sash:
        String(
          (sash as any)
            .rowKey ??
          (sash as any)
            .RowKey
        ).replace(/"/g, ""),

      minPoints:
        Number(
          String(
            (sash as any)
              .MinPoints ?? 0
          ).replace(
            /"/g,
            ""
          )
        )
    });
  }

  sashLevels.sort(
    (a, b) =>
      a.minPoints -
      b.minPoints
  );

  //
  // Determine Earned Sash
  //

  let earnedSash =
    sashLevels[0].sash;

  for (
    const sash of
    sashLevels
  ) {

    if (
      currentPoints >=
      sash.minPoints
    ) {
      earnedSash =
        sash.sash;
    }
  }
earnedSash =
normalizeQuotes(
earnedSash
);

//
// Load Member
//

context.log(
  "Member lookup RK:",
  body.memberId
);

let memberResponse: any = null;

for await (const member of membersClient.listEntities()) {

 if (
normalizeQuotes(
member.rowKey
) === memberId
) {

    memberResponse = member;
    break;
  }
}

if (!memberResponse) {
  throw new Error(
    `Member not found: ${body.memberId}`
  );
}
context.log(
  "MEMBER RECORD",
  memberResponse
);
const member: any = {
  ...memberResponse,
};

const previousSash =
normalizeQuotes(
member.CurrentSash
);

const promoted =
  previousSash !==
  earnedSash;

//
// Update CurrentSash
//
context.log(
  "Updating member",
  {
    partitionKey: member.partitionKey,
    rowKey: member.rowKey,
    CurrentSash: earnedSash
  }
);
if (promoted) {

await membersClient.updateEntity(
{
partitionKey: member.partitionKey,
rowKey: member.rowKey,
CurrentSash: earnedSash,
},
"Merge"
);

  member.CurrentSash =
    earnedSash;
}
``

  //
  // Return Result
  //
context.log(
  "Promotion Result",
  {
    promoted,
    previousSash,
    earnedSash,
    currentPoints
  }
);
  return {
    status: 200,

    jsonBody: {
      success: true,

      promoted,

      memberName:
        `${member.FirstName}
         ${member.LastName}`,

      previousSash,

      newSash:
        earnedSash,

      currentPoints,
    },
  };
}

app.http(
  "addStudentReview",
  {
    methods: ["POST"],
    authLevel: "anonymous",
    handler:
      addStudentReview,
  }
);
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

export async function getMemberProgress(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {

  const memberId = request.query.get("memberId");

  const account = process.env.STORAGE_ACCOUNT!;
  const key = process.env.STORAGE_KEY!;

  const credential = new AzureNamedKeyCredential(
    account,
    key
  );

  const techniquesClient = new TableClient(
    `https://${account}.table.core.windows.net`,
    "Techniques",
    credential
  );

  const reviewsClient = new TableClient(
    `https://${account}.table.core.windows.net`,
    "StudentReviews",
    credential
  );

  const sashClient = new TableClient(
    `https://${account}.table.core.windows.net`,
    "SashLevels",
    credential
  );

  const reviewedIds: string[] = [];

  for await (const review of reviewsClient.listEntities()) {

    const partitionKey = String(
      (review as any).partitionKey ??
      (review as any).PartitionKey
    ).replace(/"/g, "");

    const rowKey = String(
      (review as any).rowKey ??
      (review as any).RowKey
    ).replace(/"/g, "");

    if (
      partitionKey ===
      String(memberId).replace(/"/g, "")
    ) {
      reviewedIds.push(rowKey);
    }
  }

  let currentPoints = 0;

  for await (const technique of techniquesClient.listEntities()) {

    const techniqueId = String(
      (technique as any).rowKey ??
      (technique as any).RowKey
    ).replace(/"/g, "");

    if (reviewedIds.includes(techniqueId)) {

      currentPoints += Number(
        String(
          (technique as any).Points ?? 0
        ).replace(/"/g, "")
      );
    }
  }

  const sashLevels: any[] = [];

  for await (const sash of sashClient.listEntities()) {

    sashLevels.push({
      sash: String(
        (sash as any).rowKey ??
        (sash as any).RowKey
      ).replace(/"/g, ""),

      minPoints: Number(
        String(
          (sash as any).MinPoints ?? 0
        ).replace(/"/g, "")
      )
    });
  }

  sashLevels.sort(
    (a, b) => a.minPoints - b.minPoints
  );

  let currentSash = "Grey";
  let nextSash = "Black";
  let pointsNeeded = 0;

  for (let i = 0; i < sashLevels.length; i++) {

    const sash = sashLevels[i];

    if (currentPoints >= sash.minPoints) {

      currentSash = sash.sash;

      if (i < sashLevels.length - 1) {

        nextSash =
          sashLevels[i + 1].sash;

        pointsNeeded =
          sashLevels[i + 1].minPoints -
          currentPoints;
      }
    }
  }

  return {
    jsonBody: {
      currentPoints,
      currentSash,
      nextSash,
      pointsNeeded,
    },
  };
}

app.http("getMemberProgress", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getMemberProgress,
});
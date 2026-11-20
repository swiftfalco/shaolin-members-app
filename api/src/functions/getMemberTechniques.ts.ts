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

export async function getMemberTechniques(
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

  const techniques: any[] = [];

  for await (const technique of techniquesClient.listEntities()) {
    techniques.push(technique);
  }

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

    const selectedMemberId = String(memberId)
      .replace(/"/g, "");

    if (partitionKey === selectedMemberId) {
      reviewedIds.push(rowKey);
    }
  }

  const reviewed = techniques.filter((technique) => {
    const techniqueId = String(
      (technique as any).rowKey ??
      (technique as any).RowKey
    ).replace(/"/g, "");

    return reviewedIds.includes(techniqueId);
  });

  const outstanding = techniques.filter((technique) => {
    const techniqueId = String(
      (technique as any).rowKey ??
      (technique as any).RowKey
    ).replace(/"/g, "");

    return !reviewedIds.includes(techniqueId);
  });

  return {
    jsonBody: {
      memberId,
      reviewedIds,
      reviewed,
      outstanding,
    },
  };
}

app.http("getMemberTechniques", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getMemberTechniques,
});
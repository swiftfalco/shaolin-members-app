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

export async function getMemberTechniqueNotes(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const memberId =
    request.query.get("memberId");

  if (!memberId) {
    return {
      status: 400,
      jsonBody: {
        error: "memberId required",
      },
    };
  }

  const account =
    process.env.STORAGE_ACCOUNT!;

  const key =
    process.env.STORAGE_KEY!;

  const credential =
    new AzureNamedKeyCredential(
      account,
      key
    );

  const client =
    new TableClient(
      `https://${account}.table.core.windows.net`,
      "MemberTechniqueNotes",
      credential
    );

  const notes: any[] = [];

  for await (
    const entity of client.listEntities()
  ) {
    const partitionKey = String(
      (entity as any).partitionKey ??
      (entity as any).PartitionKey
    ).replace(/"/g, "");

    if (
      partitionKey === memberId
    ) {
      notes.push({
        techniqueId: String(
          (entity as any).rowKey ??
          (entity as any).RowKey
        ).replace(/"/g, ""),
        notes:
          (entity as any).Notes ?? "",
      });
    }
  }

  return {
    jsonBody: notes,
  };
}

app.http(
  "getMemberTechniqueNotes",
  {
    methods: ["GET"],
    authLevel: "anonymous",
    handler:
      getMemberTechniqueNotes,
  }
);
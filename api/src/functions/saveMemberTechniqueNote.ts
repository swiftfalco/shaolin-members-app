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

export async function saveMemberTechniqueNote(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {

  const body: any =
    await request.json();

  const memberId =
    body.memberId;

  const techniqueId =
    body.techniqueId;

  const notes =
    body.notes ?? "";

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

  await client.upsertEntity({
    partitionKey: memberId,
    rowKey: techniqueId,
    Notes: notes,
  });

  return {
    jsonBody: {
      success: true,
    },
  };
}

app.http(
  "saveMemberTechniqueNote",
  {
    methods: ["POST"],
    authLevel: "anonymous",
    handler:
      saveMemberTechniqueNote,
  }
);
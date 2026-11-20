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

export async function getMembers(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const account = process.env.STORAGE_ACCOUNT!;
  const key = process.env.STORAGE_KEY!;

  const credential = new AzureNamedKeyCredential(
    account,
    key
  );

  const client = new TableClient(
    `https://${account}.table.core.windows.net`,
    "Members",
    credential
  );

  const members: any[] = [];

  for await (const member of client.listEntities()) {
    members.push(member);
  }

  return {
    jsonBody: members,
  };
}

app.http("getMembers", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getMembers,
});
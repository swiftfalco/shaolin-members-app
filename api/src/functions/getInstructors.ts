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

export async function getInstructors(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {

  const account = process.env.STORAGE_ACCOUNT!;
  const key = process.env.STORAGE_KEY!;

  const credential =
    new AzureNamedKeyCredential(
      account,
      key
    );

  const client = new TableClient(
    `https://${account}.table.core.windows.net`,
    "Instructors",
    credential
  );

  const instructors: any[] = [];

  for await (const instructor of client.listEntities()) {
    instructors.push(instructor);
  }

  return {
    jsonBody: instructors,
  };
}

app.http("getInstructors", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getInstructors,
});
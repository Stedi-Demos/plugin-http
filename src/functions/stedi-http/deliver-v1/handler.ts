import {
  successResponse,
  StediPluginInvocationEventBase,
  StediPluginInvocationResult,
} from "@stedi/integrations-sdk/plugins";

type StediPluginEvent = StediPluginInvocationEventBase & {
  credentials: {
    headers: Record<string, string>;
  };
  parameters: {
    url: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    return?: "BODY_ONLY" | "RESPONSE";
    headers?: Record<string, string>;
  };
  input: object | string | null;
};

export const handler = async (
  event: StediPluginEvent
): Promise<StediPluginInvocationResult> => {
  console.log(JSON.stringify(event, null, 2));
  const {
    input,
    credentials: { headers: authHeaders },
    parameters: { url, headers, method, return: returnType },
  } = event;

  const noBodyAllowed = ["GET", "HEAD"].includes(method);

  const requestBody = noBodyAllowed
    ? undefined
    : typeof input === "string"
    ? input
    : JSON.stringify(input);

  const requestURL = new URL(url).toString();
  const result = await fetch(requestURL, {
    method,
    headers: {
      ...authHeaders,
      ...headers,
    },
    body: requestBody,
  });

  const responseBody = result.headers.get("Content-Type")?.includes("json")
    ? await result.json()
    : await result.text();

  return successResponse({
    invocationIds: event,
    output: [
      returnType === "BODY_ONLY"
        ? responseBody
        : {
            statusCode: result.status,
            headers: Object.fromEntries(result.headers.entries()),
            body: responseBody,
          },
    ],
  });
};

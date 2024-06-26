import {
  successResponse,
  StediPluginInvocationEventBase,
  StediPluginInvocationResult,
} from "@stedi/integrations-sdk/plugins";
import fetch from "node-fetch";

type NoAuth = {
  type: "NONE";
};

type HeaderAuth = {
  type: "HEADER";
  headers: Record<string, string>;
};

type OAUTH2 = {
  type: "OAUTH2";
  authorizationEndpoint: string;
  authorizationMethod: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  clientId: string;
  clientSecret: string;
  grantType: "client_credentials";
};

type StediPluginEvent = StediPluginInvocationEventBase & {
  credentials: NoAuth | HeaderAuth | OAUTH2;
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
  const {
    input,
    credentials,
    parameters: { url, headers, method, return: returnType },
  } = event;

  const noBodyAllowed = ["GET", "HEAD"].includes(method);

  const requestBody = noBodyAllowed
    ? undefined
    : typeof input === "string"
    ? input
    : JSON.stringify(input);

  const authHeaders = await handleAuth(credentials);

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

const handleAuth = async (credentials: NoAuth | HeaderAuth | OAUTH2) => {
  if (credentials.type === "NONE") return {};
  else if (credentials.type === "HEADER") return credentials.headers;
  else if (credentials.type === "OAUTH2") {
    const basicAuth = Buffer.from(
      `${credentials.clientId}:${credentials.clientSecret}`
    ).toString("base64");

    const response = await fetch(credentials.authorizationEndpoint, {
      method: credentials.authorizationMethod,
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    // Parse the JSON response
    if (!response.ok)
      throw new Error(
        "Failed to exchange client credentials for access token."
      );
    const data = (await response.json()) as any;

    return {
      Authorization: `Bearer ${data.access_token}`,
    };
  }
};

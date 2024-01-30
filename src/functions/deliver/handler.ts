type StediPluginEvent = {
  invocationId: string;
  configurationId: string;
  operationName: string;
  namespace: string;
  credentials: {
    headers: Record<string, string>;
  };
  parameters: {
    baseURL: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    path: string;
  };
  input: object | string | null;
};

type StediPluginResult = {
  invocationId: string;
  configurationId: string;
  operationName: string;
  namespace: string;
  status: "SUCCESS" | "ERROR";
  output: {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  }[];
  logs?: any[];
};

export const handler = async (
  event: StediPluginEvent
): Promise<StediPluginResult> => {
  console.log(JSON.stringify(event, null, 2));
  const {
    invocationId,
    configurationId,
    namespace,
    operationName,
    input,
    credentials: { headers },
    parameters: { baseURL, path, method },
  } = event;

  const url = new URL(path, baseURL).toString();
  const result = await fetch(url, {
    method,
    headers,
    body: typeof input === "string" ? input : JSON.stringify(input),
  });

  const invocationResponse: StediPluginResult = {
    invocationId,
    configurationId,
    namespace,
    operationName,
    status: result.ok ? "SUCCESS" : "ERROR",
    output: [
      {
        statusCode: result.status,
        headers: Object.fromEntries(result.headers.entries()),
        body: await result.text(),
      },
    ],
  };

  console.log(JSON.stringify(invocationResponse, null, 2));
  return invocationResponse;
};

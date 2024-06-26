import test from "ava";
import nock from "nock";
import { handler } from "../handler.js";

test.before(() => nock.disableNetConnect());

test.serial("calls uses supplied headers for auth on request", async (t) => {
  nock("https://api.spotify.com", {
    reqheaders: {
      Authorization: "API 123",
      "X-Custom-Header": "hello",
    },
  })
    .get("/v1/artists/0AuW7OCyKfFrsMbtHrYgIV")
    .reply(200, {
      name: "House Of Pain",
      type: "artist",
      uri: "spotify:artist:0AuW7OCyKfFrsMbtHrYgIV",
    });

  const result = await handler({
    invocationId: "test-123",
    namespace: "http",
    operationName: "deliver",
    configurationId: "default",
    credentials: {
      type: "HEADER",
      headers: {
        Authorization: "API 123",
      },
    },
    parameters: {
      url: "https://api.spotify.com/v1/artists/0AuW7OCyKfFrsMbtHrYgIV",
      method: "GET",
      headers: {
        "X-Custom-Header": "hello",
      },
    },
    input: {},
  });

  t.like(result.output?.[0], {
    statusCode: 200,
    body: {
      name: "House Of Pain",
      type: "artist",
      uri: "spotify:artist:0AuW7OCyKfFrsMbtHrYgIV",
    },
  });
});

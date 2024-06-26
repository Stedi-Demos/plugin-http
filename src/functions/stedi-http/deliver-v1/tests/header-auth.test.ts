import test from "ava";
import nock from "nock";
import { handler } from "../handler.js";

test.before(() => nock.disableNetConnect());

test.serial("calls oauth endpoint to swap credentials", async (t) => {
  const clientId = "Abc";
  const clientSecret = "123";
  nock("https://accounts.spotify.com", {
    reqheaders: {
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
  })
    .post("/api/token")
    .reply(200, { access_token: "SHHIMATOKEN" });

  nock("https://api.spotify.com", {
    reqheaders: {
      Authorization: `Bearer SHHIMATOKEN`,
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
      type: "OAUTH2",
      authorizationEndpoint: "https://accounts.spotify.com/api/token",
      authorizationMethod: "POST",
      clientId,
      clientSecret,
      grantType: "client_credentials",
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

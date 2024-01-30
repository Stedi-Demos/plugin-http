import test from "ava";
import { handler } from "../handler.js";
const event = {}; // TODO: replace with your event

test.serial("handler executes successfully", async (t) => {
  const result = await handler(event);

  console.dir(result, { depth: null });

  t.pass(); // TODO: replace with your assertions
});

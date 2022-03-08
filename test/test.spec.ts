import test, { before } from "ava";
import express from "express";
import AbortController from "abort-controller";
import crossFetch from "cross-fetch";

const nodeFetchPolyfill = () => crossFetch;

import haxan, { HaxanErrorType } from "../src/index";
import {
  ReadStream,
  createWriteStream,
  existsSync,
  readFileSync,
  unlinkSync,
} from "fs";
import { HTTPMethod, ResponseType } from "../src/types";

function reflectBody(req: express.Request, res: express.Response) {
  console.log("Received request body", req.body);
  res.json(req.body);
}

before(() => {
  express()
    .use(express.json())
    .get("/headers", (req, res) => {
      res.json(req.headers);
    })
    .get("/no-response", () => {
      console.log("Not gonna respond");
    })
    .use("/method", (req, res) => {
      res.send(req.method);
    })
    .post("/", reflectBody)
    .patch("/", reflectBody)
    .put("/", reflectBody)
    .listen(8080, () => {
      console.error("Started Haxan test server");
    });
});

test.serial("200", async (t) => {
  const url = "https://jsonplaceholder.typicode.com/todos/1";
  const result = await haxan(url, nodeFetchPolyfill)
    .param("query", "hello")
    .param("page", 4)
    .request();

  if (result.ok) {
    const response = result.val;
    t.is(response.status, 200);
    t.is(response.ok, true);
  } else {
    t.fail();
  }
});

test.serial("404", async (t) => {
  const url = "https://jsonplaceholder.typicode.com/todos/15125125";
  const result = await haxan(url, nodeFetchPolyfill)
    .param("query", "hello")
    .param("page", 4)
    .request();

  if (result.ok) {
    const response = result.val;
    t.is(response.status, 404);
    t.is(response.ok, false);
  } else {
    t.fail();
  }
});

test.serial("Network error", async (t) => {
  const url = "https://.typicode.com/todos/15125125";
  const result = await haxan(url, nodeFetchPolyfill)
    .param("query", "hello")
    .param("page", 4)
    .request();
  t.assert(result.err);

  if (result.err) {
    const error = result.val;
    t.is(error.getType(), HaxanErrorType.NetworkError);
    t.is(error.getOriginalError()?.name, "FetchError");
  } else {
    t.fail();
  }
});

const testBody = { name: "test!", number: 4 };

test.serial("Send raw body", async (t) => {
  const body = JSON.stringify(testBody);
  const url = "http://localhost:8080/";
  const result = await haxan<typeof testBody>(url, nodeFetchPolyfill)
    .post(body)
    .request();

  if (result.ok) {
    const response = result.val;
    t.is(response.status, 200);
    t.is(response.ok, true);
    t.deepEqual(response.data, testBody);
    t.is(response.headers["content-type"].startsWith("application/json"), true);
  } else {
    t.fail();
  }
});

test.serial("Send post body as object", async (t) => {
  const body = testBody;
  const url = "http://localhost:8080/";
  const result = await haxan<typeof body>(url, nodeFetchPolyfill)
    .post(body)
    .request();

  if (result.ok) {
    const response = result.val;
    t.is(response.status, 200);
    t.is(response.ok, true);
    t.deepEqual(response.data, body);
    t.is(response.headers["content-type"].startsWith("application/json"), true);
  } else {
    t.fail();
  }
});

function downloadFile(source: ReadStream, output: string) {
  return new Promise((done, reject) => {
    const writer = createWriteStream(output);
    writer.on("error", (err) => {
      console.error(err);
      reject();
    });
    writer.on("close", done);
    source.pipe(writer);
  });
}

test.serial("Download file", async (t) => {
  const url = "https://jsonplaceholder.typicode.com/todos/1";
  const result = await haxan<ReadStream>(url, nodeFetchPolyfill)
    .type(haxan.ResponseType.Stream)
    .send();

  if (result.ok) {
    const response = result.val;
    t.is(response.status, 200);
    t.is(response.ok, true);
    const file = "test.json";
    await downloadFile(response.data, file);
    t.is(existsSync(file), true);
    t.is(JSON.parse(readFileSync(file, "utf-8")).id, 1);
    unlinkSync(file);
  } else {
    t.fail();
  }
});

test.serial("Timeout", async (t) => {
  const url = "http://localhost:8080/no-response";

  const result = await haxan(url, nodeFetchPolyfill).timeout(2000).request();

  if (result.err) {
    const error = result.val;
    t.is(error.getType(), HaxanErrorType.Timeout);
  } else {
    t.fail();
  }
});

test.serial("Abort", async (t) => {
  const abortController = new AbortController();
  setTimeout(() => {
    abortController.abort();
  }, 2000);

  const url = "http://localhost:8080/no-response";
  const result = await haxan(url, nodeFetchPolyfill)
    .abort(abortController.signal)
    .request();

  if (result.err) {
    const error = result.val;
    t.is(error.getType(), HaxanErrorType.Abort);
  } else {
    t.fail();
  }
});

test.serial("Send patch body", async (t) => {
  const body = { name: "test!", number: 4 };
  const url = "http://localhost:8080/";
  const result = await haxan<typeof body>(url, nodeFetchPolyfill)
    .patch(body)
    .request();

  if (result.ok) {
    const response = result.val;
    t.is(response.status, 200);
    t.is(response.ok, true);
    t.deepEqual(response.data, body);
    t.is(response.headers["content-type"].startsWith("application/json"), true);
  } else {
    t.fail();
  }
});

test.serial("Send delete", async (t) => {
  const url = "http://localhost:8080/method";
  const result = await haxan(url, nodeFetchPolyfill).delete().request();

  if (result.ok) {
    const response = result.val;
    t.assert(response.ok);
    t.is(response.data, HTTPMethod.Delete);
  } else {
    t.fail();
  }
});

test.serial("Send get", async (t) => {
  const url = "http://localhost:8080/method";
  const result = await haxan(url, nodeFetchPolyfill).get().request();

  if (result.ok) {
    const response = result.val;
    t.assert(response.ok);
    t.is(response.data, HTTPMethod.Get);
  } else {
    t.fail();
  }
});

test.serial("Send head", async (t) => {
  const url = "http://localhost:8080/method";
  const result = await haxan(url, nodeFetchPolyfill).head().request();

  if (result.ok) {
    const response = result.val;
    t.assert(response.ok);
    // Express returns empty response body, because it's a HEAD request
    t.is(response.data, "");
  } else {
    t.fail();
  }
});

test.serial("Send options", async (t) => {
  const url = "http://localhost:8080/method";
  const result = await haxan(url, nodeFetchPolyfill).options().request();

  if (result.ok) {
    const response = result.val;
    t.assert(response.ok);
    t.is(response.data, HTTPMethod.Options);
  } else {
    t.fail();
  }
});

test.serial("Send put body", async (t) => {
  const body = { name: "test!", number: 4 };
  const url = "http://localhost:8080/";
  const result = await haxan<typeof body>(url, nodeFetchPolyfill)
    .put(body)
    .request();

  if (result.ok) {
    const response = result.val;
    t.is(response.status, 200);
    t.is(response.ok, true);
    t.deepEqual(response.data, body);
    t.is(response.headers["content-type"].startsWith("application/json"), true);
  } else {
    t.fail();
  }
});

test.serial("Send empty body", async (t) => {
  const url = "http://localhost:8080/";
  const result = await haxan(url, nodeFetchPolyfill).post(null).request();

  if (result.ok) {
    const response = result.val;
    t.is(response.status, 200);
    t.is(response.ok, true);
    t.deepEqual(response.data, {});
    t.is(response.headers["content-type"].startsWith("application/json"), true);
  } else {
    t.fail();
  }
});

test.serial("Send header", async (t) => {
  const url = "http://localhost:8080/headers";
  const headerKey = "x-test";
  const headerValue = "12345";
  const result = await haxan<Record<string, string>>(url, nodeFetchPolyfill)
    .header(headerKey, headerValue)
    .request();

  if (result.ok) {
    const response = result.val;
    t.is(response.status, 200);
    t.is(response.ok, true);
    t.is(response.data[headerKey], headerValue);
  } else {
    t.fail();
  }
});

test.serial("Send post body, retrieve as .text()", async (t) => {
  const body = { name: "test!", number: 4 };
  const url = "http://localhost:8080/";
  const result = await haxan<string>(url, nodeFetchPolyfill)
    .post(body)
    .type(ResponseType.Text)
    .request();

  if (result.ok) {
    const response = result.val;
    t.is(response.status, 200);
    t.is(response.ok, true);
    t.deepEqual(response.data, JSON.stringify(body));
    t.is(response.headers["content-type"].startsWith("application/json"), true);
  } else {
    t.fail();
  }
});

test.serial("Send post body, retrieve as .json()", async (t) => {
  const body = { name: "test!", number: 4 };
  const url = "http://localhost:8080/";
  const result = await haxan<typeof body>(url, nodeFetchPolyfill)
    .post(body)
    .type(ResponseType.Json)
    .request();

  if (result.ok) {
    const response = result.val;
    t.is(response.status, 200);
    t.is(response.ok, true);
    t.deepEqual(response.data, body);
    t.is(response.headers["content-type"].startsWith("application/json"), true);
  } else {
    t.fail();
  }
});

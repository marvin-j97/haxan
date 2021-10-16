import test, { before } from "ava";
import express from "express";
import AbortController from "abort-controller";
import crossFetch from "cross-fetch";

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
  const res = await haxan(url, crossFetch)
    .param("query", "hello")
    .param("page", 4)
    .request();

  t.is(res.status, 200);
  t.is(res.ok, true);
});

test.serial("404", async (t) => {
  const url = "https://jsonplaceholder.typicode.com/todos/15125125";
  const res = await haxan(url, crossFetch)
    .param("query", "hello")
    .param("page", 4)
    .request();

  t.is(res.status, 404);
  t.is(res.ok, false);
});

test.serial("Network error", async (t) => {
  t.plan(2);

  try {
    const url = "https://.typicode.com/todos/15125125";
    await haxan(url, crossFetch)
      .param("query", "hello")
      .param("page", 4)
      .request();
  } catch (error) {
    t.is(error.getType(), HaxanErrorType.NetworkError);
    t.is(error.getOriginalError()?.name, "FetchError");
  }
});

const testBody = { name: "test!", number: 4 };

test.serial("Send raw body", async (t) => {
  const body = JSON.stringify(testBody);
  const url = "http://localhost:8080/";
  const res = await haxan<typeof testBody>(url, crossFetch)
    .post(body)
    .request();
  t.is(res.status, 200);
  t.is(res.ok, true);
  t.deepEqual(res.data, testBody);
  t.is(res.headers["content-type"].startsWith("application/json"), true);
});

test.serial("Send post body as object", async (t) => {
  const body = testBody;
  const url = "http://localhost:8080/";
  const res = await haxan<typeof body>(url, crossFetch).post(body).request();
  t.is(res.status, 200);
  t.is(res.ok, true);
  t.deepEqual(res.data, body);
  t.is(res.headers["content-type"].startsWith("application/json"), true);
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
  const res = await haxan<ReadStream>(url, crossFetch)
    .type(haxan.ResponseType.Stream)
    .send();
  t.is(res.status, 200);
  t.is(res.ok, true);
  const file = "test.json";
  await downloadFile(res.data, file);
  t.is(existsSync(file), true);
  t.is(JSON.parse(readFileSync(file, "utf-8")).id, 1);
  unlinkSync(file);
});

test.serial("Timeout", async (t) => {
  const url = "http://localhost:8080/no-response";
  t.plan(1);
  try {
    await haxan(url, crossFetch).timeout(2000).request();
  } catch (error) {
    t.is(error.getType(), HaxanErrorType.Timeout);
  }
});

test.serial("Abort", (t) => {
  return new Promise(async (resolve, reject) => {
    t.plan(1);
    try {
      const abortController = new AbortController();
      setTimeout(() => {
        abortController.abort();
      }, 2000);

      const url = "http://localhost:8080/no-response";
      await haxan(url, crossFetch).abort(abortController.signal).request();
      reject();
    } catch (error) {
      t.is(error.getType(), HaxanErrorType.Abort);
      resolve();
    }
  });
});

test.serial("Send patch body", async (t) => {
  const body = { name: "test!", number: 4 };
  const url = "http://localhost:8080/";
  const res = await haxan<typeof body>(url, crossFetch).patch(body).request();
  t.is(res.status, 200);
  t.is(res.ok, true);
  t.deepEqual(res.data, body);
  t.is(res.headers["content-type"].startsWith("application/json"), true);
});

test.serial("Send delete", async (t) => {
  const url = "http://localhost:8080/method";
  const res = await haxan(url, crossFetch).delete().request();
  t.assert(res.ok);
  t.is(res.data, HTTPMethod.Delete);
});

test.serial("Send get", async (t) => {
  const url = "http://localhost:8080/method";
  const res = await haxan(url, crossFetch).get().request();
  t.assert(res.ok);
  t.is(res.data, HTTPMethod.Get);
});

test.serial("Send head", async (t) => {
  const url = "http://localhost:8080/method";
  const res = await haxan(url, crossFetch).head().request();
  t.assert(res.ok);
  // Express returns empty response body, because it's a HEAD request
  t.is(res.data, "");
});

test.serial("Send options", async (t) => {
  const url = "http://localhost:8080/method";
  const res = await haxan(url, crossFetch).options().request();
  t.assert(res.ok);
  t.is(res.data, HTTPMethod.Options);
});

test.serial("Send put body", async (t) => {
  const body = { name: "test!", number: 4 };
  const url = "http://localhost:8080/";
  const res = await haxan<typeof body>(url, crossFetch).put(body).request();
  t.is(res.status, 200);
  t.is(res.ok, true);
  t.deepEqual(res.data, body);
  t.is(res.headers["content-type"].startsWith("application/json"), true);
});

test.serial("Send empty body", async (t) => {
  const url = "http://localhost:8080/";
  const res = await haxan(url, crossFetch).post(null).request();
  t.is(res.status, 200);
  t.is(res.ok, true);
  t.deepEqual(res.data, {});
  t.is(res.headers["content-type"].startsWith("application/json"), true);
});

test.serial("Use options API", async (t) => {
  const url = "http://localhost:8080/method";
  const res = await haxan(url, crossFetch, { method: "POST" }).request();
  t.assert(res.ok);
  t.is(res.data, HTTPMethod.Post);
});

test.serial("Send header", async (t) => {
  const url = "http://localhost:8080/headers";
  const headerKey = "x-test";
  const headerValue = "12345";
  const res = await haxan<any>(url, crossFetch)
    .header(headerKey, headerValue)
    .request();
  t.is(res.status, 200);
  t.is(res.ok, true);
  t.is(res.data[headerKey], headerValue);
});

test.serial("Send post body, retrieve as .text()", async (t) => {
  const body = { name: "test!", number: 4 };
  const url = "http://localhost:8080/";
  const res = await haxan<string>(url, crossFetch)
    .post(body)
    .type(ResponseType.Text)
    .request();
  t.is(res.status, 200);
  t.is(res.ok, true);
  t.deepEqual(res.data, JSON.stringify(body));
  t.is(res.headers["content-type"].startsWith("application/json"), true);
});

test.serial("Send post body, retrieve as .json()", async (t) => {
  const body = { name: "test!", number: 4 };
  const url = "http://localhost:8080/";
  const res = await haxan<typeof body>(url, crossFetch)
    .post(body)
    .type(ResponseType.Json)
    .request();
  t.is(res.status, 200);
  t.is(res.ok, true);
  t.deepEqual(res.data, body);
  t.is(res.headers["content-type"].startsWith("application/json"), true);
});

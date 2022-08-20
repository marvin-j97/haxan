import { describe, it, expect, beforeAll } from "vitest";
import { App, Request, Response } from "@tinyhttp/app";
import { logger } from "@tinyhttp/logger";
import AbortController from "abort-controller";
import crossFetch from "cross-fetch";
import { json } from "milliparsec";

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

function reflectBody(req: Request, res: Response) {
  console.error("Received request body", req.body);
  res.json(req.body);
}

const app = new App();

beforeAll(() => {
  return new Promise((resolve) => {
    app
      .use((req, _, next) => {
        console.log(req.headers);
        next();
      })
      .use(logger())
      .get("/headers", (req, res) => {
        res.json(req.headers);
      })
      .get("/no-response", () => {
        console.error("Not gonna respond");
      })
      .use("/method", (req, res) => {
        res.send(req.method);
      })
      .post("/", json(), reflectBody)
      .patch("/", json(), reflectBody)
      .put("/", json(), reflectBody)
      .listen(8080, () => {
        console.error("Started Haxan test server");
        resolve();
      });
  });
});

const testBody = { name: "test!", number: 4 };

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

describe("haxan requests", () => {
  it("should be OK", async () => {
    const url = "https://jsonplaceholder.typicode.com/todos/1";
    const res = await haxan(url, nodeFetchPolyfill)
      .param("query", "hello")
      .param("page", 4)
      .request();

    expect(res.status).to.equal(200);
    expect(res.ok).to.be.true;
  });

  it("should be 404", async () => {
    const url = "https://jsonplaceholder.typicode.com/todos/15125125";
    const res = await haxan(url, nodeFetchPolyfill)
      .param("query", "hello")
      .param("page", 4)
      .request();

    expect(res.status).to.equal(404);
    expect(res.ok).to.be.false;
  });

  it("should be network error", async () => {
    try {
      const url = "https://.typicode.com/todos/15125125";
      await haxan(url, nodeFetchPolyfill)
        .param("query", "hello")
        .param("page", 4)
        .request();
      throw new Error("should not happen");
    } catch (error) {
      expect(error.getType()).to.equal(HaxanErrorType.NetworkError);
      expect(error.getOriginalError()?.name).to.equal("FetchError");
    }
  });

  it("should send raw body", async () => {
    const body = JSON.stringify(testBody);
    const url = "http://localhost:8080/";
    const res = await haxan<typeof testBody>(url, nodeFetchPolyfill)
      .post(body)
      .request();
    expect(res.status).to.equal(200);
    expect(res.ok).to.be.true;
    expect(res.data).to.deep.equal(testBody);
    expect(res.headers["content-type"])
      .is.a("string")
      .toSatisfy((s: string) => s.startsWith("application/json"));
  });

  it("should send post body as object", async () => {
    const body = testBody;
    const url = "http://localhost:8080/";
    const res = await haxan<typeof body>(url, nodeFetchPolyfill)
      .post(body)
      .request();
    expect(res.status).to.equal(200);
    expect(res.ok).to.be.true;
    expect(res.data).to.deep.equal(body);
    expect(res.headers["content-type"])
      .is.a("string")
      .toSatisfy((s: string) => s.startsWith("application/json"));
  });

  it("should download file", async () => {
    const url = "https://jsonplaceholder.typicode.com/todos/1";
    const res = await haxan<ReadStream>(url, nodeFetchPolyfill)
      .type(haxan.ResponseType.Stream)
      .send();
    expect(res.status).to.equal(200);
    expect(res.ok).to.be.true;
    const file = "test.json";
    await downloadFile(res.data, file);
    expect(existsSync(file)).to.be.true;
    expect(JSON.parse(readFileSync(file, "utf-8")).id).to.equal(1);
    unlinkSync(file);
  });

  it("should timeout", async () => {
    try {
      const url = "http://localhost:8080/no-response";
      await haxan(url, nodeFetchPolyfill).timeout(2000).request();
      throw new Error("should not happen");
    } catch (error) {
      expect(error.getType()).to.equal(HaxanErrorType.Timeout);
    }
  });

  it("should abort", () => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const abortController = new AbortController();
        setTimeout(() => {
          abortController.abort();
        }, 2000);

        const url = "http://localhost:8080/no-response";
        await haxan(url, nodeFetchPolyfill)
          // https://github.com/mysticatea/abort-controller/issues/36
          // @ts-ignore
          .abort(abortController.signal)
          .request();
        reject();
      } catch (error) {
        expect(error.getType()).to.equal(HaxanErrorType.Abort);
        resolve();
      }
    });
  });

  it("should send patch body", async () => {
    const body = { name: "test!", number: 4 };
    const url = "http://localhost:8080/";
    const res = await haxan<typeof body>(url, nodeFetchPolyfill)
      .patch(body)
      .request();
    expect(res.status).to.equal(200);
    expect(res.ok).to.be.true;
    expect(res.data).to.deep.equal(body);
    expect(res.headers["content-type"])
      .is.a("string")
      .toSatisfy((s: string) => s.startsWith("application/json"));
  });

  it("should send delete", async () => {
    const url = "http://localhost:8080/method";
    const res = await haxan(url, nodeFetchPolyfill).delete().request();
    expect(res.status).to.equal(200);
    expect(res.ok).to.be.true;
    expect(res.data).to.equal(HTTPMethod.Delete);
  });

  it("shouls send get", async () => {
    const url = "http://localhost:8080/method";
    const res = await haxan(url, nodeFetchPolyfill).get().request();
    expect(res.status).to.equal(200);
    expect(res.ok).to.be.true;
    expect(res.data).to.equal(HTTPMethod.Get);
  });

  it("shouls send head", async () => {
    const url = "http://localhost:8080/method";
    const res = await haxan(url, nodeFetchPolyfill).head().request();
    expect(res.status).to.equal(200);
    expect(res.ok).to.be.true;
    // Returns empty response body, because it's a HEAD request
    expect(res.data).to.equal("");
  });

  it("shouls send options", async () => {
    const url = "http://localhost:8080/method";
    const res = await haxan(url, nodeFetchPolyfill).options().request();
    expect(res.status).to.equal(200);
    expect(res.ok).to.be.true;
    expect(res.data).to.equal(HTTPMethod.Options);
  });

  it("should send put body", async () => {
    const body = { name: "test!", number: 4 };
    const url = "http://localhost:8080/";
    const res = await haxan<typeof body>(url, nodeFetchPolyfill)
      .put(body)
      .request();
    expect(res.status).to.equal(200);
    expect(res.ok).to.be.true;
    expect(res.data).to.deep.equal(body);
    expect(res.headers["content-type"])
      .is.a("string")
      .toSatisfy((s: string) => s.startsWith("application/json"));
  });

  it("should set header", async () => {
    const url = "http://localhost:8080/headers";
    const headerKey = "X-Test";
    const headerValue = "12345";
    const res = await haxan<any>(url, nodeFetchPolyfill)
      .header(headerKey, headerValue)
      .request();
    expect(res.status).to.equal(200);
    expect(res.ok).to.be.true;
    expect(res.data[headerKey.toLowerCase()]).to.equal(headerValue);
  });

  it("should retrieve body with .text()", async () => {
    const body = { name: "test!", number: 4 };
    const url = "http://localhost:8080/";
    const res = await haxan<string>(url, nodeFetchPolyfill)
      .post(body)
      .type(ResponseType.Text)
      .request();
    expect(res.status).to.equal(200);
    expect(res.ok).to.be.true;
    expect(JSON.parse(res.data)).to.deep.equal(body);
    expect(res.headers["content-type"])
      .is.a("string")
      .toSatisfy((s: string) => s.startsWith("application/json"));
  });

  it("should retrieve body with .json()", async () => {
    const body = { name: "test!", number: 4 };
    const url = "http://localhost:8080/";
    const res = await haxan<typeof body>(url, nodeFetchPolyfill)
      .post(body)
      .type(ResponseType.Json)
      .request();
    expect(res.status).to.equal(200);
    expect(res.ok).to.be.true;
    expect(res.data).to.deep.equal(body);
    expect(res.headers["content-type"])
      .is.a("string")
      .toSatisfy((s: string) => s.startsWith("application/json"));
  });
});

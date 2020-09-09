import test, { before } from "ava";
import express from "express";

import haxan, { ResponseType } from "../src/index";
import {
  ReadStream,
  createWriteStream,
  existsSync,
  readFileSync,
  unlinkSync,
} from "fs";

function reflectBody(req: express.Request, res: express.Response) {
  console.log("Received request body", req.body);
  res.json(req.body);
}

before(() => {
  express().use(express.json()).post("/", reflectBody).listen(8080);
});

test.serial("200", async (t) => {
  const url = "https://jsonplaceholder.typicode.com/todos/1";
  const res = await haxan<string>(url)
    .param("query", "hello")
    .param("page", 4)
    .request();

  t.is(res.status, 200);
  t.is(res.ok, true);
});

test.serial("404", async (t) => {
  const url = "https://jsonplaceholder.typicode.com/todos/15125125";
  const res = await haxan<string>(url)
    .param("query", "hello")
    .param("page", 4)
    .request();

  t.is(res.status, 404);
  t.is(res.ok, false);
});

test.serial("Error", async (t) => {
  t.plan(1);

  try {
    const url = "https://.typicode.com/todos/15125125";
    await haxan<string>(url).param("query", "hello").param("page", 4).request();
  } catch (error) {
    t.is(error.isHaxanError, true);
  }
});

test.serial("Send post body", async (t) => {
  const body = { name: "test!", number: 4 };
  const url = "http://localhost:8080/";
  const res = await haxan<typeof body>(url).post(body).request();
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
  const res = await haxan<ReadStream>(url).type(ResponseType.Stream).send();
  t.is(res.status, 200);
  t.is(res.ok, true);
  const file = "test.json";
  await downloadFile(res.data, file);
  t.is(existsSync(file), true);
  t.is(JSON.parse(readFileSync(file, "utf-8")).id, 1);
  unlinkSync(file);
});

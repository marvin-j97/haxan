import test from "ava";

import haxan from "../src/index";

test("200", async (t) => {
  const url = "https://jsonplaceholder.typicode.com/todos/1";
  const res = await haxan<string>(url)
    .param("query", "hello")
    .param("page", 4)
    .request();

  t.is(res.status, 200);
  t.is(res.ok, true);
});

test("404", async (t) => {
  const url = "https://jsonplaceholder.typicode.com/todos/15125125";
  const res = await haxan<string>(url)
    .param("query", "hello")
    .param("page", 4)
    .request();

  t.is(res.status, 404);
  t.is(res.ok, false);
});

test("Error", async (t) => {
  t.plan(1);

  try {
    const url = "https://.typicode.com/todos/15125125";
    await haxan<string>(url).param("query", "hello").param("page", 4).request();
  } catch (error) {
    t.is(error.isHaxanError, true);
  }
});

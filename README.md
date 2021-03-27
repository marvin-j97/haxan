<h1 align="center">Haxan</h1>

<p align="center">
  <img src="https://badge.fury.io/js/haxan.svg" alt="Build Status">
  <img src="https://github.com/marvin-j97/haxan/workflows/Node.js%20CI/badge.svg" alt="Build Status">
  <img src="https://codecov.io/gh/marvin-j97/haxan/branch/dev/graph/badge.svg" alt="Build Status">
  <img src="https://img.shields.io/david/dotvirus/haxan" alt="Build Status">
  <img src="https://img.shields.io/bundlephobia/minzip/haxan" alt="Build Status">
  <img src="https://img.shields.io/npm/dw/haxan" alt="Build Status">
</p>

Intuitive HTTP client for browsers and Node.js servers.

### Installation

```
npm i haxan
```

Or use the .min.js bundle.

### Examples

Using `GET` to fetch a user from an API

```typescript
import Haxan from "haxan";

interface User {
  id: number;
  name: string;
}

Haxan<User>("http://localhost:3000/api/user/1234")
  .request()
  .then((response) => {
    if (response.ok) {
      // Success!
      console.log(response.data); // Response data -> User
    } else {
      // Some error, but at least we got a response
    }
  })
  .catch((error) => {
    // Connection refused, no response
  });
```

Setting query parameters

```typescript
Haxan<string>("http://google.com/search")
  .param("q", "Elephants") // -> http://google.com/search?q=Elephants
  .request()
  .then((response) => {
    // Handle response
  })
  .catch((error) => {
    // Handle error
  });
```

Sending a JSON payload with `POST`

```typescript
const payload = {
  id: 4,
  user_name: "@testname",
};

Haxan("http://localhost:3000/api/user")
  .post(payload)
  .request()
  .then((response) => {
    // Handle response
  })
  .catch((error) => {
    // Handle error
  });
```

Download a file in Node.js

```typescript
Haxan<fs.ReadStream>("https://bit.ly/3k19d8D")
  .type(Haxan.ResponseType.Stream)
  .send()
  .then((response) => {
    response.data.pipe(fs.createWriteStream("punisher.jpeg"));
  })
  .catch((error) => {
    // Handle error
  });
```

Sending other kinds of content

```typescript
// Use a different Content-Type instead
Haxan("http://localhost:3000/api/note")
  .header("Content-Type", "text/yaml")
  .post(
    `
  ---
  message: I hope this is valid YAML
  `,
  )
  .send()
  .then((response) => {
    // Handle response
  })
  .catch((error) => {
    // Handle error
  });
```

Easily compose requests without complicated option merging (example code)

```typescript
import Haxan, { HaxanFactory } from "haxan";

function signRequest(url: string): HaxanFactory {
  return Haxan(url)
    .header("x-session", getUserSession())
    .header("x-csrf", getCsrfToken());
}

signRequest("/api/v1/endpoint")
  // .header(...) - add more headers if needed
  .post(payload)
  .send()
  .then((response) => {
    // Handle response
  })
  .catch((error) => {
    // Handle error
  });
```

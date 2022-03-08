<h1 align="center">Haxan</h1>

<p align="center">
  <img src="https://badge.fury.io/js/haxan.svg" alt="Version">
  <img src="https://github.com/marvin-j97/haxan/workflows/Node.js%20CI/badge.svg" alt="Build Status">
  <a href="https://codecov.io/gh/marvin-j97/haxan">
    <img src="https://codecov.io/gh/marvin-j97/haxan/branch/dev/graph/badge.svg?token=HG18ZHO57K"/>
  </a>
  <img src="https://img.shields.io/bundlephobia/minzip/haxan" alt="Zipped size">
  <img src="https://img.shields.io/npm/dw/haxan" alt="Downloads">
</p>

Intuitive, isomorphic HTTP client, tailored for Typescript usage.

### Installation

```
npm i haxan
yarn add haxan
pnpm add haxan
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
import Haxan from "haxan";

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
import Haxan from "haxan";

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
import Haxan from "haxan";
import crossFetch from "cross-fetch";

Haxan<fs.ReadStream>("https://bit.ly/3k19d8D", () => crossFetch)
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
import Haxan from "haxan";

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

function signRequest(req: HaxanFactory<T>): HaxanFactory<T> {
  return req
    .header("x-session", getUserSession())
    .header("x-csrf", getCsrfToken());
}

signRequest(Haxan("/api/v1/endpoint"))
  // .header(...) - add more headers to this specific request if needed
  .post(payload)
  .send()
  .then((response) => {
    // Handle response
  })
  .catch((error) => {
    // Handle error
  });
```

Retry failed requests (example)

```typescript
import Haxan from "haxan";

async function withRetries<T>(
  request: HaxanFactory<T>,
  retries = 3,
): Promise<IHaxanResponse<T>> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await request.send();
      if (!res.ok) {
        console.error(
          `Request attempt ${i + 1} failed with status ${res.status}`,
        );
      } else {
        return res;
      }
    } catch (error: any) {
      console.error(`Request attempt ${i + 1} failed: ${error.message}`);
    }
  }
  throw new Error("All retries failed");
}
```

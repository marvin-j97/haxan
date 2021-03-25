# Haxan

Intuitive HTTP client for browsers and Node.js servers.

[![npm version](https://badge.fury.io/js/haxan.svg)](https://badge.fury.io/js/haxan.svg)
![Node.js CI](https://github.com/marvin-j97/haxan/workflows/Node.js%20CI/badge.svg)
[![codecov](https://codecov.io/gh/marvin-j97/haxan/branch/dev/graph/badge.svg)](https://codecov.io/gh/marvin-j97/haxan)
![David](https://img.shields.io/david/dotvirus/haxan)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/haxan)
![npm](https://img.shields.io/npm/dw/haxan)

## Installation

```
npm i haxan
```

Or use the .min.js bundle.

## Examples

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

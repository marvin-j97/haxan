# Haxan

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
      console.log(response.data); // Response data
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
Haxan<string>("http://google.com")
  .param("q", "Elephants") // -> http://google.com/?q=Elephants
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
  .type(haxan.ResponseType.Stream)
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
  .post(`
  ---
    message: I hope this is valid YAML
  `)
  .send()
  .then((response) => {
    // Handle response
  })
  .catch((error) => {
    // Handle error
  });
```

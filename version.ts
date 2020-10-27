const pkg = require("./package.json");
import { VERSION } from "./src/version";

const releaseVersion = process.argv[2];

if (pkg.version === VERSION && VERSION === releaseVersion) {
  console.log("Version OK");
  process.exit(0);
}
console.log("Version mismatch");
process.exit(1);

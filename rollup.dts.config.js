const dts = require("rollup-plugin-dts").default;

const config = {
  input: "build/index.d.ts",
  output: {
    file: "typings/index.d.ts",
    format: "umd",
    name: "Haxan",
  },
  plugins: [dts()],
};

export default config;

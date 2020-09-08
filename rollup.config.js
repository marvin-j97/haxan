import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";

const config = {
  input: "build/index.js",
  output: {
    file: "dist/haxan.js",
    format: "umd",
    name: "Haxan",
  },
  plugins: [commonjs(), resolve()],
};

export default config;

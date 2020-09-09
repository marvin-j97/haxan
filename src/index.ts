import { createHaxanFactory, HaxanFactory } from "./client";
import * as types from "./types";

export default (() => {
  const f = createHaxanFactory;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  f.types = types;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  f.HaxanFactory = HaxanFactory;
  return f as typeof createHaxanFactory & {
    types: typeof types;
    HaxanFactory: typeof HaxanFactory;
  };
})();

export * from "./interfaces";

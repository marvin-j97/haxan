import { createHaxanFactory, HaxanFactory } from "./client";
import * as types from "./types";

export default (() => {
  const f = createHaxanFactory;
  for (const key in types) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    f[key] = types[key];
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  f.HaxanFactory = HaxanFactory;
  return f as typeof createHaxanFactory &
    typeof types & {
      HaxanFactory: typeof HaxanFactory;
    };
})();

export * from "./interfaces";
export { HaxanFactory };

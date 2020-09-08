import {
  createHaxanFactory,
  HaxanError,
  HaxanFactory,
  IHaxanResponse,
} from "./client";

export default (() => {
  const f = createHaxanFactory;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  f.HaxanError = HaxanError;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  f.HaxanFactory = HaxanFactory;
  return f as typeof createHaxanFactory & {
    HaxanError: typeof HaxanError;
    HaxanFactory: typeof HaxanFactory;
  };
})();

export { /*HaxanError, HaxanFactory, */ IHaxanResponse };

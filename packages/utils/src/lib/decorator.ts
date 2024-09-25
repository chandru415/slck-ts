export const Sealed =
  () =>
  (...args: any) => {
    Object.seal(args);
    Object.seal(args.prototype);
  };

export const Frozen =
  () =>
  (...args: any) => {
    Object.freeze(args);
    Object.freeze(args.prototype);
  };

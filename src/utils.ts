// deno-lint-ignore-file no-explicit-any

export type WithRequired<T extends keyof K, K> = K & { [P in T]-?: K[P] };

export type AddParameters<
  TFunction extends (...args: any) => any,
  TParameters extends [...args: any]
> = ( ...args: [...Parameters<TFunction>, ...TParameters]) => ReturnType<TFunction>;

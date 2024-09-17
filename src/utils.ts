type GetLiteral<T extends string, U> = U extends T
  ? T extends U
    ? never
    : U
  : never;

export type ExtractLiterals<T> = T extends infer R ? GetLiteral<string, R> : never;

export type WithRequired<T extends keyof K, K> = K & { [P in T]-?: K[P] };

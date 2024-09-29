export abstract class VariableBase<T = unknown> {
  abstract readonly defaultValue: T;
  abstract readonly type: string;
  constructor(
    readonly name: string,
    readonly label: string,
    readonly raw: string,
  ) {}

  readonly [key: string]: unknown;
}

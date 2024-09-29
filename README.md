# Userstyle parser

## Docs
Read the docs on the [jsr website](https://jsr.io/@wathhr/userstyle-parser/doc)

## Examples
```ts
import { parse } from 'jsr:@wathhr/userstyle-parser';

const result = parse(`/* ==UserStyle==
@name example
@namespace https://example.com/
@version v0.1.0
==/UserStyle== */`);

result.name;    // => example
result.version; // => { major: 0, minor: 1, patch: 0 }
```

## Limitations
- Whitespace is not preserved properly, getting replaced with spaces

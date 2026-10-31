# @lp-labs/react-shadow-editor

An original controlled multiple box-shadow editor with inset, opacity, ordering,
and validated CSS export. React 18.2 or 19 is the only runtime peer; there are
no runtime dependencies.

## Use

```sh
npm install @lp-labs/react-shadow-editor react react-dom
```

In a React application with CSS imports enabled:

```tsx
import { useState } from "react";
import {
  ShadowEditor,
  createShadow,
  shadowToCss,
  validateShadow,
} from "@lp-labs/react-shadow-editor";
import "@lp-labs/react-shadow-editor/styles.css";

export default function App() {
  const [value, setValue] = useState(createShadow);
  return (
    <>
      <ShadowEditor value={value} onChange={setValue} />
      <div style={{ boxShadow: validateShadow(value).length ? "none" : shadowToCss(value) }}>
        Your element
      </div>
    </>
  );
}
```

ESM named imports and CommonJS `require` expose the same API. Import the
`styles.css` subpath separately; JavaScript does not import it. Module import
and server rendering do not touch browser globals.

## Component and complete types

`ShadowEditor(props: ShadowEditorProps)` requires `value: ShadowValue` and
`onChange(next: ShadowValue): void`. Persist each next value; edits do not mutate
the supplied value. Optional props: `disabled?: boolean = false`,
`className?: string = ""`, `style?: React.CSSProperties`, and
`"aria-label"?: string = "Shadow editor"`.

```ts
interface ShadowLayer {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}
interface ShadowValue { layers: ShadowLayer[] }
```

These types and `ShadowEditorProps` are exported. All fields are required.
There may be 0-16 layers. IDs are unique strings of 1-64 characters, used for
React keys rather than CSS. X, Y and spread are finite in [-1000,1000] pixels;
blur is finite in [0,1000] pixels; opacity is finite in [0,1]. Colors must be
six-digit hex RGB strings and inset must be boolean. Negative spread is supported.

## All runtime exports

* `ShadowEditor`: the component above.
* `createShadowLayer(id = "shadow-1"): ShadowLayer`: returns fresh defaults:
  x 0, y 4, blur 12, spread 0, color `"#000000"`, opacity 0.2, inset false.
  Throws `RangeError` for empty or overlong id. Uniqueness is checked on a full
  value, not by this factory.
* `createShadow(): ShadowValue`: returns one fresh default layer.
* `validateShadow(value: ShadowValue): string[]`: returns constraint errors,
  or `[]`. Expects structurally typed data, not arbitrary unknown JSON.
* `shadowToCss(value: ShadowValue): string`: validates and returns a CSS
  **property value**, not a declaration: ordered, comma-separated shadows using
  px lengths and `rgba(r, g, b, opacity)`. The first layer is frontmost. Empty
  layers return `"none"`. Invalid values throw `RangeError`. It never injects
  CSS, writes a file or accesses the clipboard.

These are all runtime exports; no default export or custom error class exists.

## Editing, export and limits

Add shadow creates a fresh default with a unique id. Remove may delete the
last layer, producing `none`. Move forward exchanges a layer with the previous
layer to change stacking order. All layer controls are visible, with finite
number inputs, a hex color text field and an inset checkbox.

Finite intermediate numeric edits and text edits are emitted even when invalid.
The editor announces validation errors and suppresses CSS export until corrected.
The read-only export textarea adds `box-shadow: ` and a semicolon around the
helper's property value. It is selectable text, not an automatic download.
Only validated numbers and hex-derived RGBA colors are serialized; CSS
variables, URLs, functions and arbitrary declarations are rejected.

The preview uses native CSS and may clip very large shadows. This editor
supports box shadows only: no text-shadow, drop-shadow filters, CSS parsing,
color spaces other than RGB, non-pixel lengths, blend modes, animated shadows,
or full design-tool compatibility. No production certification is claimed.

## Customization and accessibility

Styles are scoped to `.lpsh-editor`; override `--lpsh-accent`, pass root `style`,
or use `className`. Layer legends, visible labels, native buttons, inset
checkboxes, keyboard-editable fields, visible focus outlines and announced
errors support keyboard operation. Provide sufficient contrast when changing
colors; the preview also contains text.

[box-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow) |

## License

[MIT](./LICENSE).

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.

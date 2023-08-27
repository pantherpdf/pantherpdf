# Reports

## Development
For development purposes you can use demo project.
```sh
npm run start
```

## Extending with custom widgets
Editor can be extended with custom `Widget`s and `Transform`s. Widgets are
visual building blocks for reports. Transforms are used for transforming
source data before it is consumed by widgets. Checkout property descriptions for
each type for detailed explanation.

Custom widgets have to be specified in `EditorProps` and `GenerateTargetArgs`.

```typescript
import { defaultTransforms, defaultWidgets } from 'reports';
const myCustomWidget: Widget = { /* ... */ };
const myCustomTransform: Transform = { /* ... */ };
const editorProps: EditorProps = {
  widgets: [...defaultWidgets, myCustomWidget],
  transforms: [...defaultTransforms, myCustomTransform],
};
const generateArgs: GenerateTargetArgs = {
  widgets: [...defaultWidgets, myCustomWidget],
  transforms: [...defaultTransforms, myCustomTransform],
};
```

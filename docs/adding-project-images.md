# Adding garden-project images

Selectable projects on the property map have two image positions:

- **Current** for a present-day site or structure photo
- **Envisioned** for an AI-enhanced or illustrated concept based on that photo

Store web-ready images under `assets/projects/`. A consistent naming pattern keeps
the pairs easy to find:

```text
assets/projects/grove-current.jpg
assets/projects/grove-envisioned.jpg
```

Then find the project in `projectContent` near the top of `script.js` and add the
two paths:

```js
grove: {
  kicker: 'The Garden · living project',
  title: 'The Grove',
  currentImage: 'assets/projects/grove-current.jpg',
  envisionedImage: 'assets/projects/grove-envisioned.jpg',
  // copy and list stay here
}
```

Either image can be added independently. Until a path is present, the map keeps
that side of the pair as a labeled placeholder.

## Image preparation

- Use landscape images around a 4:3 ratio.
- Resize large camera files before publishing; 1600 pixels on the long edge is
  enough for this layout.
- Keep the current image documentary. Label the envisioned image clearly as a
  concept rather than a record of existing conditions.
- Do not expose private arrival routes, neighboring properties, or sensitive
  site details in published photos.

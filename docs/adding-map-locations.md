# Adding locations to the regional map

The regional map reads every marker from [`data/locations.geojson`](../data/locations.geojson).
No HTML, SVG, or JavaScript edit is required to add another point.

## Add a place

1. Open `data/locations.geojson`.
2. Copy one complete object inside the `features` array.
3. Give it a unique `id`.
4. Change the coordinates, using `[longitude, latitude]` order.
5. Change the fields inside `properties`.
6. Keep a comma between neighboring Feature objects.
7. Preview the site through a local web server; opening `index.html` directly will
   not load the GeoJSON in some browsers.

Example:

```json
{
  "type": "Feature",
  "id": "new-place",
  "geometry": {
    "type": "Point",
    "coordinates": [-104.9000, 39.1200]
  },
  "properties": {
    "name": "New Place",
    "subtitle": "A short map epithet",
    "category": "curiosity",
    "symbol": "star",
    "description": "What a visitor should know.",
    "directions": "https://www.google.com/maps/search/?api=1&query=39.1200,-104.9000",
    "source": "https://example.com/source",
    "labelDx": 18,
    "labelDy": 8
  }
}
```

## Symbols

Supported values are `banner`, `star`, `water`, `troll`, `rock`, `book`,
`cave`, `mountain`, and `memorial`. An unknown value falls back to `star`.

## Label placement

- `labelDx` moves a label right (positive) or left (negative).
- `labelDy` moves a label down (positive) or up (negative).
- Use `"labelAnchor": "end"` for labels placed to the left of their marker.

## Precision and privacy

Use `publicPrecision` when a point is approximate, represents a district, or
should not be treated as a navigation coordinate. Do not publish private access
routes, camping locations, or sensitive cultural or historic sites without
permission.

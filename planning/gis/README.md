# Merveilles Club conceptual GIS

This directory contains the editable geospatial source and print exports for the
Merveilles Club pre-application site plan at 21085 Capella Drive.

## Files

- `data/parcel-7103005001.geojson` — authoritative parcel polygon retrieved from
  the El Paso County GIS Open Data parcel service.
- `data/naip-parcel-7103005001.tif` — georeferenced public-domain USDA NAIP
  orthophoto used as an offline fallback.
- `data/csu-2024-presentation-retouched.webp` — full-dimension registered presentation copy of
  the publicly displayed 2024 CSU orthophoto. Parked vehicles were removed from
  the driveway; it is not an untouched evidentiary photograph.
- `data/merveilles-club-concept.gpkg` — editable GeoPackage containing parcel,
  25-foot square reference grid, facilities, communal table, parking, and measured
  sanitation-distance layers, plus the owner-identified existing white picket fence
  and driveway gate.
- `exports/merveilles-club-conceptual-site-plan.{jpg,pdf}` — print-ready exhibits.
- `build_merveilles_gis.py` — reproducible build and export script.

The project CRS is **EPSG:2232 — NAD83 / Colorado Central (ftUS)**. Proposed-use
locations were interpreted from aerial imagery and the owner's Apple Maps 3D
reference. They are preliminary and should be replaced by field-collected or
surveyed coordinates before construction or any application requiring engineered
precision.

## Rebuild

Install `geopandas`, `rasterio`, `pyproj`, `shapely`, `matplotlib`, and `numpy`, then:

```bash
python planning/gis/build_merveilles_gis.py
```

The build requests the publicly displayed 2024 El Paso County orthophoto from
Colorado Springs Utilities for the presentation exports and automatically falls
back to the local NAIP GeoTIFF if that service is unavailable. The County's raw
licensed aerial-delivery tile is not redistributed here.

QGIS can open `data/merveilles-club-concept.gpkg` directly and add the GeoTIFF as
an offline basemap. The GeoPackage is the editable source of truth; the JPG and
PDF are presentation exports.

## Utilities

Exact parcel-scale gas and electric alignments are not available in the County's
public GIS layers and are intentionally not inferred from aerial imagery. Obtain
a Colorado 811 locate for utility-owned facilities and a private utility locate
for owner-installed lines before adding utility geometry or performing excavation.

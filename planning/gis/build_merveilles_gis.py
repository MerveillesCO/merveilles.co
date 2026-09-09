#!/usr/bin/env python3
"""Build the editable Merveilles Club conceptual GIS and print exhibit.

Authoritative parcel geometry is stored in EPSG:2232 (NAD83 / Colorado Central,
US survey feet). Proposed-use features are conceptual and must be field verified.
"""

from __future__ import annotations

import json
from io import BytesIO
from pathlib import Path

import geopandas as gpd
import matplotlib.pyplot as plt
import numpy as np
import rasterio
import requests
from PIL import Image
from matplotlib.lines import Line2D
from matplotlib.patches import Patch
from pyproj import Transformer
from shapely.geometry import LineString, Point, Polygon, box, shape


ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
EXPORTS = ROOT / "exports"
CRS = "EPSG:2232"  # NAD83 / Colorado Central (ftUS)


def parcel_xy(u: float, v: float, bounds: tuple[float, float, float, float]):
    """Map normalized west->east, north->south coordinates into parcel bounds."""
    minx, miny, maxx, maxy = bounds
    return minx + u * (maxx - minx), maxy - v * (maxy - miny)


def main() -> None:
    EXPORTS.mkdir(parents=True, exist_ok=True)
    parcel_json = json.loads((DATA / "parcel-7103005001.geojson").read_text())
    parcel_geom = shape(parcel_json["features"][0]["geometry"])
    parcel = gpd.GeoDataFrame(
        [{"parcel": "7103005001", "address": "21085 Capella Dr", "zoning": "RR-5",
          "area_sqft": round(parcel_geom.area, 1), "area_acres": round(parcel_geom.area / 43560, 3)}],
        geometry=[parcel_geom], crs=CRS,
    )
    b = parcel_geom.bounds

    # Locations digitized from the orthophoto and Apple 3D reference. These are
    # intentionally marked preliminary; GPS/survey coordinates should replace them.
    point_specs = [
        ("Campsite 1", "campsite", .79, .22),
        ("Campsite 2", "campsite", .82, .53),
        ("Campsite 3", "campsite", .245, .345),
        ("Barn toilet", "sanitation", .53, .275),
        ("Garage toilet", "sanitation", .34, .52),
        ("Barn", "structure", .53, .32),
        ("House", "structure", .42, .66),
    ]
    facilities = gpd.GeoDataFrame(
        [{"name": n, "feature_type": t, "status": "Preliminary", "geometry": Point(*parcel_xy(u, v, b))}
         for n, t, u, v in point_specs], crs=CRS,
    )

    # The communal table is west of the house, extending north-south for 20 feet.
    # Centered in reference cell J10 (25-foot grid), west of the house.
    tx = b[0] + (9.5 * 25)
    ty = b[3] - (9.5 * 25) - 8  # shift toward the south edge of J10
    table = gpd.GeoDataFrame(
        [{"name": "20-foot communal table", "length_ft": 20, "orientation": "N-S",
          "status": "Preliminary", "geometry": LineString([(tx, ty - 10), (tx, ty + 10)])}], crs=CRS,
    )

    # Conceptual parking court; capacity is operational, not a striped-space count.
    parking_ring = [parcel_xy(u, v, b) for u, v in
                    [(.34, .40), (.63, .40), (.64, .56), (.50, .58), (.45, .52), (.34, .52)]]
    parking = gpd.GeoDataFrame(
        [{"name": "Existing driveway / parking area", "capacity": "Up to 20 vehicles",
          "status": "Conceptual", "geometry": Polygon(parking_ring)}], crs=CRS,
    )

    # Owner-identified existing white picket fence. From the west parcel edge it
    # follows the 6/7 line to J/K, steps north to the 4/5 line, runs east to the
    # middle of O, then returns south to the 6/7 line. A 12-foot opening marks
    # the driveway gate on the J/K segment.
    y_67 = b[3] - (6 * 25)
    y_45 = b[3] - (4 * 25)
    x_jk = b[0] + (10 * 25)
    x_mid_o = b[0] + (14.5 * 25)
    gate_y = (y_45 + y_67) / 2
    gate_half_width = 6
    fence = gpd.GeoDataFrame(
        [
            {"name": "Existing white picket fence", "segment": "west and south",
             "status": "Owner-identified",
             "geometry": LineString([(b[0], b[3]), (b[0], y_67), (x_jk, y_67),
                                     (x_jk, gate_y - gate_half_width)])},
            {"name": "Existing white picket fence", "segment": "north and east",
             "status": "Owner-identified",
             "geometry": LineString([(x_jk, gate_y + gate_half_width), (x_jk, y_45),
                                     (x_mid_o, y_45), (x_mid_o, y_67)])},
        ], crs=CRS,
    )
    gate = gpd.GeoDataFrame(
        [{"name": "Driveway gate", "status": "Owner-identified",
          "geometry": Point(x_jk, gate_y)}], crs=CRS,
    )

    # Twenty-five-foot square reference grid. It produces A-Z across the parcel;
    # the north-south index necessarily continues beyond 10 because the parcel is
    # roughly 629 x 347 feet. Grid coordinates are references, not survey monuments.
    cell = 25.0
    minx, miny, maxx, maxy = b
    grid_rows = []
    for col in range(int(np.ceil((maxx - minx) / cell))):
        for row in range(int(np.ceil((maxy - miny) / cell))):
            geom = box(minx + col * cell, maxy - (row + 1) * cell,
                       minx + (col + 1) * cell, maxy - row * cell).intersection(parcel_geom)
            if not geom.is_empty:
                grid_rows.append({"column": chr(65 + col) if col < 26 else f"X{col+1}",
                                  "row": row + 1, "cell_size_ft": cell, "geometry": geom})
    grid = gpd.GeoDataFrame(grid_rows, crs=CRS)

    # Operational sanitation assignments. All campsites use the barn toilet;
    # the garage toilet serves the house/feast area rather than camping.
    toilets = facilities[facilities.feature_type == "sanitation"]
    camps = facilities[facilities.feature_type == "campsite"]
    barn_toilet = toilets[toilets["name"] == "Barn toilet"].iloc[0]
    distance_rows = []
    for _, camp in camps.iterrows():
        line = LineString([barn_toilet.geometry, camp.geometry])
        distance_rows.append({"from_name": barn_toilet["name"], "to_name": camp["name"],
                              "distance_ft": round(line.length, 1), "geometry": line})
    distances = gpd.GeoDataFrame(distance_rows, crs=CRS)

    gpkg = DATA / "merveilles-club-concept.gpkg"
    if gpkg.exists():
        gpkg.unlink()
    for name, layer in [("parcel", parcel), ("reference_grid_25ft", grid), ("facilities", facilities),
                        ("communal_table", table), ("parking", parking), ("existing_fence", fence),
                        ("existing_gate", gate),
                        ("sanitation_distances", distances)]:
        layer.to_file(gpkg, layer=name, driver="GPKG")

    make_exhibit(parcel, grid, facilities, table, parking, fence, gate, distances)


def load_basemap():
    """Load CSU's public 2024 ortho display, falling back to local public-domain NAIP."""
    raster_path = DATA / "naip-parcel-7103005001.tif"
    with rasterio.open(raster_path) as src:
        rb = src.bounds
        raster_crs = src.crs
        naip = np.moveaxis(src.read([1, 2, 3]), 0, -1)

    presentation_path = DATA / "csu-2024-presentation-retouched.webp"
    if presentation_path.exists():
        presentation = np.asarray(Image.open(presentation_path).convert("RGB"))
        return (presentation, rb, raster_crs,
                "Colorado Springs Utilities 2024 El Paso County orthophoto; parked vehicles retouched")

    try:
        cfg_url = ("https://maps.csu.org/Geocortex/Essentials/REST/sites/"
                   "GIS_Public_Portal/map/mapservices/10?f=json")
        cfg = requests.get(cfg_url, timeout=30).json()
        parts = dict(item.split("=", 1) for item in cfg["connectionString"].split(";") if "=" in item)
        params = {
            "bbox": f"{rb.left},{rb.bottom},{rb.right},{rb.top}", "bboxSR": "3857",
            "imageSR": "3857", "size": "4096,2560", "format": "png32",
            "transparent": "false", "layers": "show:0", "f": "image", "token": parts["token"],
        }
        response = requests.get(parts["url"] + "/export", params=params, timeout=120)
        response.raise_for_status()
        high_res = np.asarray(Image.open(BytesIO(response.content)).convert("RGB"))
        return high_res, rb, raster_crs, "Colorado Springs Utilities 2024 El Paso County orthophoto"
    except Exception as exc:
        print(f"High-resolution CSU imagery unavailable; using NAIP fallback: {exc}")
        return naip, rb, raster_crs, "USDA NAIP via USGS National Map ImageServer"


def make_exhibit(parcel, grid, facilities, table, parking, fence, gate, distances) -> None:
    rgb, rb, raster_crs, imagery_source = load_basemap()

    to_map = Transformer.from_crs(CRS, raster_crs, always_xy=True)
    layers = [x.to_crs(raster_crs) for x in (parcel, grid, facilities, table, parking, fence, gate, distances)]
    parcel_m, grid_m, facilities_m, table_m, parking_m, fence_m, gate_m, distances_m = layers

    fig = plt.figure(figsize=(17, 11), facecolor="white")
    ax = fig.add_axes([.035, .12, .74, .80])
    ax.imshow(rgb, extent=[rb.left, rb.right, rb.bottom, rb.top])
    grid_m.boundary.plot(ax=ax, color="white", linewidth=.35, alpha=.55, zorder=3)
    parcel_m.boundary.plot(ax=ax, color="#36ed46", linewidth=2.8, zorder=5)
    parking_m.boundary.plot(ax=ax, color="#8bd7f2", linewidth=1.3, linestyle=":", alpha=.9, zorder=4)
    fence_m.plot(ax=ax, color="black", linewidth=3.4, alpha=.70, zorder=6)
    fence_m.plot(ax=ax, color="white", linewidth=1.7, linestyle=(0, (2, 2)), zorder=7)
    gate_m.plot(ax=ax, marker="s", facecolor="#fff7d6", edgecolor="black",
                linewidth=1.0, markersize=48, zorder=9)
    distances_m.plot(ax=ax, color="#00e9ff", linewidth=1.4, linestyle="--", zorder=6)
    table_m.plot(ax=ax, color="#ffe45c", linewidth=6, zorder=8)

    # Coordinate labels follow the same 25-foot square grid used in the GeoPackage.
    minx, miny, maxx, maxy = parcel.geometry.iloc[0].bounds
    for col in range(26):
        sx = min(minx + (col + .5) * 25, (minx + col * 25 + maxx) / 2)
        mx, my = to_map.transform(sx, maxy)
        ax.annotate(chr(65 + col), (mx, my), xytext=(0, 3), textcoords="offset points",
                    ha="center", va="bottom", color="white", fontsize=7, weight="bold", zorder=12)
    for row in range(int(np.ceil((maxy - miny) / 25))):
        sy = maxy - (row + .5) * 25
        mx, my = to_map.transform(maxx, sy)
        ax.annotate(str(row + 1), (mx, my), xytext=(4, 0), textcoords="offset points",
                    ha="left", va="center", color="white", fontsize=7, weight="bold", zorder=12)

    colors = {"campsite": "#ff7900", "sanitation": "#075be8", "structure": "#ffffff"}
    for kind, subset in facilities_m.groupby("feature_type"):
        subset.plot(ax=ax, color=colors[kind], edgecolor="black", linewidth=1.0,
                    markersize=95 if kind != "structure" else 45, zorder=9)
        for _, f in subset.iterrows():
            if kind == "structure":
                offset = (7, 5)
            elif f["name"] == "Garage toilet":
                offset = (-82, 7)
            else:
                offset = (7, 7)
            ax.annotate(f["name"], (f.geometry.x, f.geometry.y), xytext=offset,
                        textcoords="offset points", color="white", fontsize=8.5, weight="bold",
                        bbox=dict(boxstyle="round,pad=.2", facecolor="black", alpha=.67, edgecolor="none"), zorder=10)

    for _, d in distances_m.iterrows():
        p = d.geometry.interpolate(.52, normalized=True)
        ax.annotate(f"{d.distance_ft:.0f} ft", (p.x, p.y), color="#00f5ff", fontsize=8,
                    weight="bold", bbox=dict(facecolor="black", alpha=.60, edgecolor="none", pad=1.4), zorder=10)

    tmid = table_m.geometry.iloc[0].interpolate(.5, normalized=True)
    ax.annotate("20-ft table\nN-S", (tmid.x, tmid.y), xytext=(-55, -20), textcoords="offset points",
                color="#ffe45c", fontsize=8.5, weight="bold",
                bbox=dict(facecolor="black", alpha=.68, edgecolor="none", pad=2), zorder=10)

    gate_point = gate_m.geometry.iloc[0]
    ax.annotate("Driveway gate", (gate_point.x, gate_point.y), xytext=(8, -13),
                textcoords="offset points", color="white", fontsize=8, weight="bold",
                bbox=dict(facecolor="black", alpha=.68, edgecolor="none", pad=1.5), zorder=10)

    # Address label is deliberately placed in the open southern portion, off the house.
    lx, ly = to_map.transform(*parcel_xy(.55, .88, parcel.geometry.iloc[0].bounds))
    ax.annotate("MERVEILLES CLUB\nParcel 7103005001  |  21085 Capella Dr\nRR-5  |  5.01 acres",
                (lx, ly), ha="center", va="center", color="white", fontsize=10, weight="bold",
                bbox=dict(boxstyle="round,pad=.45", facecolor="#15231a", alpha=.82,
                          edgecolor="#36ed46", linewidth=1.4), zorder=11)

    ax.set_xlim(rb.left, rb.right); ax.set_ylim(rb.bottom, rb.top)
    ax.set_xticks([]); ax.set_yticks([])
    ax.set_title("Merveilles Club — Conceptual Site Plan", loc="left", fontsize=18, weight="bold", pad=12)

    # North arrow and 100-foot scale bar, transformed at the parcel's south-east.
    x0, y0 = to_map.transform(*parcel_xy(.80, .94, parcel.geometry.iloc[0].bounds))
    x1, _ = to_map.transform(parcel.geometry.iloc[0].bounds[0] + .80 * (parcel.geometry.iloc[0].bounds[2]-parcel.geometry.iloc[0].bounds[0]) + 100,
                             parcel_xy(.80, .94, parcel.geometry.iloc[0].bounds)[1])
    ax.plot([x0, x1], [y0, y0], color="white", lw=4, solid_capstyle="butt", zorder=12)
    ax.text((x0+x1)/2, y0, "100 ft", color="white", fontsize=8, ha="center", va="bottom", weight="bold", zorder=12)
    ax.annotate("N", xy=(.95, .15), xytext=(.95, .07), xycoords="axes fraction",
                arrowprops=dict(facecolor="white", edgecolor="black", width=5, headwidth=15),
                ha="center", color="white", fontsize=12, weight="bold")

    side = fig.add_axes([.79, .12, .19, .80]); side.axis("off")
    side.text(0, .99, "MAP NOTES", va="top", fontsize=13, weight="bold")
    notes = ("Maximum occupancy: 20 persons total\n"
             "Primitive campsites: 3\n"
             "Parking capacity: up to 20 vehicles\n"
             "Communal table: 20 ft, oriented N-S\n\n"
             "All proposed-use locations are conceptual and subject to field verification. "
             "The 25-foot grid is a square location-reference grid, not survey coordinates.\n\n"
             "Parcel source: El Paso County GIS Open Data, parcel 7103005001.\n"
             f"Imagery source: {imagery_source}.\n"
             "Coordinate system: NAD83 / Colorado Central (ftUS), EPSG:2232.\n"
             "Presentation basemap is photographically retouched only to remove parked vehicles.\n"
             "Gas and electric alignments: field locate pending; no line locations inferred.\n\n"
             "NOT A SURVEY")
    side.text(0, .94, notes, va="top", fontsize=9.5, linespacing=1.35, wrap=True)
    legend = [Patch(facecolor="none", edgecolor="#36ed46", linewidth=2.5, label="Parcel boundary"),
              Line2D([0], [0], marker="o", color="none", markerfacecolor="#ff7900", markeredgecolor="black", markersize=9, label="Proposed campsite"),
              Line2D([0], [0], marker="o", color="none", markerfacecolor="#075be8", markeredgecolor="black", markersize=9, label="Portable toilet"),
              Line2D([0], [0], color="#ffe45c", lw=5, label="Communal table"),
              Line2D([0], [0], color="#8bd7f2", lw=1.5, linestyle=":", label="Parking / driveway outline"),
              Line2D([0], [0], color="black", lw=3.4, linestyle=(0, (2, 2)),
                     marker="|", markerfacecolor="white", label="Existing white picket fence"),
              Line2D([0], [0], marker="s", color="none", markerfacecolor="#fff7d6",
                     markeredgecolor="black", markersize=7, label="Driveway gate")]
    side.legend(handles=legend, loc="lower left", frameon=False, fontsize=9)
    fig.text(.035, .055, "Prepared for zoning-verification / pre-application discussion • Conceptual planning exhibit • 9 September 2026",
             fontsize=9, color="#333333")
    jpg_path = EXPORTS / "merveilles-club-conceptual-site-plan.jpg"
    pdf_path = EXPORTS / "merveilles-club-conceptual-site-plan.pdf"
    fig.savefig(jpg_path, dpi=180, bbox_inches="tight",
                pil_kwargs={"quality": 70, "optimize": True})
    plt.close(fig)
    with Image.open(jpg_path) as flattened:
        flattened.convert("RGB").save(pdf_path, "PDF", resolution=180, quality=70)


if __name__ == "__main__":
    main()

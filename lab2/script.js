// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =
  "pk.eyJ1IjoiY2Fzc2lleHlzZGQiLCJhIjoiY21rY2p5ZnEwMDFyeDNlczl0NDJ4anA0MiJ9.dON6aIHJ5oqIiLZT8W6gxA";

// Define a map object by initialising a Map from Mapbox
const map = new mapboxgl.Map({
  container: "map",
  // Replace YOUR_STYLE_URL with your style URL.
  style: "mapbox://styles/cassiexysdd/cmkmkswsy000m01sd0a2c4n2p"
});

// Add controls (safe to do here)
map.addControl(new mapboxgl.NavigationControl(), "top-left");
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
  }),
  "top-left"
);

// Geocoder control (make sure Geocoder plugin JS/CSS is included in HTML <head>)
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker: false,
  placeholder: "Search for places in Glasgow",
  proximity: { longitude: -4.2518, latitude: 55.8642 }
});
map.addControl(geocoder, "top-left");

// Everything that depends on the style MUST be inside load
map.on("load", () => {
  // ---------- Legend ----------
  const layers = [
    "<10",
    "20 ",
    "30 ",
    "40 ",
    "50 ",
    "60 ",
    "70 ",
    "80 ",
    "90 ",
    "100"
  ];
  const colors = [
    "#67001f",
    "#b2182b",
    "#d6604d",
    "#f4a582",
    "#fddbc7",
    "#d1e5f0",
    "#92c5de",
    "#4393c3",
    "#2166ac",
    "#053061"
  ];

  const legend = document.getElementById("legend-items");
  if (legend) {
    legend.innerHTML = ""; // prevent duplicates on hot reload
    layers.forEach((layer, i) => {
      const color = colors[i];
      const key = document.createElement("div");
      key.className = "legend-key";
      key.style.backgroundColor = color;
      key.innerHTML = `${layer}`;
      if (i <= 1 || i >= 8) key.style.color = "white";
      legend.appendChild(key);
    });
  }

  // ---------- Hover highlight source + layer (must be inside load) ----------
  if (!map.getSource("hover")) {
    map.addSource("hover", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] }
    });
  }

  if (!map.getLayer("dz-hover")) {
    map.addLayer({
      id: "dz-hover",
      type: "line",
      source: "hover",
      layout: {},
      paint: {
        "line-color": "black",
        "line-width": 4
      }
    });
  }

  // ---------- Hover interaction ----------
  map.on("mousemove", (event) => {
    const dzone = map.queryRenderedFeatures(event.point, {
      layers: ["glasgow-simd"]
    });

    const pd = document.getElementById("pd");
    if (pd) {
      pd.innerHTML = dzone.length
        ? `<h3>${dzone[0].properties.DZName}</h3>
           <p>Rank: <strong>${dzone[0].properties.Percentv2}</strong> %</p>`
        : `<p>Hover over a data zone!</p>`;
    }

    // Update hover outline (guard against undefined source)
    const hoverSource = map.getSource("hover");
    if (hoverSource) {
      hoverSource.setData({
        type: "FeatureCollection",
        features: dzone.map((f) => ({ type: "Feature", geometry: f.geometry }))
      });
    }
  });

  // Optional: clear outline when leaving the map canvas
  map.on("mouseleave", "glasgow-simd", () => {
    const hoverSource = map.getSource("hover");
    if (hoverSource) {
      hoverSource.setData({ type: "FeatureCollection", features: [] });
    }
    const pd = document.getElementById("pd");
    if (pd) pd.innerHTML = `<p>Hover over a data zone!</p>`;
  });
});
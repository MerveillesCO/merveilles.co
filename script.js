const header = document.querySelector('[data-header]');
const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 40);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const zoneContent = {
  maravilla: { kicker: 'Northwest corner', title: 'Maravilla', copy: 'This is where the odd buildings and experiments go. The Ærie and TikiDome are here, with room left for things we have not thought of yet.', list: ['The Ærie', 'Enchanted TikiDome', 'The Moat House'] },
  garden: { kicker: 'North garden', title: 'The Garden & Grove', copy: 'One large tree sits in the middle. The plan works outward from it with paths, planting beds, shade, and space for a long table.', list: ['The centered tree', 'The Chashitsu', 'Orchard & planting beds'] },
  studio: { kicker: 'North building', title: 'The Studio', copy: 'Indoor space for tools, rehearsal, messy work, and getting out of the weather.', list: ['Workshop', 'Rehearsal floor', 'Tool & material storage'] },
  forest: { kicker: 'Western woods', title: 'The Forest', copy: 'Most of the property is still woods. The work here is mostly paths: one obvious route, one deliberately obscure route, and small clearings between them.', list: ['The Promenade', 'The Dark Walk', 'The Hermitage'] },
  north: { kicker: 'Smaller performance clearing', title: 'North Performance', copy: 'The quieter of the two stage areas, intended for acoustic music, readings, and performances that do not need much machinery.', list: ['North Stage', 'The Gothic Orchestra', 'Small audience clearing'] },
  chateau: { kicker: 'House & patio', title: 'The Chateau & Patio', copy: 'The practical center of the property: kitchen, bathroom, patio, fire, and the table where everyone eventually ends up.', list: ['Container Adobe', 'Patio', 'Shared table'] },
  south: { kicker: 'Larger performance clearing', title: 'South Performance', copy: 'The larger stage area, with enough open ground for dancing, games, and performances that need more room.', list: ['South Stage', 'Dance floor', 'Open lawn'] },
  faere: { kicker: 'Eastern woods', title: 'Fære', copy: 'The sillier side of the garden. This is the home of the Vardo, giant mushrooms, archery targets, and other small surprises.', list: ['Mushroom Grove', 'Færie Archery', 'The Vardo'] },
  future: { kicker: 'Southern edge', title: 'The Further Grounds', copy: 'Land reserved for a few primitive campsites and projects that do not have another home yet. Nothing here is fixed.', list: ['Camping Glade', 'Future projects', 'Open buffer'] }
};

const projectContent = {
  grove: { kicker: 'The Garden', title: 'The Grove', copy: 'A large tree stands at the center. We intend to keep it there and arrange the paths, seating, and planting around it.', list: ['Existing tree', 'Round seating area', 'Paths into the garden'] },
  tikidome: { kicker: 'Maravilla', title: 'The Enchanted TikiDome', copy: 'A geodesic dome with an unapologetically tropical interior. It should be warm, dim, handmade, and a little ridiculous.', list: ['Dome shell', 'Carved & painted interior', 'Low evening light'] },
  'gothic-orchestra': { kicker: 'North Stage', title: 'The Gothic Orchestra', copy: 'A collection of instruments and sculptural parts installed among the trees. Some pieces can be played; others may make noise on their own.', list: ['Outdoor instruments', 'Found mechanical parts', 'Lights for night use'] },
  vardo: { kicker: 'Fære', title: 'The Vardo', copy: 'A small painted caravan. It can hold a reading, a private conversation, or one fortune-teller and two nervous guests.', list: ['Painted exterior', 'Tiny interior room', 'Steps & sitting area'] },
  aerie: { kicker: 'Maravilla', title: 'The Ærie', copy: 'A small raised lookout. It is a place to watch the weather come over the trees or get away from everyone for ten minutes.', list: ['Raised platform', 'Weather cover', 'View through the trees'] },
  chashitsu: { kicker: 'The Garden', title: 'The Chashitsu', copy: 'A very small tea house beside the garden. Shoes off, phones away, water on.', list: ['Tea room', 'Covered threshold', 'Short garden path'] },
  'north-stage': { kicker: 'North Performance', title: 'The North Stage', copy: 'The smaller stage. It is meant for voices and acoustic instruments, with the audience close enough to hear without much amplification.', list: ['Simple platform', 'Small audience area', 'Basic power & light'] },
  'container-adobe': { kicker: 'The Chateau', title: 'The Container Adobe', copy: 'A shipping container wrapped in an adobe-like shell so it belongs beside the house instead of looking dropped from a truck.', list: ['Container structure', 'Earthen exterior', 'Deep doors & windows'] },
  'south-stage': { kicker: 'South Performance', title: 'The South Stage', copy: 'The larger outdoor stage. This is the one for dancing, theatre, amplified music, and anything that needs elbow room.', list: ['Larger platform', 'Open audience ground', 'Power & stage lighting'] },
  'mushroom-grove': { kicker: 'Fære', title: 'The Mushroom Grove', copy: 'A cluster of oversized mushrooms in the woods. Some may be seats. Some may be games. At least one should glow.', list: ['Large mushroom forms', 'Seats & small games', 'Low lighting'] },
  'camping-glade': { kicker: 'Further Grounds', title: 'The Camping Glade', copy: 'A few primitive campsites for people attending an event here. No rows of tents and no general campground.', list: ['A few tent sites', 'Quiet hours', 'Event guests only'] }
};

const detail = document.querySelector('[data-map-detail]');
const zones = [...document.querySelectorAll('[data-zone]')];
const projectMarkers = [...document.querySelectorAll('[data-project]')];
const projectMedia = detail?.querySelector('[data-project-media]');

function setMapDetail(content) {
  detail.querySelector('[data-zone-kicker]').textContent = content.kicker;
  detail.querySelector('[data-zone-title]').textContent = content.title;
  detail.querySelector('[data-zone-copy]').textContent = content.copy;
  detail.querySelector('[data-zone-list]').innerHTML = content.list.map(item => `<li>${item}</li>`).join('');
}

function setProjectImage(slot, source, alt, placeholder) {
  slot.querySelector('img')?.remove();
  slot.querySelector('span').hidden = Boolean(source);
  slot.querySelector('small').hidden = Boolean(source);
  if (source) {
    const image = document.createElement('img');
    image.src = source;
    image.alt = alt;
    slot.prepend(image);
  } else {
    slot.querySelector('small').textContent = placeholder;
  }
}

function selectZone(zone) {
  const content = zoneContent[zone.dataset.zone];
  if (!content || !detail) return;
  zones.forEach(item => item.classList.toggle('active', item === zone));
  projectMarkers.forEach(item => item.classList.remove('active'));
  if (projectMedia) projectMedia.hidden = true;
  setMapDetail(content);
}

function selectProject(marker) {
  const content = projectContent[marker.dataset.project];
  if (!content || !detail) return;
  zones.forEach(item => item.classList.remove('active'));
  projectMarkers.forEach(item => item.classList.toggle('active', item === marker));
  setMapDetail(content);
  if (projectMedia) {
    projectMedia.hidden = false;
    setProjectImage(
      projectMedia.querySelector('[data-current-image]'),
      content.currentImage,
      `${content.title}, current condition`,
      `${content.title} photo placeholder`
    );
    setProjectImage(
      projectMedia.querySelector('[data-envisioned-image]'),
      content.envisionedImage,
      `${content.title}, envisioned concept`,
      `${content.title} concept placeholder`
    );
  }
}

zones.forEach(zone => {
  zone.addEventListener('click', () => selectZone(zone));
  zone.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectZone(zone);
    }
  });
});

projectMarkers.forEach(marker => {
  marker.addEventListener('click', () => selectProject(marker));
  marker.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectProject(marker);
    }
  });
});

const svgNS = 'http://www.w3.org/2000/svg';
const symbolGlyphs = {
  banner: '⚑',
  star: '✦',
  water: '≈',
  troll: '♜',
  rock: '◆',
  book: '▤',
  cave: '⌒',
  mountain: '▲',
  memorial: '✧'
};

const countryMap = document.querySelector('[data-country-map]');
const countryRoads = document.querySelector('[data-country-roads]');
const countryMarkers = document.querySelector('[data-country-markers]');
const countryDetail = document.querySelector('[data-country-detail]');
const filterButtons = [...document.querySelectorAll('[data-map-filter]')];

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(svgNS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function showCountryFeature(marker, feature) {
  document.querySelectorAll('.country-marker').forEach(item => item.classList.toggle('active', item === marker));
  const properties = feature.properties;
  countryDetail.querySelector('[data-country-subtitle]').textContent = properties.subtitle || properties.category;
  countryDetail.querySelector('[data-country-title]').textContent = properties.name;
  countryDetail.querySelector('[data-country-copy]').textContent = properties.description;

  const precision = countryDetail.querySelector('[data-country-precision]');
  if (properties.publicPrecision) {
    precision.hidden = false;
    precision.textContent = `Map precision: ${properties.publicPrecision}. Do not use this marker as a substitute for current access or trail information.`;
  } else {
    precision.hidden = true;
  }

  const directions = countryDetail.querySelector('[data-country-directions]');
  directions.hidden = !properties.directions;
  if (properties.directions) {
    directions.href = properties.directions;
    directions.target = '_blank';
    directions.rel = 'noopener';
  }

  const source = countryDetail.querySelector('[data-country-source]');
  source.hidden = !properties.source;
  if (properties.source) {
    source.href = properties.source;
    source.target = '_blank';
    source.rel = 'noopener';
  }
}

async function buildCountryMap() {
  if (!countryMap || !countryRoads || !countryMarkers || !countryDetail) return;

  try {
    const [locationResponse, roadResponse] = await Promise.all([
      fetch('data/locations.geojson'),
      fetch('data/roads.geojson')
    ]);
    if (!locationResponse.ok) throw new Error(`Location data returned ${locationResponse.status}`);
    if (!roadResponse.ok) throw new Error(`Road data returned ${roadResponse.status}`);
    const [collection, roadCollection] = await Promise.all([
      locationResponse.json(),
      roadResponse.json()
    ]);
    const bounds = collection.metadata.bounds;
    const width = 1000;
    const height = 920;
    const padding = 58;
    const project = ([longitude, latitude]) => [
      padding + ((longitude - bounds.west) / (bounds.east - bounds.west)) * (width - padding * 2),
      padding + ((bounds.north - latitude) / (bounds.north - bounds.south)) * (height - padding * 2)
    ];

    roadCollection.features.forEach((feature, index) => {
      const points = feature.geometry.coordinates.map(project);
      const path = svgElement('path', {
        id: `country-road-${index}`,
        class: `country-road ${feature.properties.class || 'local'}`,
        d: points.map(([x, y], pointIndex) => `${pointIndex ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')
      });
      const label = svgElement('text', { class: 'country-road-label' });
      const labelPath = svgElement('textPath', {
        href: `#country-road-${index}`,
        startOffset: feature.properties.labelOffset || '50%'
      });
      labelPath.textContent = feature.properties.name;
      label.append(labelPath);
      countryRoads.append(path, label);
    });

    collection.features.forEach(feature => {
      const properties = feature.properties;
      const [x, y] = project(feature.geometry.coordinates);
      const marker = svgElement('g', {
        class: 'country-marker',
        tabindex: '0',
        role: 'button',
        'aria-label': `Explore ${properties.name}`,
        'data-category': properties.category,
        transform: `translate(${x.toFixed(2)} ${y.toFixed(2)})`
      });

      const ring = svgElement('circle', { class: 'marker-ring', r: properties.category === 'garden' ? 15 : 12 });
      const icon = svgElement('text', { class: 'marker-icon', x: '0', y: '5', 'text-anchor': 'middle' });
      icon.textContent = symbolGlyphs[properties.symbol] || symbolGlyphs.star;

      const dx = Number(properties.labelDx ?? 18);
      const dy = Number(properties.labelDy ?? 8);
      const anchor = properties.labelAnchor || 'start';
      const label = svgElement('text', { class: 'marker-label', x: dx, y: dy, 'text-anchor': anchor });
      label.textContent = properties.name;
      const epithet = svgElement('text', { class: 'marker-epithet', x: dx, y: dy + 16, 'text-anchor': anchor });
      epithet.textContent = properties.subtitle || '';

      marker.append(ring, icon, label, epithet);
      marker.addEventListener('click', () => showCountryFeature(marker, feature));
      marker.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          showCountryFeature(marker, feature);
        }
      });
      countryMarkers.append(marker);
    });

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.dataset.mapFilter;
        filterButtons.forEach(item => item.classList.toggle('active', item === button));
        document.querySelectorAll('.country-marker').forEach(marker => {
          marker.classList.toggle('filtered', filter !== 'all' && marker.dataset.category !== filter);
        });
      });
    });
  } catch (error) {
    countryDetail.querySelector('[data-country-title]').textContent = 'The chart could not be opened.';
    countryDetail.querySelector('[data-country-copy]').textContent = 'Serve this site through a local web server so the browser can load data/locations.geojson.';
    console.error(error);
  }
}

buildCountryMap();

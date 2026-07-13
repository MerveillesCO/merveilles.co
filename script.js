const header = document.querySelector('[data-header]');
const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 40);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const zoneContent = {
  maravilla: { kicker: 'Northwest realm', title: 'Maravilla', copy: 'A cabinet of curiosities in the open air: experimental structures, improbable games, and objects that reward a second look.', list: ['The Ærie', 'The Moat House', 'Curious devices & games'] },
  garden: { kicker: 'North garden', title: 'The Garden & Grove', copy: 'The cultivated heart of Merveilles—a place for blossoms, long tables, conversation, and delight beneath the boughs.', list: ['The Grove', 'The Orangerie', 'Garden suppers & picniques'] },
  studio: { kicker: 'North garden', title: 'The Studio', copy: 'A working chamber for movement, making, rehearsal, and the practical magic required to bring a garden to life.', list: ['Artist workshop', 'Dance & rehearsal', 'Small indoor refuge'] },
  forest: { kicker: 'Western wood', title: 'The Forest', copy: 'The forest is collaborator, healer, and guide. Paths move between attention and surprise without asking the woods to become tame.', list: ['The Promenade', 'The Dark Walk', 'The Hermitage'] },
  north: { kicker: 'Performance realm', title: 'North Performance', copy: 'An intimate clearing for strings, voices, stories, and performances that belong beneath a living canopy.', list: ['Acoustic concerts', 'The Gothic Orchestra', 'Lantern-lit theatre'] },
  chateau: { kicker: 'The hearth', title: 'The Chateau & Patio', copy: 'The practical and convivial center: a hearth, a table, a sheltered threshold, and the place where hospitality takes form.', list: ['Shared tables', 'Smokehouse hospitality', 'Patio gatherings'] },
  south: { kicker: 'Performance realm', title: 'South Performance', copy: 'A lively ground for dance, games, spectacle, and the larger gestures of Merveilles.', list: ['Social dance', 'Garden games', 'Seasonal performance'] },
  faere: { kicker: 'Eastern realm', title: 'Fære', copy: 'The rules loosen here. Mushrooms, archery, strange targets, tiny shrines, and playful encounters inhabit the edge of the known garden.', list: ['Mushroom Grove', 'Færie Archery', 'The Vardo'] },
  future: { kicker: 'Southern reach', title: 'The Further Grounds', copy: 'A breathing space for future marvels and small event-linked camping—developed slowly, only as the land and approvals allow.', list: ['Reservation-only camping glade', 'Future installations', 'Protected operating buffer'] }
};

const projectContent = {
  grove: { kicker: 'The Garden · living project', title: 'The Grove', copy: 'A gathering place composed around one centered tree—the living heart of the garden, with paths, shade, and shared tables radiating outward.', list: ['Centered tree', 'Circular gathering ground', 'Shade, table & ceremony'] },
  tikidome: { kicker: 'Maravilla · curious structure', title: 'The Enchanted TikiDome', copy: 'A playful, immersive shelter where tropical fantasy, hand-built ornament, light, and sound meet the Colorado woods.', list: ['Existing-condition portrait', 'Enchanted concept study', 'Lighting & material experiments'] },
  'gothic-orchestra': { kicker: 'North Stage · sound project', title: 'The Gothic Orchestra', copy: 'A strange ensemble in the trees: part instrument, part sculpture, and part nocturnal theatre.', list: ['Current installation study', 'Expanded musical canopy', 'Night-lighting concept'] },
  vardo: { kicker: 'Fære · intimate chamber', title: 'The Vardo', copy: 'A painted caravan and tiny chamber for stories, readings, fortune, and close encounters.', list: ['Current caravan portrait', 'Interior atmosphere study', 'Arrival & setting concept'] },
  aerie: { kicker: 'Maravilla · lookout project', title: 'The Ærie', copy: 'A small elevated refuge for watching weather, listening to the woods, and seeing the garden from another height.', list: ['Existing structure', 'Canopy relationship', 'Future lookout study'] },
  chashitsu: { kicker: 'The Garden · quiet project', title: 'The Chashitsu', copy: 'A small tea house where attention, quiet, and hospitality become the event.', list: ['Current site portrait', 'Tea-house concept', 'Threshold & garden study'] },
  'north-stage': { kicker: 'North Performance · stage project', title: 'The North Stage', copy: 'An intimate woodland proscenium for strings, voices, stories, and performances shaped to the living canopy.', list: ['Current clearing portrait', 'Stage elevation study', 'Audience & lighting concept'] },
  'container-adobe': { kicker: 'The Chateau · building project', title: 'The Container Adobe', copy: 'A practical container structure softened into the garden with earthen texture, deep openings, shade, and a sense of hand-built permanence.', list: ['Current container portrait', 'Adobe exterior study', 'Doors, shade & planting concept'] },
  'south-stage': { kicker: 'South Performance · stage project', title: 'The South Stage', copy: 'A lively open-air platform for dance, theatre, games, and the garden’s larger gestures.', list: ['Current ground portrait', 'Stage & canopy study', 'Performance-lighting concept'] },
  'mushroom-grove': { kicker: 'Fære · play project', title: 'The Mushroom Grove', copy: 'A pocket of Fære devoted to scale, color, games, and improbable encounters.', list: ['Current woodland floor', 'Enlarged mushroom study', 'Play & lighting concept'] },
  'camping-glade': { kicker: 'Further Grounds · future project', title: 'The Camping Glade', copy: 'A small, event-linked camping clearing shaped by quiet hours, light touch, and the practical needs of hosted stays.', list: ['Existing ground conditions', 'Low-impact layout study', 'Subject to access & approvals'] }
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

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

const detail = document.querySelector('[data-map-detail]');
const zones = [...document.querySelectorAll('[data-zone]')];

function selectZone(zone) {
  const content = zoneContent[zone.dataset.zone];
  if (!content || !detail) return;
  zones.forEach(item => item.classList.toggle('active', item === zone));
  detail.querySelector('[data-zone-kicker]').textContent = content.kicker;
  detail.querySelector('[data-zone-title]').textContent = content.title;
  detail.querySelector('[data-zone-copy]').textContent = content.copy;
  detail.querySelector('[data-zone-list]').innerHTML = content.list.map(item => `<li>${item}</li>`).join('');
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
  if (!countryMap || !countryMarkers || !countryDetail) return;

  try {
    const response = await fetch('data/locations.geojson');
    if (!response.ok) throw new Error(`Map data returned ${response.status}`);
    const collection = await response.json();
    const bounds = collection.metadata.bounds;
    const width = 1000;
    const height = 920;
    const padding = 58;
    const project = ([longitude, latitude]) => [
      padding + ((longitude - bounds.west) / (bounds.east - bounds.west)) * (width - padding * 2),
      padding + ((bounds.north - latitude) / (bounds.north - bounds.south)) * (height - padding * 2)
    ];

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

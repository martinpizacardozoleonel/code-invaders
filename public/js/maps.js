/* Mapas: Leaflet + OpenStreetMap + geolocalización + API de Nominatim */
const Maps = {
  map: null,
  marker: null,
  userMarker: null,

  init() {
    this.map = L.map('map').setView([-34.6037, -58.3816], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    /* Puntos de práctica de flexbox alrededor del mundo */
    const points = [
      { name: 'Sede Flexbox Academy 🐸', lat: -34.6037, lng: -58.3816, desc: 'Campus central, ¡donde nace la rana!' },
      { name: 'Campus HTML · Tokio 🇯🇵', lat: 35.6762, lng: 139.6503, desc: 'Laboratorio de CSS Flexbox nivel avanzado' },
      { name: 'Campus CSS · París 🇫🇷', lat: 48.8566, lng: 2.3522, desc: 'Clases de flex-direction y order' },
      { name: 'Campus JS · Nueva York 🇺🇸', lat: 40.7128, lng: -74.006, desc: 'Ejercicios de justify-content' },
      { name: 'Campus Web · Sídney 🇦🇺', lat: -33.8688, lng: 151.2093, desc: 'Prácticas de align-items' }
    ];
    points.forEach(p => this.addMarker(p.lat, p.lng, p.name, p.desc, '🏫'));

    document.getElementById('mapSearchBtn').addEventListener('click', () => this.search());
    document.getElementById('mapSearch').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.search();
    });
    document.getElementById('mapLocateBtn').addEventListener('click', () => this.locate());
  },

  addMarker(lat, lng, name, desc, icon) {
    const divIcon = L.divIcon({
      html: `<div style="font-size:26px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))">${icon}</div>`,
      className: '', iconSize: [28, 28], iconAnchor: [14, 24]
    });
    L.marker([lat, lng], { icon: divIcon }).addTo(this.map)
      .bindPopup(`<b>${name}</b><br>${desc}`);
  },

  /* API externa: Nominatim (OpenStreetMap) */
  async search() {
    const q = document.getElementById('mapSearch').value.trim();
    if (!q) { Toast.info('Escribe un lugar para buscarlo'); return; }
    document.getElementById('mapStatus').textContent = '🔍 Buscando "' + q + '" con la API de Nominatim…';
    try {
      const results = await API.geocode(q);
      if (!results.length) {
        document.getElementById('mapStatus').textContent = '⚠️ No se encontró el lugar. Prueba con otro nombre.';
        Toast.error('Lugar no encontrado');
        return;
      }
      const r = results[0];
      const lat = parseFloat(r.lat), lng = parseFloat(r.lon);
      if (this.marker) this.map.removeLayer(this.marker);
      this.marker = L.marker([lat, lng]).addTo(this.map)
        .bindPopup(`<b>${r.display_name.split(',')[0]}</b><br>${r.display_name}`).openPopup();
      this.map.setView([lat, lng], 12);
      document.getElementById('mapStatus').textContent = '📍 Encontrado: ' + r.display_name;
    } catch (e) {
      document.getElementById('mapStatus').textContent = '⚠️ Error al consultar la API de Nominatim.';
      Toast.error('Error al consultar Nominatim');
    }
  },

  locate() {
    if (!navigator.geolocation) { Toast.error('Geolocalización no disponible'); return; }
    document.getElementById('mapStatus').textContent = '📡 Localizando…';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (this.userMarker) this.map.removeLayer(this.userMarker);
        this.userMarker = L.marker([latitude, longitude]).addTo(this.map);
        L.circle([latitude, longitude], { radius: 300, color: '#43a047', fillOpacity: 0.15 }).addTo(this.map);
        this.userMarker.bindPopup('<b>¡Estás aquí!</b> 🐸').openPopup();
        this.map.setView([latitude, longitude], 14);
        document.getElementById('mapStatus').textContent = '📍 ¡Ubicación encontrada con geolocalización del navegador!';
        Notifications.addLocal('📍 Ubicación detectada', 'Se marcó tu posición en el mapa.', 'info');
      },
      (err) => {
        document.getElementById('mapStatus').textContent = '⚠️ No se pudo obtener tu ubicación (' + err.message + ')';
        Toast.error('No se pudo obtener tu ubicación');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }
};
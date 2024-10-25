const url = "https://api.citybik.es/v2/networks/bicimad";
const botonCerca = document.getElementById("buscarCerca");
let marcadoresActivos = [];

const getApi = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    addPointMap(data.network.stations);
  } catch (error) {
    console.error(error);
  }
};

const addPointMap = (array) => {
  marcadoresActivos.forEach((marker) => marker.remove());
  marcadoresActivos = [];

  array.forEach((station) => {
    const { empty_slots, free_bikes, latitude, longitude, name, extra } =
      station;
    const popup = new maplibregl.Popup().setHTML(`
    <h3>Estación: ${name}</h3>
    <p>Dirección:<br> <b>${extra.address}</b></p>
    <p>Hay <b style="color:${tieneBicis(free_bikes)}">${free_bikes}</b> bicis disponibles</p>
    <p>Hay <b style="color:${tieneBicis(empty_slots)}">${empty_slots}</b> espacios disponibles </p>
      `);

    const marker = new maplibregl.Marker({
      color: tieneBicis(free_bikes),
    })
      .setLngLat([longitude, latitude])
      .setPopup(popup)
      .addTo(map);
    marcadoresActivos.push(marker);
  });
};

const tieneBicis = (libres) => {
  if (libres > 10) {
    return "#28b463";
  } else if (libres > 2) {
    return "#f7dc6f";
  } else {
    return "#e74c3c";
  }
};

const map = new maplibregl.Map({
  style: "https://tiles.openfreemap.org/styles/liberty",
  center: [-3.7026, 40.4165],
  zoom: 11,
  container: "map",
});

const fnBuscarCerca = async () => {
  const url = "https://api.techniknews.net/ipgeo/";
  try {
    const response = await fetch(url);
    const data = await response.json();
    map.flyTo({
      center: [data.lon, data.lat],
      duration: 1000,
      easing: (t) => t * (2 - t),
      zoom: 14,
    });
  } catch (error) {
    console.error(error);
  }
};

setInterval(() => {
  getApi(url);
  console.log("Me he actualizado");
}, 10000);

getApi(url);

botonCerca.addEventListener("click", fnBuscarCerca);

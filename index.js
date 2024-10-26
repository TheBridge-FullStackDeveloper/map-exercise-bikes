// Initialize the map with MapLibre
var map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/liberty', // OpenFreeMap map style
    center: [-3.70256, 40.4165], // Coordinates for Madrid
    zoom: 15, // Zoom level to focus on Madrid
});
// Array to hold the markers for easy updating
let markers = [];
// Function to fetch bike-sharing data and update markers
function updateBikeStations() {
    fetch('https://api.citybik.es/v2/networks/bicimad')
        .then(response => response.json())
        .then(data => {
            // Log the bike-sharing networks data to the console
            console.log(data);
            // Remove old markers before adding new ones
            markers.forEach(marker => marker.remove());
            markers = [];
            // Extract stations data
            const stations = data.network.stations;
            // Add markers for each station on the map
            stations.forEach(station => {
                // Determine color based on bike availability
                let markerColor;
                if (station.free_bikes > 10) {
                    markerColor = 'green';
                } else if (station.free_bikes >= 5) {
                    markerColor = 'yellow';
                } else {
                    markerColor = 'red';
                }
                // Create a marker for each station
                const stationMarker = new maplibregl.Marker({ color: markerColor })
                    .setLngLat([station.longitude, station.latitude]) // Set position using station's coordinates
                    .setPopup(
                        new maplibregl.Popup().setHTML(`
                            <strong>${station.name}</strong><br>
                            Address: ${station.extra.address || 'No address available'}<br>
                            Free bikes: ${station.free_bikes}<br>
                            Empty slots: ${station.empty_slots}
                        `) // Popup content with station info
                    )
                    .addTo(map); // Add marker to the map
                // Store the marker for future removal
                markers.push(stationMarker);
            });
        })
        .catch(error => console.error('Error fetching bike network data:', error));
}
// Initial call to fetch and render bike stations
updateBikeStations();
// Set interval to update markers every 10 seconds
setInterval(updateBikeStations, 10000);
// Button to center on user’s location
document.getElementById('locate-button').addEventListener('click', () => {
    fetch('https://api.techniknews.net/ipgeo/')
        .then(response => response.json())
        .then(data => {
            // Get the user's location coordinates
            const userLongitude = data.lon;
            const userLatitude = data.lat;
            // Set the map center to the user's location
            map.setCenter([userLongitude, userLatitude]);
            map.setZoom(15);
            // Add a marker at the user's location
            new maplibregl.Marker({ color: 'purple' })
                .setLngLat([userLongitude, userLatitude])
                .setPopup(new maplibregl.Popup().setHTML('You are here'))
                .addTo(map);
        })
        .catch(error => console.error('Error by loading your location:', error));
});

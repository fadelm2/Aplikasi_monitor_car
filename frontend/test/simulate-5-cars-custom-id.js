import axios from "axios";

const BASE_URL = "http://192.168.1.80:3000/api";

const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Njc5MjI2MjUsInJvbGUiOiJhZG1pbiIsInVzZXJfaWQiOjEsInVzZXJuYW1lIjoiYWRtaW5fZmFkZWwifQ.IZO2SGQmuYR2Qtk08Vw7gdd2IY4Z6CO4cVYw_1qRlNU";

// ~4 meter per detik
const STEP = 0.00004;

const cars = [
    { id: 33, lat: -6.174465, lng: 106.845130, dir: { lat: 1, lng: 0 } },  // Senen → Timur
    { id: 35, lat: -6.170238, lng: 106.830955, dir: { lat: 0, lng: 1 } },  // Gambir → Utara
    { id: 97, lat: -6.166708, lng: 106.836486, dir: { lat: 1, lng: 1 } },  // Pasar Baru → Timur Laut
    { id: 93, lat: -6.193924, lng: 106.843373, dir: { lat: -1, lng: 0 } }, // Cikini → Selatan
    { id: 38, lat: -6.175392, lng: 106.827153, dir: { lat: 0, lng: -1 } } // Monas → Barat
];

console.log("🚦 Simulasi 5 mobil di Jakarta dimulai...");

setInterval(async () => {
    await Promise.all(
        cars.map(async (car, index) => {
            // arah beda-beda biar natural
            car.lat += STEP * (index % 2 === 0 ? 1 : -1);
            car.lng += STEP * (index % 2 === 0 ? 1 : -1);

            const payload = {
                lat: car.lat,
                lng: car.lng
            };

            try {
                const res = await axios.put(
                    `${BASE_URL}/cars/${car.id}/location`,
                    payload,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${TOKEN}`
                        },
                        timeout: 3000
                    }
                );

                console.log(
                    `[${new Date().toLocaleTimeString()}] 🚗 Car ${car.id} (sim-${index + 1})`,
                    payload,
                    "Status:",
                    res.status
                );
            } catch (err) {
                console.error(`❌ Car ${car.id} (sim-${index + 1}) error`);

                if (err.response) {
                    console.error("Status:", err.response.status);
                    console.error("Response:", err.response.data);
                } else {
                    console.error("Message:", err.message);
                }
            }
        })
    );
}, 1000);

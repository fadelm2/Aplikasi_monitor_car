import axios  from "axios";
const BASE_URL = "http://192.168.1.80:3000/api";
const carId = 17;

const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Njc5MjI2MjUsInJvbGUiOiJhZG1pbiIsInVzZXJfaWQiOjEsInVzZXJuYW1lIjoiYWRtaW5fZmFkZWwifQ.IZO2SGQmuYR2Qtk08Vw7gdd2IY4Z6CO4cVYw_1qRlNU";

// posisi awal
let lat =-6.16259051;
let lng = 106.84081390;

// kecepatan gerak (ubah sesuai kebutuhan)
const STEP = 0.00004; // ~4 meter-ish

console.log("🚗 Simulasi mobil berjalan dimulai...");

setInterval(async () => {
    lat += STEP;
    lng += STEP;

    const payload = {
        lat,
        lng
    };

    try {
        const res = await axios.put(
            `${BASE_URL}/cars/${carId}/location`,
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
            `[${new Date().toISOString()}] ✅ Sent`,
            payload,
            "Status:",
            res.status
        );
    } catch (err) {
        console.error("❌ Error sending location");

        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Response:", err.response.data);
        } else {
            console.error("Message:", err.message);
        }
    }
}, 1000); // 1 detik

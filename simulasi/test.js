let lat = -6.17666049
let lng = 106.82542177

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjYyOTQyNzMsInJvbGUiOiJhZG1pbiIsInVzZXJfaWQiOjQsInVzZXJuYW1lIjoiZHJpdmVyMSJ9.RkTbiBIkF-58TIJnZUPRHaKZ-EDJayR-enJFcS7mk_c"

setInterval(async () => {
    // simulasi mobil jalan
    lat += 0.00002
    lng += 0.00003

    await fetch("http://localhost:3000/api/cars/193/location", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${TOKEN}`
        },
        body: JSON.stringify({ lat, lng })
    })

    console.log("sent:", lat, lng)
}, 50)

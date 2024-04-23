// Definiera API-URL och fånga element från DOM
const apiUrl = 'https://restcountries.com/v3.1/name/';
const searchBtn = document.getElementById('search-btn');
const resetBtn = document.getElementById('reset-btn');
const input = document.getElementById('country-input');
const countriesContainer = document.getElementById('countries-container');
let chart = null; // Variabel för att hålla Chart.js-diagrammet

// Lägg till eventlyssnare för sökknappen
searchBtn.addEventListener('click', () => {
    // Ta inmatningen från användaren, dela upp vid kommatecken och ta bort mellanslag
    const countryNames = input.value.split(',').map(name => name.trim());
    // Anropa funktionen som söker efter länder med de angivna namnen
    searchCountries(countryNames);
});

// Eventlyssnare för återställningsknappen
resetBtn.addEventListener('click', resetSearch);

// Asynkron funktion för att hämta och visa information om sökta länder
async function searchCountries(countryNames) {
    countriesContainer.innerHTML = ''; // Rensa tidigare resultat
    let dataset = []; // Array för att hålla data för diagrammet

    for (const name of countryNames) {
        try {
            const response = await fetch(`${apiUrl}${name}`); // Gör ett anrop till API:t
            const countries = await response.json(); // Tolka svaret som JSON
            if (!response.ok) throw new Error(`${response.status}: ${countries.message}`);

            const country = countries[0]; // Anta att det första resultatet är det önskade landet
            displayCountry(country); // Visa landets information
            // Lägg till landets data i dataset för diagrammet
            dataset.push({
                label: country.name.common,
                backgroundColor: getRandomColor(), // Använd en slumpmässig färg för varje land
                data: [country.population, country.area, country.gini ? country.gini['2019'] : 0]
            });
        } catch (error) {
            console.error('Failed to fetch country:', error);
            alert(`Error: ${error.message}`);
        }
    }

    updateChart(dataset); // Skapa eller uppdatera diagrammet med det nya datasetet
}

// Funktion för att visa information om ett land i gränssnittet
function displayCountry(country) {
    const countryDiv = document.createElement('div');
    countryDiv.className = 'country';
    countryDiv.innerHTML = `
        <h2>${country.name.common}</h2>
        <img src="${country.flags.png}" alt="Flag of ${country.name.common}">
        <p>Currency: ${Object.values(country.currencies)[0].symbol} (${Object.values(country.currencies)[0].name} - ${Object.keys(country.currencies)[0]})</p>
        <p>Population: ${country.population.toLocaleString()}</p>
        <p>Area: ${country.area.toLocaleString()} km²</p>
        <p>Gini coefficient: ${country.gini ? country.gini['2019'] : 'N/A'}</p>
        <iframe src="https://maps.google.com/maps?q=${country.latlng[0]},${country.latlng[1]}&z=6&output=embed" width="300" height="200" frameborder="0" style="border:0;" allowfullscreen></iframe>
    `;
    countriesContainer.appendChild(countryDiv); // Lägg till elementet i DOM
}

// Funktion för att skapa eller uppdatera diagrammet med Chart.js
function updateChart(dataset) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    if (chart) chart.destroy(); // Förstör den gamla instansen av diagrammet om den finns

    // Skapa ett nytt radardiagram
    chart = new Chart(ctx, {
        type: 'radar', // Ändra typ till 'radar'
        data: {
            labels: ['Population', 'Area', 'Gini Coefficient'], // Definiera axlarnas etiketter
            datasets: dataset.map(data => ({
                label: data.label,
                backgroundColor: data.backgroundColor + '77', // Lägg till opacitet till färgen
                borderColor: data.backgroundColor,
                data: data.data
            }))
        },
        options: { // Anpassa utseendet på diagrammet
            elements: {
                line: {
                    borderWidth: 3
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: false
                    },
                    suggestedMin: 0
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 20, // Anpassa storleken på texten i legenden
                            family: 'sans-serif',
                        }
                    }
                }
            }
        }
    });
}

// Funktion för att generera en slumpmässig färg
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Funktion för att återställa sökningen och rensa alla resultat
function resetSearch() {
    input.value = ''; // Töm inmatningsfältet
    countriesContainer.innerHTML = ''; // Rensa visade länder
    if (chart) chart.destroy(); // Förstör diagrammet om det finns
}

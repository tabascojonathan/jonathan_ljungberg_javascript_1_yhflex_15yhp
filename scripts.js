// Global variabel för att hålla datasetet
let dataset = []; 

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
    dataset = []; // Rensa dataset när vi gör en ny sökning

    for (const name of countryNames) {
        try {
            const response = await fetch(`${apiUrl}${name}`);
            if (!response.ok) { // Kontrollera först om svaret är ok
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const countries = await response.json(); // Tolka svaret som JSON
            if (countries.length === 0) { // Kontrollera om något land faktiskt hittades
                throw new Error("No country found with the provided name");
            }

            const country = countries[0]; // Anta att det första resultatet är det önskade landet
            const giniYears = Object.keys(country.gini || {}); // Hämta alla år för Gini-data
            const latestYear = giniYears.length > 0 ? Math.max(...giniYears.map(year => parseInt(year))) : null; // Hitta det senaste året
            const latestGini = latestYear ? country.gini[latestYear] : 'N/A'; // Hämta Gini-koefficienten för det senaste året
            displayCountry(country, latestGini); // Visa landets information
            // Lägg till landets data i dataset för diagrammet
            dataset.push({
                label: country.name.common,
                backgroundColor: getRandomColor(),
                data: [country.population, country.area, latestGini !== 'N/A' ? latestGini : 0]
            });
        } catch (error) {
            console.error('Failed to fetch country:', error);
            alert(`Error: ${error.message}`);
        }
    }

    updateChart(dataset); // Skapa eller uppdatera diagrammet med det nya datasetet
}


// Funktion för att visa information om ett land i gränssnittet
function displayCountry(country, latestGini) {
    const countryDiv = document.createElement('div');
    countryDiv.className = 'country';
    countryDiv.innerHTML = `
        <h2>${country.name.common}</h2>
        <img src="${country.flags.png}" alt="Flag of ${country.name.common}">
        <p>Currency: ${Object.values(country.currencies)[0].symbol} (${Object.values(country.currencies)[0].name} - ${Object.keys(country.currencies)[0]})</p>
        <p>Population: ${country.population.toLocaleString()}</p>
        <p>Area: ${country.area.toLocaleString()} km²</p>
        <p>Gini coefficient (latest): ${latestGini}</p>
        <iframe src="https://maps.google.com/maps?q=${country.latlng[0]},${country.latlng[1]}&z=6&output=embed" width="300" height="200" frameborder="0" style="border:0;" allowfullscreen></iframe>
        <button onclick="removeCountry('${country.name.common}', this.parentElement)">Remove</button>
    `;
    countriesContainer.appendChild(countryDiv); // Lägg till elementet i DOM
}


// Funktion för att skapa eller uppdatera diagrammet med Chart.js
function updateChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    if (chart) chart.destroy(); // Förstör den gamla instansen av diagrammet om den finns

    /*
    // Skapa ett nytt radardiagram
    chart = new Chart(ctx, {
        type: 'bar', // Använd stapeldiagram
        data: {
            labels: ['Population', 'Area', 'Gini Coefficient'], // Definiera axlarnas etiketter
            datasets: dataset // Använd datasetet som innehåller information om länder
        },
        options: { // Anpassa utseendet på diagrammet
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'Green',
                        font: {
                            size: 20,
                            family: 'sans-serif',
                            weight: 'lighter',
                        }
                    }
                }
            }
        }
    });
} */


    // Skapa ett nytt radardiagram
    chart = new Chart(ctx, {
        type: 'radar',
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
                            size: 20,
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
    dataset = []; // Rensa dataset
    if (chart) chart.destroy(); // Förstör diagrammet om det finns
}

// Funktion för att ta bort ett land
function removeCountry(countryName, element) {
    element.remove();
    const index = dataset.findIndex(data => data.label === countryName);
    if (index !== -1) {
        dataset.splice(index, 1);
        updateChart(); // Uppdatera diagrammet direkt
    }
}

    // Hitta indexet för landet i datasetet och ta bort det
    const index = dataset.findIndex(data => data.label === countryName);
    if (index !== -1) {
        dataset.splice(index, 1);
        updateChart(dataset); // Uppdatera diagrammet med det nya datasetet
    }
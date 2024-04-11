const apiUrl = 'https://restcountries.com/v3.1/name/';
const searchBtn = document.getElementById('search-btn');
const resetBtn = document.getElementById('reset-btn');
const input = document.getElementById('country-input');
const countriesContainer = document.getElementById('countries-container');
let chart = null;

// Event listeners
searchBtn.addEventListener('click', () => {
    const countryNames = input.value.split(',').map(name => name.trim());
    searchCountries(countryNames);
});

resetBtn.addEventListener('click', resetSearch);

async function searchCountries(countryNames) {
    countriesContainer.innerHTML = ''; // Clear previous results
    let dataset = [];

    for (const name of countryNames) {
        try {
            const response = await fetch(`${apiUrl}${name}`);
            const countries = await response.json();
            if (!response.ok) throw new Error(`${response.status}: ${countries.message}`);

            const country = countries[0];
            displayCountry(country);
            dataset.push({
                label: country.name.common,
                backgroundColor: getRandomColor(),
                data: [country.population, country.area, country.gini ? country.gini['2019'] : 0]
            });
        } catch (error) {
            console.error('Failed to fetch country:', error);
            alert(`Error: ${error.message}`);
        }
    }

    updateChart(dataset);
}

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
    `;
    countriesContainer.appendChild(countryDiv);
}

function updateChart(dataset) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    if (chart) chart.destroy(); // Destroy the old chart instance before creating a new one

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Population', 'Area', 'Gini Coefficient'],
            datasets: dataset
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'blue', // Set legend color
                        font: {
                            size: 16 // Set font size
                        }
                    }
                }
            }
        }
    });
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function resetSearch() {
    input.value = '';
    countriesContainer.innerHTML = '';
    if (chart) chart.destroy();
}


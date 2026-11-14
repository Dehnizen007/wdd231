const spotlightGrid = document.querySelector("#spotlight-grid");
const currentWeather = document.querySelector("#current-weather");
const forecastList = document.querySelector("#forecast-list");

const weatherConfig = {
    apiKey: "YOUR_OPENWEATHERMAP_API_KEY",
    latitude: 6.335,
    longitude: 5.6037,
};

const membershipNames = {
    2: "Silver Member",
    3: "Gold Member",
};

function showMessage(container, message, className) {
    const element = document.createElement("p");
    element.className = className;
    element.textContent = message;
    container.replaceChildren(element);
}

function createSpotlight(member) {
    const card = document.createElement("article");
    card.className = "spotlight-card";

    const membership = document.createElement("p");
    membership.className = "spotlight-membership";
    membership.textContent = membershipNames[member.membershipLevel];

    const logo = document.createElement("img");
    logo.className = "spotlight-logo";
    logo.src = `images/${member.image}`;
    logo.alt = `${member.name} logo`;
    logo.width = 120;
    logo.height = 120;
    logo.loading = "lazy";

    const heading = document.createElement("h3");
    heading.textContent = member.name;

    const description = document.createElement("p");
    description.className = "spotlight-description";
    description.textContent = member.description;

    const contact = document.createElement("address");
    contact.className = "spotlight-contact";
    contact.textContent = member.address;

    const phone = document.createElement("a");
    phone.href = `tel:${member.phone.replace(/[^\d+]/g, "")}`;
    phone.textContent = member.phone;

    const website = document.createElement("a");
    website.href = member.website;
    website.textContent = "Visit website";
    website.target = "_blank";
    website.rel = "noopener noreferrer";

    card.append(membership, logo, heading, description, contact, phone, website);
    return card;
}

function showSpotlightError(error) {
    console.error("Unable to load chamber member spotlights:", error);
    showMessage(spotlightGrid, "Member spotlights are unavailable right now. Please try again later.", "spotlight-message");
    spotlightGrid.setAttribute("aria-busy", "false");
}

async function loadSpotlights() {
    try {
        const response = await fetch("data/members.json");
        if (!response.ok) {
            throw new Error(`Member data request failed with status ${response.status}`);
        }

        const members = await response.json();
        if (!Array.isArray(members)) {
            throw new Error("Member data must be an array");
        }

        const eligibleMembers = members.filter((member) => [2, 3].includes(member.membershipLevel));
        if (eligibleMembers.length < 2) {
            throw new Error("At least two silver or gold members are required for spotlights");
        }

        const shuffledMembers = [...eligibleMembers];
        for (let index = shuffledMembers.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [shuffledMembers[index], shuffledMembers[randomIndex]] = [shuffledMembers[randomIndex], shuffledMembers[index]];
        }
        const spotlightCards = shuffledMembers.slice(0, 3).map(createSpotlight);
        spotlightGrid.replaceChildren(...spotlightCards);
        spotlightGrid.setAttribute("aria-busy", "false");
    } catch (error) {
        showSpotlightError(error);
    }
}

function localDateKey(timestamp, timezoneOffset) {
    return new Date((timestamp + timezoneOffset) * 1000).toISOString().slice(0, 10);
}

function formatForecastDate(dateKey) {
    return new Intl.DateTimeFormat("en", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${dateKey}T12:00:00Z`));
}

function renderForecast(forecast, timezoneOffset) {
    const today = localDateKey(Date.now() / 1000, timezoneOffset);
    const byDate = new Map();

    for (const period of forecast.list) {
        const dateKey = localDateKey(period.dt, timezoneOffset);
        if (dateKey <= today) {
            continue;
        }
        byDate.set(dateKey, [...(byDate.get(dateKey) ?? []), period]);
    }

    const days = [...byDate.entries()]
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .slice(0, 3)
        .map(([dateKey, periods]) => {
            const middayPeriod = periods.reduce((closest, period) => {
                const localHour = new Date((period.dt + timezoneOffset) * 1000).getUTCHours();
                const closestHour = new Date((closest.dt + timezoneOffset) * 1000).getUTCHours();
                return Math.abs(localHour - 12) < Math.abs(closestHour - 12) ? period : closest;
            });
            return { dateKey, period: middayPeriod };
        });

    if (days.length < 3) {
        throw new Error("The weather service returned fewer than three forecast days");
    }

    const dayElements = days.map(({ dateKey, period }) => {
        const day = document.createElement("div");
        day.className = "forecast-day";

        const date = document.createElement("p");
        date.className = "forecast-date";
        date.textContent = formatForecastDate(dateKey);

        const temperature = document.createElement("p");
        temperature.className = "forecast-temperature";
        temperature.textContent = `${Math.round(period.main.temp)}°C`;

        const description = document.createElement("p");
        description.textContent = period.weather[0].description;

        day.append(date, temperature, description);
        return day;
    });

    forecastList.replaceChildren(...dayElements);
}

async function loadWeather() {
    if (weatherConfig.apiKey === "YOUR_OPENWEATHERMAP_API_KEY") {
        showMessage(
            currentWeather,
            "Add your OpenWeatherMap API key in scripts/home.js to load local weather.",
            "weather-status"
        );
        forecastList.replaceChildren();
        currentWeather.setAttribute("aria-busy", "false");
        return;
    }

    const query = new URLSearchParams({
        lat: String(weatherConfig.latitude),
        lon: String(weatherConfig.longitude),
        units: "metric",
        appid: weatherConfig.apiKey,
    });

    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?${query}`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?${query}`),
        ]);
        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error(`Weather request failed with status ${currentResponse.status}/${forecastResponse.status}`);
        }

        const [current, forecast] = await Promise.all([currentResponse.json(), forecastResponse.json()]);
        if (!Number.isFinite(current.main?.temp) || !current.weather?.[0]?.description) {
            throw new Error("Current weather response is missing temperature or description");
        }

        const temperature = document.createElement("p");
        temperature.className = "current-temperature";
        temperature.textContent = `${Math.round(current.main.temp)}°C`;

        const description = document.createElement("p");
        description.className = "current-description";
        description.textContent = current.weather[0].description;
        currentWeather.replaceChildren(temperature, description);

        renderForecast(forecast, forecast.city.timezone);
    } catch (error) {
        console.error("Unable to load Benin City weather:", error);
        showMessage(currentWeather, "Weather information is unavailable right now. Please try again later.", "weather-status");
        showMessage(forecastList, "Forecast unavailable.", "forecast-message");
    } finally {
        currentWeather.setAttribute("aria-busy", "false");
    }
}

loadSpotlights();
loadWeather();

const currentYear = document.querySelector("#current-year");
const lastModified = document.querySelector("#last-modified");

if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
}

if (lastModified) {
    const modifiedDate = new Date(document.lastModified);
    lastModified.dateTime = modifiedDate.toISOString();
    lastModified.textContent = new Intl.DateTimeFormat("en", {
        dateStyle: "long",
    }).format(modifiedDate);
}

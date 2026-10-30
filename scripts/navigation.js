const menuButton = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");

if (menuButton && primaryNavigation) {
    document.body.classList.add("has-menu");

    const setMenuOpen = (isOpen) => {
        primaryNavigation.classList.toggle("is-open", isOpen);
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    };

    menuButton.addEventListener("click", () => {
        setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
    });

    primaryNavigation.addEventListener("click", (event) => {
        if (event.target instanceof HTMLAnchorElement) {
            setMenuOpen(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
            setMenuOpen(false);
            menuButton.focus();
        }
    });
}

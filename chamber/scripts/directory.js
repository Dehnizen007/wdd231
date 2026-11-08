const memberDirectory = document.querySelector("#member-directory");
const directoryCount = document.querySelector("#directory-count");
const gridButton = document.querySelector("#grid-view");
const listButton = document.querySelector("#list-view");

const membershipNames = {
    1: "Member",
    2: "Silver Member",
    3: "Gold Member",
};

function createMemberCard(member) {
    const card = document.createElement("article");
    card.className = "member-card";

    const logo = document.createElement("img");
    logo.className = "member-logo";
    logo.src = `images/${member.image}`;
    logo.alt = `${member.name} logo`;
    logo.width = 96;
    logo.height = 96;
    logo.loading = "lazy";

    const details = document.createElement("div");
    details.className = "member-details";

    const heading = document.createElement("h3");
    heading.textContent = member.name;

    const description = document.createElement("p");
    description.className = "member-description";
    description.textContent = member.description;

    const contact = document.createElement("div");
    contact.className = "member-contact";

    const address = document.createElement("address");
    address.textContent = member.address;

    const phone = document.createElement("a");
    phone.href = `tel:${member.phone.replace(/[^\d+]/g, "")}`;
    phone.textContent = member.phone;

    const website = document.createElement("a");
    website.href = member.website;
    website.textContent = member.website;
    website.target = "_blank";
    website.rel = "noopener noreferrer";

    const membership = document.createElement("span");
    membership.className = "membership";
    membership.textContent = membershipNames[member.membershipLevel];

    contact.append(address, phone, website);
    details.append(heading, description, contact, membership);
    card.append(logo, details);
    return card;
}

function showDirectoryError() {
    memberDirectory.replaceChildren();
    const message = document.createElement("p");
    message.className = "directory-message";
    message.textContent = "Member information could not be loaded. Please try again later.";
    memberDirectory.append(message);
    directoryCount.textContent = "Directory unavailable";
    memberDirectory.setAttribute("aria-busy", "false");
}

async function loadMembers() {
    try {
        const response = await fetch("data/members.json");
        if (!response.ok) {
            throw new Error(`Member data request failed with status ${response.status}`);
        }

        const members = await response.json();
        if (!Array.isArray(members) || members.length === 0) {
            throw new Error("Member data must be a non-empty array");
        }

        const cards = members.map(createMemberCard);
        memberDirectory.replaceChildren(...cards);
        directoryCount.textContent = `${members.length} local businesses and organizations`;
        memberDirectory.setAttribute("aria-busy", "false");
    } catch (error) {
        console.error("Unable to load the chamber directory:", error);
        showDirectoryError();
    }
}

function setDirectoryView(view) {
    const isList = view === "list";
    memberDirectory.classList.toggle("is-list", isList);
    gridButton.classList.toggle("is-active", !isList);
    listButton.classList.toggle("is-active", isList);
    gridButton.setAttribute("aria-pressed", String(!isList));
    listButton.setAttribute("aria-pressed", String(isList));
}

gridButton.addEventListener("click", () => setDirectoryView("grid"));
listButton.addEventListener("click", () => setDirectoryView("list"));
loadMembers();

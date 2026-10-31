const courseList = document.querySelector("#course-list");
const creditTotal = document.querySelector("#credit-total");
const filterButtons = document.querySelectorAll(".filter-button");

function renderCourses(filter = "ALL") {
    const visibleCourses = courses.filter((course) => filter === "ALL" || course.subject === filter);
    const visibleCredits = visibleCourses.reduce((total, course) => total + course.credits, 0);

    courseList.replaceChildren();
    creditTotal.textContent = String(visibleCredits);

    if (visibleCourses.length === 0) {
        const message = document.createElement("p");
        message.className = "course-empty";
        message.textContent = "No courses match this filter.";
        courseList.append(message);
        return;
    }

    visibleCourses.forEach((course) => {
        const card = document.createElement("article");
        const statusClass = course.inProgress ? "is-progress" : course.completed ? "is-completed" : "";
        card.className = `course-card${statusClass ? ` ${statusClass}` : ""}`;

        const heading = document.createElement("h3");
        heading.textContent = `${course.subject} ${course.number}: ${course.title}`;

        const details = document.createElement("p");
        details.textContent = `${course.credits} credits · ${course.technology.join(", ")}`;

        const status = document.createElement("p");
        status.className = "course-status";
        status.textContent = course.inProgress ? "In progress" : course.completed ? "Completed" : "Not completed";

        card.append(heading, details, status);
        courseList.append(card);
    });
}

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const selectedFilter = button.dataset.filter;

        filterButtons.forEach((filterButton) => {
            const isSelected = filterButton === button;
            filterButton.classList.toggle("is-active", isSelected);
            filterButton.setAttribute("aria-pressed", String(isSelected));
        });

        renderCourses(selectedFilter);
    });
});

document.querySelector("#currentyear").textContent = String(new Date().getFullYear());
document.querySelector("#lastModified").textContent = document.lastModified;

renderCourses();

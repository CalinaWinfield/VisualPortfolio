//David Flores

// Function to toggle mobile menu visibility
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('d-none');
});

// Add quick links
document.addEventListener("DOMContentLoaded", function () {
    const addButton = document.getElementById("addButton"); 
    const buttonForm = document.getElementById("buttonForm");

    addButton.addEventListener("click", function () {
        const modal = new bootstrap.Modal(document.getElementById("addButtonModal"));
        modal.show();
    });

    buttonForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const buttonName = document.getElementById("buttonName").value.trim();
        const buttonLink = document.getElementById("buttonLink").value.trim();

        if (buttonName && buttonLink) {
            const buttonWrapper = document.createElement("div");
            buttonWrapper.classList.add("button-wrapper");

            // Create new button
            const newButton = document.createElement("a");
            newButton.textContent = buttonName;
            newButton.href = buttonLink;
            newButton.classList.add("dynamic-button");
            newButton.target = "_blank";

            const deleteButton = document.createElement("button");
            deleteButton.innerHTML = "❌";
            deleteButton.classList.add("link-delete");

            deleteButton.addEventListener("click", function () {
                buttonWrapper.remove();
            });

            buttonWrapper.appendChild(newButton);
            buttonWrapper.appendChild(deleteButton);
            document.getElementById("buttonContainer").appendChild(buttonWrapper);

            buttonForm.reset();
            bootstrap.Modal.getInstance(document.getElementById("addButtonModal")).hide();
        }
    });
});
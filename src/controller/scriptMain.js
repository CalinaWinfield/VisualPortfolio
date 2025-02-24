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


//Item modal


// Get the modal
var modal = document.getElementById("itemModal");

// Get the button that opens the modal
var btn = document.getElementById("itemBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("save")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
modal.style.display = "block";
}

// When the user clicks on <span> (save), close the modal
span.onclick = function() {
modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
if (event.target == modal) {
    modal.style.display = "none";
}
}

//Collapsable Menu

var coll = document.getElementsByClassName("collapsible");
        var i;

        for (i = 0; i < coll.length; i++) {
            coll[i].addEventListener("click", function() {
                this.classList.toggle("active");
                var content = this.nextElementSibling;
                if (content.style.display === "block") {
                content.style.display = "none";
                } else {
                content.style.display = "block";
                }
            });
        }
//David Flores

// Function to toggle mobile menu visibility
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('d-none');
});

// Function to toggle calendar visibility on small screens
const scheduleBtn = document.getElementById('schedule-btn');
const calendarPane = document.getElementById('calendar-pane');

    scheduleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        calendarPane.classList.toggle('active');
        });
// Function to close the calendar once the user clicks outside of it
document.addEventListener('click', (e) => {
    if (calendarPane.classList.contains('active') && 
        !calendarPane.contains(e.target) && 
        e.target !== scheduleBtn && 
        !e.target.classList.contains('delete-btn')) { 
        calendarPane.classList.remove('active');
    }
});
// Function to dynamically populate calendar events
function populateCalendar() {
    const calendarEvents = document.getElementById('calendar-events');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const currentDay = today.getDay();

    // Clear existing content
    calendarEvents.innerHTML = '';

    // Loop through the next 25 days
    for (let i = 0; i < 25; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        const dayName = days[date.getDay()];
        const dayNumber = date.getDate();
        const eventHTML = `
            <div class="event-day mb-3">
                <p class="fw-bold mb-1">${dayName}, ${dayNumber}</p>
            </div>
        `;
        calendarEvents.innerHTML += eventHTML;
    }
}

// Function to handle adding events
const addEventBtn = document.getElementById('add-event-btn');

addEventBtn.addEventListener('click', () => {
    const eventText = prompt("Enter the event text:");
    if (eventText) {
        const dayMonthInput = prompt("Enter the day and month in the format Day-MM (e.g., 30-4 or 3-04):");
        if (dayMonthInput) {
            const [day, month] = dayMonthInput.split('-').map(Number); 
            const today = new Date();
            const currentYear = today.getFullYear();

            // Create a date object for the input day and month
            const inputDate = new Date(currentYear, month - 1, day); 
            if (
                inputDate.getFullYear() === currentYear &&
                inputDate.getMonth() === month - 1 &&
                inputDate.getDate() === day
            ) {
                // Find the difference in days between today and the input date
                const timeDifference = inputDate - today;
                const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

                // Check if the input date is within the next 25 days
                if (dayDifference >= 0 && dayDifference < 25) {
                    const eventDays = document.querySelectorAll('.event-day');
                    const selectedDay = eventDays[dayDifference];

                    let eventList = selectedDay.querySelector('ul');
                    if (!eventList) {
                        eventList = document.createElement('ul');
                        eventList.style.listStyleType = 'none'; 
                        eventList.style.paddingLeft = '0'; 
                        selectedDay.appendChild(eventList);
                    }

                    const eventItem = document.createElement('li');
                    eventItem.className = 'event-item'; 
                    
                    const eventTextSpan = document.createElement('span');
                    eventTextSpan.textContent = eventText;
                    eventItem.appendChild(eventTextSpan);
                    
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = '-';
                    deleteButton.className = 'delete-btn';
                    deleteButton.addEventListener('click', () => {
                        eventItem.remove();
                    });

                    eventItem.appendChild(deleteButton);
                    eventList.appendChild(eventItem);
                } else {
                    alert("The date must be within the next 25 days.");
                }
            } else {
                alert("Invalid date. Please enter a valid day and month within the next 25 days.");
            }
        } else {
            alert("Please enter a valid day and month.");
        }
    } 
});

populateCalendar();

//add quick links
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
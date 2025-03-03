// David Flores

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


// Minh Huy Tran

// Cover Letter Builder Functionality
document.addEventListener('DOMContentLoaded', function () {
    // Define Templates (Guided Templates with Placeholders)
    const templates = {
        template1: {
            introduction: `[Your Name]\n[Your Address] | [Your Phone Number] | [Your Email]\n\n[Date]\n\n[Hiring Manager's Name], [Job Title]\n[Company Name]\n[Company Address]\n\nDear [Hiring Manager's Name],\n\nWhile viewing job ads online, I came across your request for a [Job Title]. I am very interested in this position and wanted to take this opportunity to introduce myself.`,
            body: `I am a [describe your skills, e.g., fast learner, team player] and am skilled at [list key skills, e.g., learning new products quickly, processing payments, assisting customers]. I understand the value of [mention a key value, e.g., time management, customer satisfaction] and am great at getting things done quickly and effectively.\n\nIn my previous [Job Title] position at [Previous Company Name], I [describe a key achievement or responsibility, e.g., assisted 50+ customers daily in various shifts]. My adaptability allows me to work in many different environments, in addition to speaking with people from various backgrounds.`,
            conclusion: `For further details of my qualifications, background, and contributions, please take a moment to review my enclosed resume. I believe that I can successfully be the [Job Title] you're seeking and I welcome the opportunity to speak with you at your earliest convenience.\n\nWarm regards,\n\n[Your Name]`
        },
        template2: {
            introduction: `[Your Name]\n\n[Date] [Your Email]\n\n[Your Phone Number]\n\n[Hiring Manager's Name]\n[Company Name]\n[Company Address]\n\nDear [Hiring Manager's Name],\n\nI am applying for a position at [Company Name] because your mission and vision align with my values. As you’ll see from my resume, what motivates me is working for organizations, like yours, that serve a higher purpose. I would love to bring my skills and experience to support your cause.`,
            body: `With my focus on [mention your focus, e.g., patient wellness, customer satisfaction] and dedication to efficiently handling [mention key responsibilities, e.g., office needs, customer inquiries], I know I can be a strong asset to your team. I love working with [mention your audience, e.g., patients, customers] of all backgrounds and am efficient at building positive connections and trust using my [mention your qualities, e.g., warm nature, excellent communication skills]. Just a few of the many qualities and qualifications I will bring to this position include:\n\n- [List a key skill, e.g., I am knowledgeable in medical billing and coding (ICD & CPT).]\n- [List another key skill, e.g., I am effective in patient scheduling and coordinating smooth patient flow.]\n- [List another key skill, e.g., I carefully follow all infection-control protocols when sanitizing rooms and equipment.]`,
            conclusion: `You can count on my enthusiasm, high energy, and positive attitude, as well as my [mention your expertise, e.g., clinical knowledge, administrative expertise].\n\nI would greatly appreciate your review of my enclosed resume and outlined credentials. I believe that I can be a valuable addition to [Company Name] and your business goals. At your convenience, I am available for an interview or further discussion. I look forward to your response.\n\nSincerely,\n\n[Your Name]`
        },
        template3: {
            introduction: `[Your Name]\n\n[Your Email] | [Your Phone Number] | [Your Address]\n\n[Date]\n\n[Hiring Manager's Name], [Job Title]\n[Company Name]\n[Company Address]\n\nDear [Hiring Manager's Name],\n\nI am contacting you to express my interest in the [Job Title] opportunity with [Company Name]. After reviewing the position requirements, I believe that my qualifications and educational pursuits are a great fit for the kind of candidate your company is looking for.`,
            body: `I am a highly results-oriented individual with over [number] years of experience in [your field, e.g., customer service]. I thrive in team settings and work efficiently to solve [mention key challenges, e.g., customer problems] while remaining cool under pressure. In my previous position at [Previous Company Name], I was awarded [mention an achievement, e.g., the Top CSR Award for two consecutive years in 2020-2021]. The qualities which I will bring to your team include:\n\n- **[Key Quality 1, e.g., Problem-solving]**: [Describe how you excel in this quality, e.g., I have a track record of solving all types of customer issues in an effective and professional manner.]\n- **[Key Quality 2, e.g., Professional Attitude]**: [Describe how you excel in this quality, e.g., As my references will attest, I have a knack for staying positive and upbeat, regardless of the situation.]\n- **[Key Quality 3, e.g., Communication]**: [Describe how you excel in this quality, e.g., I have a true passion for customer service and take pride in making consumers happy.]`,
            conclusion: `I've attached my resume with more information about my background. I feel confident that I could make a great contribution as a [Job Title] with [Company Name]. Thank you for your time, and I look forward to hearing from you soon.\n\nSincerely,\n\n[Your Name]`
        }
    };

    // Initialize the editor as blank
    const coverLetterEditor = document.querySelector('.cover-letter-editor');
    coverLetterEditor.innerHTML = `
        <h2>Your Cover Letter</h2>
        <textarea class="form-control mb-3" id="introduction" rows="5" placeholder="Introduction..."></textarea>
        <textarea class="form-control mb-3" id="body" rows="5" placeholder="Body..."></textarea>
        <textarea class="form-control mb-3" id="conclusion" rows="5" placeholder="Conclusion..."></textarea>
        <button class="btn btn-success" id="save-button">Save</button>
        <button class="btn btn-primary" id="preview-button">Preview</button>
        <button class="btn btn-secondary" id="export-button">Export as PDF</button>
    `;

    // Template Switching
    const templateButtons = document.querySelectorAll('.template-card button');

    templateButtons.forEach((button, index) => {
        button.addEventListener('click', function () {
            const templateKey = `template${index + 1}`; // template1, template2, template3
            loadTemplate(templates[templateKey]);
        });
    });

    // Load Template into Editor
    function loadTemplate(template) {
        const introduction = document.getElementById('introduction');
        const body = document.getElementById('body');
        const conclusion = document.getElementById('conclusion');

        introduction.value = template.introduction;
        body.value = template.body;
        conclusion.value = template.conclusion;

        // Reattach event listeners for Save, Preview, and Export buttons
        attachCoverLetterEventListeners();
    }

    // Attach event listeners for Save, Preview, and Export buttons
    function attachCoverLetterEventListeners() {
        // Save Button
        const saveButton = document.getElementById('save-button');
        if (saveButton) {
            saveButton.addEventListener('click', function () {
                const introduction = document.getElementById('introduction').value;
                const body = document.getElementById('body').value;
                const conclusion = document.getElementById('conclusion').value;

                const coverLetterContent = `${introduction}\n\n${body}\n\n${conclusion}`;
                localStorage.setItem('coverLetter', coverLetterContent);
                alert('Cover letter saved successfully!');
            });
        }

        // Preview Button
        const previewButton = document.getElementById('preview-button');
        if (previewButton) {
            previewButton.addEventListener('click', function () {
                const introduction = document.getElementById('introduction').value;
                const body = document.getElementById('body').value;
                const conclusion = document.getElementById('conclusion').value;

                const coverLetterContent = `${introduction}\n\n${body}\n\n${conclusion}`;
                const previewWindow = window.open();
                previewWindow.document.write(`
                    <html>
                        <head>
                            <title>Cover Letter Preview</title>
                            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                        </head>
                        <body>
                            <div class="container">
                                <h1>Cover Letter Preview</h1>
                                <p>${coverLetterContent.replace(/\n/g, '<br>')}</p>
                            </div>
                        </body>
                    </html>
                `);
                previewWindow.document.close();
            });
        }

        // Export as PDF Button
        const exportButton = document.getElementById('export-button');
        if (exportButton) {
            exportButton.addEventListener('click', function () {
                const introduction = document.getElementById('introduction').value;
                const body = document.getElementById('body').value;
                const conclusion = document.getElementById('conclusion').value;

                const coverLetterContent = `${introduction}\n\n${body}\n\n${conclusion}`;
                const element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(coverLetterContent));
                element.setAttribute('download', 'cover-letter.txt');

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            });
        }
    }

    // Load saved cover letter only if a template has been selected previously
    const savedCoverLetter = localStorage.getItem('coverLetter');
    if (savedCoverLetter) {
        const templateSelected = localStorage.getItem('templateSelected');
        if (templateSelected) {
            loadTemplate(templates[templateSelected]);
        }
    }
});


// Oved Lomeli
// Item modal
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

// Collapsable Menu

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
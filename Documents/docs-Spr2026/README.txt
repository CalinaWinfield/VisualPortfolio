# VisPortfolio

## Team Visionary

### Description
The EasyFolio App is a web tool that will help faculty keep, organize, and share their academic records. The User can log in, store their data, and quickly create documents like resumes, CVs, or portfolios. With easy customization, the app saves time, reduces repeated work, and makes it simple to format records for different needs.

### Technologies
1. HTML
2. CSS
3. JavaScript
4. Bootstrap, https://getbootstrap.com/
5. Google Fonts, https://fonts.google.com/
6. Angular, https://angular.dev/installation/
7. MongoDb Atlas, https://www.mongodb.com

### Features
1. Drag and drop document customization
2. External link integration
3. PDF generation
4. Schedule management
5. Responsive Screen: Application is able to adapt to different screen sizes

### Dashboard Components and Layout
Components: DashboardWrapper, DashboardHeader (title+search), DashboardGrid, DashboardCard (ItemsCard, DocumentBuilderCard, MyDocumentsCard), ItemsPreview, CardActions, ExpandableSections, ItemService.getItems(), routing hooks.
Layout: AppShell → SiteHeader | Main: DashboardWrapper → DashboardHeader, DashboardGrid (cards), ExpandableSections (My Documents, To Do, Active Forms) → Footer.

   
### Installation
1. Clone git repo: 
   git clone https://github.com/GGC-SD/VisPortfolio.git

### How to Run
- Open terminal and move to backend subfolder: "cd VisPortfolio/backend"
- run "npm install" to install dependencies"
- Fix audits if some appear with "npm audit fix" (if it still shows some after doing the command, disregard them)
- On the backend, create a .env file (just click on backend and create it there) and add the following:
  
- MONGO_URL=mongodb+srv://visportfolio:h7j433RFoU79Sk1U@cluster0.btpuj.mongodb.net/VisPortfolio?retryWrites=true&w=majority&appName=Cluster0
- PORT=5001

- then go to the terminal, access the backend:
- to access backend: cd backend
  
- Afterwards, insert the following commands:
  
- node server.js
- npm install
- npm audit
- npm audit fix
- npm start

- After that, go to the mongoDB extention and click on connect, add the following:
- mongodb+srv://<db_username>:<db_password>@cluster0.btpuj.mongodb.net/ - You need to replace the username with the information for user and password from Client
  
- Example: mongodb+srv://visportfolio:h7j433RFoU79Sk1U@cluster0.btpuj.mongodb.net/
  
  ### To run the front end
  - go to VisPortfolio/frontend on your terminal and run: npm install
  - run with: ng serve

### Making an Admin Account
1. Click the 'Get Started' button to sign up for an account on the web app (write down or make sure to remember the email)
2. After getting to the dashboard, logout
3. Open makeAdmin.js file (backend/scripts/makeAdmin.js)
4. Change line 15 (or a line with "const email = ...") to the email that you want to become an admin
    - For example: from [const email = 'test@yahoo.com';] --> to [const email = 'testtest@gmail.com';]
    - You will only need to do this once, since an admin will be able to promote/demote any account thereafter to/from admin on the dashboard when logged in
5. Save the file
6. In the backend terminal, stop the backend (Ctrl + c)
7. Run the file in the terminal with: node makeAdmin.js
8. Restart the backend
9. Login with the admin account
10. You SHOULD load into an Admin Dashboard page
    - If not, make sure you fully stopped and restarted the backend, and that you put the correct email (from sign up) in the makeAdmin.js file

## Team Roles
#### Spring 2026 - Pixel Improve
* **Calina Winfield** 1. Data Modeler 📊 2. Documentation Lead 📑 
* <img width="133" height="200" alt="image" src="https://github.com/user-attachments/assets/8e304b64-032f-4b3e-8bf8-867a8104fb78" />
* **Aaron Matthews** 1. Code Architecture/Lead Programmer 💻  2. Programmer 💻
* <img width="133" height="200" alt="image" src="https://piazza.com/redirect/s3?bucket=uploads&prefix=paste%2Fme7mcvitgu96va%2F12420e7ec619feccc2e9232386e87cbd231eda3210c7930d5fceff1b29d98e23%2FImage.jpg" />
* **Erick Vale** 1. Testing Lead 🛠 2. Project Manager 👩🏽‍💻 
* <img width="133" height="200" alt="image" src="https://github.com/evale92/practical-python/blob/main/selfie.jpg?raw=true" />
* **Whitney Branch** 1. UI/UX Designer 🛠 2. Programmer 💻
* <img width="133" height="200" alt="image" src="https://github.com/WBranch98/Whitney.Branch/blob/main/IMG_5918.jpeg?raw=true" />

## Flyer
<img width="640" height="799" alt="flyer" src="https://github.com/user-attachments/assets/467d7988-e5a2-4688-80d7-1ec5e228f315" />

## Screencast Demo: 
* https://www.youtube.com/watch?v=w0L-vM_lVEg 

## Repo Location
- [**click here**](https://github.com/GGC-SD/VisPortfolio)

### Communication
- Discord

## License
This project is licensed under [the GNU General Public License (GPL)](https://www.gnu.org/licenses/gpl-3.0.html). You are free to use, modify, and distribute this software under the condition that any derivative works or modifications must also be made available under the same license, ensuring that others have the same freedoms to use and adapt the code. For more details, see [LICENSE.md](Documents/docs-Spr2026/LICENSE.md) for details.


Copyright © 2026 VisPortfolio Team.

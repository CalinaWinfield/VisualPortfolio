# Visual Portfolio

## Team Visionary

### Description
The EasyFolio App is a web tool that will help faculty keep, organize, and share their academic records. The User can log in, store their data, and quickly create documents like resumes, CVs, or portfolios. With easy customization, the app saves time, reduces repeated work, and makes it simple to format records for different needs.

### Technologies
1. HTML & CSS
2. JavaScript & TypeScript
3. Angular, https://angular.dev/
4. Node.js & Express.js, https://nodejs.org/ | https://expressjs.com/
5. MongoDB Atlas & Mongoose, https://www.mongodb.com/
6. Bootstrap, https://getbootstrap.com/
7. Google Fonts, https://fonts.google.com/

### Features
1. Drag and drop document customization
2. External link integration
3. PDF generation
4. Schedule management
5. Responsive Screen: Application can adapt to different screen sizes

### Dashboard Components and Layout
Components: DashboardWrapper, DashboardHeader (title+search), DashboardGrid, DashboardCard (ItemsCard, DocumentBuilderCard, MyDocumentsCard), ItemsPreview, CardActions, ExpandableSections, ItemService.getItems(), routing hooks.
Layout: AppShell → SiteHeader | Main: DashboardWrapper → DashboardHeader, DashboardGrid (cards), ExpandableSections (My Documents, To Do, Active Forms) → Footer.

### Installation
1. Clone git repo: 
   git clone https://github.com/GGC-SD/VisPortfolio.git or https://github.com/CalinaWinfield/VisualPortfolio.git (for this specific version)

### How to Run

#### Run Both Frontend & Backend Together (Recommended — Single Command) 🚀
1. Ensure dependencies are installed in both subfolders:
   - Backend: `cd VisPortfolio/backend && npm install`
   - Frontend: `cd VisPortfolio/frontend && npm install`
2. In the `backend` folder (accessed through File Explorer or terminal), create a `.env` file and add the following:
    - MONGO_URL=mongodb+srv://visportfolio:h7j433RFoU79Sk1U@cluster0.btpuj.mongodb.net/VisPortfolio?retryWrites=true&w=majority&appName=Cluster0
    - PORT=5001
    - JWT_ACCESS_SECRET=easyfolio_access_secret
    - JWT_REFRESH_SECRET=easyfolio_refresh_secret
3. From the root `VisPortfolio` folder in your terminal, run:
   ```bash
   npm start
   ```
   *(or `npm run dev` / `node start.js`)*
   
   This concurrently launches both the backend (http://localhost:5001) and frontend (http://localhost:4200) in one terminal with labeled, color-coded output. Press **Ctrl + C** to cleanly stop both servers.

#### Alternative: Running Separately in Two Terminal Windows
1. **Backend**:
   - `cd VisPortfolio/backend`
   - `npm start` (or `node server.js`)
2. **Frontend**:
   - `cd VisPortfolio/frontend`
   - `npm start` (or `ng serve`) — view the app at http://localhost:4200

### Making an Admin Account
1. Click the 'Get Started' button to sign up for an account on the web app (write down or make sure to remember the email)
2. After getting to the dashboard, logout
3. Open makeAdmin.js file (backend/scripts/makeAdmin.js)
4. Change line 15 (or a line with "const email = ...") to the email that you want to become an admin
    - For example: from [const email = 'test@yahoo.com';] --> to [const email = 'testtest@gmail.com';]
    - You will only need to do this once, since an admin will be able to promote/demote any account thereafter to/from admin on the dashboard when logged in
5. Save the file
6. In the backend terminal, stop the backend (Ctrl + c)
7. Run the file in the backend terminal with: `node scripts/makeAdmin.js`
8. Restart the backend
9. Login with the admin account
10. You SHOULD load into an Admin Dashboard page
    - If not, make sure you fully stopped and restarted the backend, and that you put the correct email (from sign up) in the makeAdmin.js file

## Team Roles
#### Spring 2026 - Pixel Improve
* **Calina Winfield:** Data Modeler 📊 **AND** Documentation Lead 📑 
* **Aaron Matthews:** Code Architecture 💻 **AND** Lead Programmer 💻
* **Erick Vale:** Testing Lead 🛠 **AND** Project Manager 👩🏽‍💻 
* **Whitney Branch:** UI/UX Designer 👾 **AND** Client Liaison 💼


#### Fall 2026 - Personal (Unrelated to course) Fixes/Updates
* **Calina Winfield:**  Data Modeler 📊, Documentation Lead 📑, UI/UX Designer 👾, Testing Lead 🛠, Code Architecture/Programmer 💻 (With Antigravity/Gemini help)

## Screencast Demo: 
* [https://www.youtube.com/watch?v=w0L-vM_lVEg ](https://youtu.be/MdN3ljJyjwQ)


## License
You are free to use, modify, and distribute this software under the condition that any derivative works or modifications must also be made available under the same license, ensuring that others have the same freedoms to use and adapt the code. For more details, see [LICENSE.md](Documents/docs-Spr2026/LICENSE.md) for details.


Copyright © 2026 Calina Winfield.

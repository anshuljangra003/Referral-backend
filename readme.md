Referral System
This project is a referral-based web application with real-time updates using WebSockets.

🛠 Setup Instructions
Follow these steps to get the project up and running.

1️⃣ Install Dependencies
Navigate to each folder and install dependencies:

sh
Copy
Edit
cd backend && npm install
cd ../ws-backend && npm install
cd ../frontend && npm install
2️⃣ Set Up MongoDB
You can set up MongoDB either:

Using Docker (Recommended):

sh
Copy
Edit
docker run -d -p 27017:27017 --name mongodb mongo
Manual Installation:
Install MongoDB and run:

sh
Copy
Edit
mongod
3️⃣ Start the Servers
Run the backend:

sh
Copy
Edit
cd backend
npm run dev
Run the WebSocket server:

sh
Copy
Edit
cd ../ws-backend
npm run dev
Run the frontend:

sh
Copy
Edit
cd ../frontend
npm run dev
4️⃣ Use the Application
Open http://localhost:3000 in your browser.
Register a new user.
Refer others and watch real-time updates on the dashboard.
✅ You're all set! 🎉
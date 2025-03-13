🚀 QuickTask Frontend
QuickTask is a simple freelance platform where businesses and individuals can post small tasks, and freelancers can bid to complete them quickly. This repository contains the React.js frontend for the QuickTask platform.

📌 Features
✅ User Authentication (Supabase - Email, Google, Apple)
✅ Post and browse available tasks
✅ Bid on tasks as a freelancer
✅ Real-time notifications for bids, payments, and task updates
✅ Messaging system for communication
✅ Industry-specific groups for discussions
✅ Content sharing (articles, posts, and newsletters)
✅ Event posting feature
✅ Chat UI

🛠️ Tech Stack
Frontend: React.js, Tailwind CSS
Backend: Flask (API Integration)
Database: PostgreSQL / SQLite (Handled via Backend)
Authentication: Supabase
State Management: React Context API
Deployment: Vercel / Netlify (Frontend), Render (Backend)
🚀 Getting Started
1️⃣ Clone the Repository
sh
Copy
Edit
git clone https://github.com/your-username/quicktask-frontend.git
cd quicktask-frontend
2️⃣ Install Dependencies
sh
Copy
Edit
npm install
3️⃣ Create an .env File
Inside the root of your project, create a .env file and add:

env
Copy
Edit
REACT_APP_API_URL=http://127.0.0.1:5000
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
4️⃣ Start the Development Server
sh
Copy
Edit
npm start
The app will be available at http://localhost:3000.

🔥 API Endpoints (Backend)
Method	Endpoint	Description
POST	/auth/signup	Register a new user
POST	/auth/login	Login user
GET	/tasks	Fetch all tasks
POST	/tasks	Create a new task
POST	/bids	Submit a bid on a task
GET	/notifications	Fetch user notifications

🏗️ Folder Structure
bash
Copy
Edit
quicktask-frontend/
│── src/
│   ├── components/        # Reusable UI components  
│   ├── pages/             # Page components (Home, Tasks, Profile)  
│   ├── context/           # React Context for authentication  
│   ├── utils/             # Utility functions (API calls, Supabase)  
│   ├── styles/            # Global styles (Tailwind)  
│   ├── App.js             # Main application component  
│   ├── index.js           # Entry point  
│── public/                # Static assets  
│── .env                   # Environment variables  
│── package.json           # Project metadata  
│── README.md              # Documentation  

👨‍💻 Contributing
We welcome contributions! To contribute:

Fork the repo
Create a new branch (git checkout -b feature-branch)
Commit your changes (git commit -m "Added new feature")
Push the branch (git push origin feature-branch)
Create a Pull Request

📜 License
This project is licensed under the MIT License.

📞 Contact
For questions or feedback, reach out via [your email or GitHub profile].


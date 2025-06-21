Internship Management Website
Project Overview
This is a full-stack web application connecting companies with students for internship opportunities. It features distinct interfaces for companies (posting, managing internships and applications) and students (browsing, applying, and tracking applications).

Technologies Used
Backend: Node.js (Express.js), MySQL2, bcryptjs, dotenv

Database: MySQL (managed with MySQL Workbench)

Frontend: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3.3

Features
General
Responsive design.

Secure password hashing.

Basic form validation and client-side access control.

Company Features
Company Registration & Login

Profile Management

Internship Management (Post, View, Edit, Delete)

Application Management (View applicants, Update status)

Student Features
Student Registration & Login

Profile Management

Browse Internships

Apply for Internship

View My Applications

Setup and Installation
Prerequisites
Node.js & npm

MySQL Server & MySQL Workbench

Text Editor (e.g., VS Code)

Backend Setup
Clone Repository: git clone https://github.com/your-username/InternshipManagementWebsite.git

Install Dependencies: npm install

Create .env: Add PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (replace YOUR_MYSQL_ROOT_PASSWORD).

Database Setup
Open MySQL Workbench.

Create Database: CREATE DATABASE internship_db;

Create Tables: Run SQL scripts for companies, students, internships, and applications tables (detailed scripts provided in the full README version or your database setup files).

Running the Application
Start Backend: node server.js (from project root)

Access Frontend: Open http://localhost:3000/ in your web browser.

Usage Guide (Quick Start)
Sign Up/Login: Use /company-signup.html, /company-login.html, /student-signup.html, /student-login.html.

Company Workflow: Login -> Dashboard -> Manage Internships/Applications/Profile.

Student Workflow: Login -> Dashboard -> Browse Internships/My Applications/Profile.

Logout: Click "Logout" from any page.

Project Structure
InternshipManagementWebsite/
├── node_modules/
├── public/
│   ├── (HTML, CSS, JS files for all frontend pages and modals)
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── server.js

Future Enhancements (Possible Improvements)
Robust Authentication (JWT).

File Uploads (for resumes).

Search & Filtering for internships.

Email Notifications.

Admin Dashboard.

Password Reset.

Enhanced UI/UX.

Deployment Automation.

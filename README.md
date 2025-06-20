Internship Management Website
Project Overview
This is a full-stack web application developed as part of the CSIT128: Introduction to Web Technology course at the University of Wollongong in Dubai. The system facilitates the management of internships, connecting companies offering opportunities with students seeking them. It provides distinct interfaces and functionalities for both company (admin) and student (user) roles, allowing for seamless internship posting, browsing, application, and status management.

Technologies Used
Backend:

Node.js: JavaScript runtime environment for server-side logic.

Express.js: Fast, unopinionated, minimalist web framework for Node.js, used to build the RESTful API.

MySQL2: A highly performant MySQL client for Node.js, supporting promises for asynchronous database interactions.

bcryptjs: Library used for hashing and salting passwords to ensure secure authentication.

dotenv: Module to load environment variables from a .env file, keeping sensitive data out of the codebase.

Database:

MySQL: A widely used open-source relational database management system.

MySQL Workbench: A graphical tool used for database design, management, and querying.

Frontend:

HTML5: Standard markup language for structuring web pages.

CSS3: Styling language for web pages, providing visual presentation.

JavaScript (ES6+): Programming language for interactive frontend logic, fetching data from APIs, and handling user interactions.

Bootstrap 5.3.3: A popular CSS framework used for responsive design and streamlined styling of UI components.

Features
The application provides the following key functionalities for different user types:

General
Responsive design using Bootstrap for optimal viewing on various devices.

Secure password hashing using bcryptjs.

Client-side and basic server-side form validation.

Basic client-side access control for authenticated user types.

Company Features (Admin Site)
Company Registration & Login: Companies can create accounts and log in securely.

Profile Management: View and update company details (name, email, location, industry, website, description).

Internship Management:

Post New Internship: Create new internship listings with details like title, location, type, skills, salary, duration, and deadline.

View My Internships: Browse a list of all internships posted by the logged-in company.

Edit Internship: Modify details of existing internship listings.

Delete Internship: Remove internship listings.

Application Management:

View All Applications: See a comprehensive list of all applications submitted for all their posted internships.

View Applicant Details: Access student's name, email, major, university, GPA, resume link, and cover letter for each application.

Update Application Status: Change the status of an application (e.g., pending, shortlisted, accepted, rejected).

Student Features (User Site)
Student Registration & Login: Students can create accounts and log in securely.

Profile Management: View and update personal profile details (first name, last name, email, major, university, GPA, resume link).

Browse Internships: View a comprehensive list of all available internships posted by various companies on the platform.

Apply for Internship: Submit applications for internships of interest, including an optional resume link and cover letter.

My Applications: Track the status of all submitted internship applications in one centralized view.

Setup and Installation
Follow these steps to set up and run the project on your local machine.

Prerequisites
Node.js & npm: Download Node.js (LTS version) - npm is included.

MySQL Server: Download MySQL Community Server

MySQL Workbench (or equivalent SQL client): Download MySQL Workbench

Text Editor (recommended): Visual Studio Code

Backend Setup
Clone the Repository:

git clone https://github.com/your-username/InternshipManagementWebsite.git
cd InternshipManagementWebsite

(Replace your-username with your actual GitHub username and InternshipManagementWebsite with your repository name if different)

Install Node.js Dependencies:
Open your terminal in the InternshipManagementWebsite directory and run:

npm install

Create .env File:
In the root of the InternshipManagementWebsite directory, create a file named .env.
Add your MySQL database credentials:

PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD
DB_NAME=internship_db

Replace YOUR_MYSQL_ROOT_PASSWORD with the password you set for your MySQL root user during installation.

Database Setup
Open MySQL Workbench and connect to your local MySQL server.

Create a new Schema (Database):
Execute the following SQL query in a new query tab:

CREATE DATABASE internship_db;

Use the Database and Create Tables:
Switch to the newly created database and execute the table creation scripts. Copy and paste the following into a new query tab and run it:

USE internship_db;

-- 1. Create companies table
CREATE TABLE companies (
company_id INT AUTO_INCREMENT PRIMARY KEY,
company_name VARCHAR(255) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL, -- To store hashed passwords
location VARCHAR(255),
description TEXT,
website VARCHAR(255),
industry VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create students table
CREATE TABLE students (
student_id INT AUTO_INCREMENT PRIMARY KEY,
first_name VARCHAR(255) NOT NULL,
last_name VARCHAR(255) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL, -- To store hashed passwords
major VARCHAR(255),
university VARCHAR(255),
gpa DECIMAL(3, 2), -- e.g., 3.50
resume_path VARCHAR(255), -- Path to uploaded resume
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create internships table
CREATE TABLE internships (
internship_id INT AUTO_INCREMENT PRIMARY KEY,
company_id INT NOT NULL,
title VARCHAR(255) NOT NULL,
location VARCHAR(255) NOT NULL,
type ENUM('remote', 'on-site', 'hybrid') NOT NULL,
required_skills TEXT, -- Comma-separated or JSON string of skills
salary DECIMAL(10, 2), -- e.g., 50000.00
duration VARCHAR(255), -- e.g., '3 months', 'Summer'
deadline DATE NOT NULL,
description TEXT,
posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
);

-- 4. Create applications table
CREATE TABLE applications (
application_id INT AUTO_INCREMENT PRIMARY KEY,
student_id INT NOT NULL,
internship_id INT NOT NULL,
resume_path VARCHAR(255), -- Specific resume for this application, if different
cover_letter TEXT,
status ENUM('pending', 'shortlisted', 'accepted', 'rejected') DEFAULT 'pending',
applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
FOREIGN KEY (internship_id) REFERENCES internships(internship_id) ON DELETE CASCADE,
UNIQUE (student_id, internship_id) -- A student can apply to a specific internship only once
);

Running the Application
Start the Backend Server:
Open your terminal in the InternshipManagementWebsite directory and run:

node server.js

You should see messages indicating successful database connection and server startup on http://localhost:3000.

Access the Frontend:
Open your web browser and navigate to:

http://localhost:3000/

The main page will display all available internships.

Usage Guide
Authentication
Sign Up:

Company: Navigate to /company-signup.html or use the navigation link.

Student: Navigate to /student-signup.html or use the navigation link.

Login:

Company: Navigate to /company-login.html or use the navigation link.

Student: Navigate to /student-login.html or use the navigation link.

Upon successful login, you will be redirected to your respective dashboard.

Company Workflow
Login as a Company.

From the Company Dashboard, you can:

Manage Profile: Update your company's information.

Manage Internships: View, create, edit, or delete internship listings.

View All Applications: See a list of all applications submitted for your company's internships and update their statuses.

Student Workflow
Login as a Student.

From the Student Dashboard, you can:

Manage Profile: Update your personal details.

Browse Internships: View all available internships on the index.html page. Click "Apply Now" to submit an application.

My Applications: View the history and current status of all your submitted applications.

Logout
Click the "Logout" button in the navigation bar from any logged-in page. This will clear your session and redirect you to the main internship browsing page.

Project Structure
InternshipManagementWebsite/
├── node_modules/ # Node.js packages (ignored by .gitignore)
├── public/ # Frontend static files
│ ├── company-applications.html
│ ├── company-dashboard.html
│ ├── company-internships.html
│ ├── company-login.html
│ ├── company-signup.html
│ ├── index.html
│ ├── internship-form.html # Modal content for internship creation/edit
│ ├── student-applications.html
│ ├── student-dashboard.html
│ ├── student-login.html
│ ├── student-profile.html
│ ├── student-signup.html
│ ├── style.css # Main CSS for styling
│ ├── auth-status.js # JavaScript for authentication status and logout
│ ├── company-applications.js
│ ├── company-auth.js
│ ├── company-internships.js
│ ├── script.js # JavaScript for main internship browsing/application
│ ├── student-applications.js
│ ├── student-auth.js
│ └── student-profile.js
├── .env # Environment variables (ignored by .gitignore)
├── .gitignore # Specifies intentionally untracked files to ignore
├── package.json # Node.js project metadata and dependencies
├── package-lock.json # Records the exact versions of dependencies
└── server.js # Main backend server logic (Node.js/Express.js)

Future Enhancements (Possible Improvements)
Robust Authentication: Implement JSON Web Tokens (JWT) for more secure and scalable authentication and authorization.

File Uploads: Fully implement resume uploads to a dedicated server directory or cloud storage (e.g., AWS S3).

Search & Filtering: Enhance the student internship browsing with dynamic search capabilities and filtering options (e.g., by domain, location, salary range).

Notifications: Add email or in-app notification systems for application updates.

Admin Dashboard: A separate super-admin interface to manage all companies, students, and system settings.

Password Reset: Implement a "Forgot Password" feature.

Enhanced UI/UX: Further refine the user interface with more advanced animations, interactive elements, and user feedback mechanisms (e.g., custom modals instead of alert()).

Deployment Automation: Set up CI/CD pipelines for automated deployment to a cloud platform.

// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const mysql = require("mysql2"); // Using mysql2 for better features and promise support
const bcrypt = require("bcryptjs"); // For password hashing

const app = express();
const port = process.env.PORT || 3000; // Use port from .env or default to 3000

// Middleware to parse JSON bodies
app.use(express.json());
// Serve static files from the 'public' directory
app.use(express.static("public"));
// --- Database Connection Setup ---
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    return;
  }
  console.log("Successfully connected to MySQL database as ID:", db.threadId);
});

// --- Basic Route to Test Server ---
app.get("/", (req, res) => {
  res.send("Welcome to the Internship Management API!");
});

// --- API Routes for Authentication ---

// Company Sign-up
app.post("/api/company/signup", async (req, res) => {
  const {
    company_name,
    email,
    password,
    location,
    description,
    website,
    industry,
  } = req.body;

  if (!company_name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide company name, email, and password." });
  }

  try {
    // Check if company with this email already exists
    const [existingCompany] = await db
      .promise()
      .query("SELECT * FROM companies WHERE email = ?", [email]);
    if (existingCompany.length > 0) {
      return res
        .status(409)
        .json({ message: "Company with this email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Insert new company into database
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO companies (company_name, email, password, location, description, website, industry) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          company_name,
          email,
          hashedPassword,
          location,
          description,
          website,
          industry,
        ]
      );

    res.status(201).json({
      message: "Company registered successfully!",
      companyId: result.insertId,
    });
  } catch (error) {
    console.error("Error during company signup:", error);
    res.status(500).json({ message: "Internal server error during signup." });
  }
});

// Company Login
app.post("/api/company/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password." });
  }

  try {
    // Find company by email
    const [companies] = await db
      .promise()
      .query("SELECT * FROM companies WHERE email = ?", [email]);
    if (companies.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const company = companies[0];

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Authentication successful
    // In a real app, you'd send a JWT or session ID here
    res.status(200).json({
      message: "Company logged in successfully!",
      companyId: company.company_id,
      companyName: company.company_name,
    });
  } catch (error) {
    console.error("Error during company login:", error);
    res.status(500).json({ message: "Internal server error during login." });
  }
});

// Student Sign-up
app.post("/api/student/signup", async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    major,
    university,
    gpa,
    resume_path,
  } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      message: "Please provide first name, last name, email, and password.",
    });
  }

  try {
    // Check if student with this email already exists
    const [existingStudent] = await db
      .promise()
      .query("SELECT * FROM students WHERE email = ?", [email]);
    if (existingStudent.length > 0) {
      return res
        .status(409)
        .json({ message: "Student with this email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new student into database
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO students (first_name, last_name, email, password, major, university, gpa, resume_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          first_name,
          last_name,
          email,
          hashedPassword,
          major,
          university,
          gpa,
          resume_path,
        ]
      );

    res.status(201).json({
      message: "Student registered successfully!",
      studentId: result.insertId,
    });
  } catch (error) {
    console.error("Error during student signup:", error);
    res.status(500).json({ message: "Internal server error during signup." });
  }
});

// Student Login
app.post("/api/student/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password." });
  }

  try {
    // Find student by email
    const [students] = await db
      .promise()
      .query("SELECT * FROM students WHERE email = ?", [email]);
    if (students.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const student = students[0];

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Authentication successful
    res.status(200).json({
      message: "Student logged in successfully!",
      studentId: student.student_id,
      studentName: `${student.first_name} ${student.last_name}`,
    });
  } catch (error) {
    console.error("Error during student login:", error);
    res.status(500).json({ message: "Internal server error during login." });
  }
});

// --- API Routes for Internship Management (Company Side) ---

// POST: Create a new internship
app.post("/api/internships", async (req, res) => {
  const {
    company_id,
    title,
    location,
    type,
    required_skills,
    salary,
    duration,
    deadline,
    description,
  } = req.body;

  // Basic validation
  if (
    !company_id ||
    !title ||
    !location ||
    !type ||
    !duration ||
    !deadline ||
    !description
  ) {
    return res
      .status(400)
      .json({ message: "Missing required internship fields." });
  }

  try {
    const [result] = await db.promise().query(
      `INSERT INTO internships (company_id, title, location, type, required_skills, salary, duration, deadline, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id,
        title,
        location,
        type,
        required_skills,
        salary,
        duration,
        deadline,
        description,
      ]
    );
    res.status(201).json({
      message: "Internship created successfully!",
      internshipId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating internship:", error);
    res
      .status(500)
      .json({ message: "Internal server error while creating internship." });
  }
});

// GET: Retrieve all internships by a specific company
app.get("/api/internships/company/:company_id", async (req, res) => {
  const { company_id } = req.params;

  try {
    const [internships] = await db
      .promise()
      .query(
        "SELECT * FROM internships WHERE company_id = ? ORDER BY posted_at DESC",
        [company_id]
      );
    if (internships.length === 0) {
      return res
        .status(404)
        .json({ message: "No internships found for this company." });
    }
    res.status(200).json(internships);
  } catch (error) {
    console.error("Error fetching internships by company:", error);
    res.status(500).json({
      message: "Internal server error while fetching company internships.",
    });
  }
});

// GET: Retrieve ALL available internships (for students to browse)
app.get("/api/internships/all", async (req, res) => {
  try {
    // Fetch all internships, ordered by newest first
    // Optionally, join with companies table to display company name
    const [internships] = await db.promise().query(`
            SELECT
                i.*,
                c.company_name
            FROM
                internships i
            JOIN
                companies c ON i.company_id = c.company_id
            ORDER BY
                i.posted_at DESC
        `);
    if (internships.length === 0) {
      return res
        .status(404)
        .json({ message: "No internships currently available." });
    }
    res.status(200).json(internships);
  } catch (error) {
    console.error("Error fetching all internships:", error);
    res.status(500).json({
      message: "Internal server error while fetching all internships.",
    });
  }
});

// GET: Retrieve a single internship by ID
app.get("/api/internships/:internship_id", async (req, res) => {
  const { internship_id } = req.params;

  try {
    const [internships] = await db
      .promise()
      .query("SELECT * FROM internships WHERE internship_id = ?", [
        internship_id,
      ]);
    if (internships.length === 0) {
      return res.status(404).json({ message: "Internship not found." });
    }
    res.status(200).json(internships[0]);
  } catch (error) {
    console.error("Error fetching single internship:", error);
    res
      .status(500)
      .json({ message: "Internal server error while fetching internship." });
  }
});

// PUT: Update an existing internship
app.put("/api/internships/:internship_id", async (req, res) => {
  const { internship_id } = req.params;
  const {
    company_id,
    title,
    location,
    type,
    required_skills,
    salary,
    duration,
    deadline,
    description,
  } = req.body;

  // Basic validation for required fields for update (adjust as needed)
  if (
    !company_id ||
    !title ||
    !location ||
    !type ||
    !duration ||
    !deadline ||
    !description
  ) {
    return res
      .status(400)
      .json({ message: "Missing required fields for internship update." });
  }

  try {
    // Optional: Verify ownership - ensure company_id in request matches the internship's company_id
    const [existingInternship] = await db
      .promise()
      .query("SELECT company_id FROM internships WHERE internship_id = ?", [
        internship_id,
      ]);
    if (existingInternship.length === 0) {
      return res
        .status(404)
        .json({ message: "Internship not found for update." });
    }
    if (existingInternship[0].company_id !== company_id) {
      // This 'company_id' should come from authenticated user's session/token in a real app
      return res
        .status(403)
        .json({ message: "Unauthorized to update this internship." });
    }

    const [result] = await db.promise().query(
      `UPDATE internships
             SET title = ?, location = ?, type = ?, required_skills = ?, salary = ?, duration = ?, deadline = ?, description = ?
             WHERE internship_id = ? AND company_id = ?`,
      [
        title,
        location,
        type,
        required_skills,
        salary,
        duration,
        deadline,
        description,
        internship_id,
        company_id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message:
          "Internship not found or not updated (check ID and company_id).",
      });
    }
    res.status(200).json({ message: "Internship updated successfully!" });
  } catch (error) {
    console.error("Error updating internship:", error);
    res
      .status(500)
      .json({ message: "Internal server error while updating internship." });
  }
});

// DELETE: Delete an internship
app.delete("/api/internships/:internship_id", async (req, res) => {
  const { internship_id } = req.params;
  const { company_id } = req.body; // Assuming company_id is sent for authorization check

  if (!company_id) {
    return res
      .status(400)
      .json({ message: "Company ID is required for authorization." });
  }

  try {
    // Optional: Verify ownership before deleting
    const [existingInternship] = await db
      .promise()
      .query("SELECT company_id FROM internships WHERE internship_id = ?", [
        internship_id,
      ]);
    if (existingInternship.length === 0) {
      return res
        .status(404)
        .json({ message: "Internship not found for deletion." });
    }
    if (existingInternship[0].company_id !== company_id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this internship." });
    }

    const [result] = await db
      .promise()
      .query(
        "DELETE FROM internships WHERE internship_id = ? AND company_id = ?",
        [internship_id, company_id]
      );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message:
          "Internship not found or not deleted (check ID and company_id).",
      });
    }
    res.status(200).json({ message: "Internship deleted successfully!" });
  } catch (error) {
    console.error("Error deleting internship:", error);
    res
      .status(500)
      .json({ message: "Internal server error while deleting internship." });
  }
});

// --- API Routes for Student-Facing Functionality ---

// POST: Student applies to an internship
app.post("/api/applications", async (req, res) => {
  const { student_id, internship_id, resume_path, cover_letter } = req.body;

  // Basic validation
  if (!student_id || !internship_id) {
    return res.status(400).json({
      message: "Student ID and Internship ID are required for application.",
    });
  }

  try {
    // 1. Check if the internship exists
    const [internshipCheck] = await db
      .promise()
      .query("SELECT * FROM internships WHERE internship_id = ?", [
        internship_id,
      ]);
    if (internshipCheck.length === 0) {
      return res.status(404).json({ message: "Internship not found." });
    }

    // 2. Check if the student exists
    const [studentCheck] = await db
      .promise()
      .query("SELECT * FROM students WHERE student_id = ?", [student_id]);
    if (studentCheck.length === 0) {
      return res.status(404).json({ message: "Student not found." });
    }

    // 3. Check if the student has already applied to this internship
    const [existingApplication] = await db
      .promise()
      .query(
        "SELECT * FROM applications WHERE student_id = ? AND internship_id = ?",
        [student_id, internship_id]
      );
    if (existingApplication.length > 0) {
      return res
        .status(409)
        .json({ message: "You have already applied to this internship." });
    }

    // Insert new application
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO applications (student_id, internship_id, resume_path, cover_letter) VALUES (?, ?, ?, ?)",
        [student_id, internship_id, resume_path, cover_letter]
      );
    res.status(201).json({
      message: "Application submitted successfully!",
      applicationId: result.insertId,
    });
  } catch (error) {
    console.error("Error during internship application:", error);
    res
      .status(500)
      .json({ message: "Internal server error while submitting application." });
  }
});

// --- New API Route: GET Applications for a specific Internship (for Companies) ---
// This will allow companies to see who applied to their internships
app.get("/api/internships/:internship_id/applications", async (req, res) => {
  const { internship_id } = req.params;
  // For authorization: In a real app, you'd check if the company requesting this
  // actually owns this internship. For now, we'll assume valid `company_id` will be checked by UI
  // OR we would integrate JWT with company_id
  const { company_id } = req.query; // Assuming company_id might come as a query parameter for verification

  try {
    // Optional: Verify that the requesting company actually owns this internship (stronger authorization)
    if (company_id) {
      const [internship] = await db
        .promise()
        .query("SELECT company_id FROM internships WHERE internship_id = ?", [
          internship_id,
        ]);
      if (internship.length === 0) {
        return res.status(404).json({ message: "Internship not found." });
      }
      if (internship[0].company_id != company_id) {
        // Use == for comparison, as company_id might be string
        return res.status(403).json({
          message:
            "Unauthorized: This internship does not belong to your company.",
        });
      }
    }

    const [applications] = await db.promise().query(
      `
            SELECT
                a.*,
                s.first_name,
                s.last_name,
                s.email,
                s.major,
                s.university,
                s.gpa
            FROM
                applications a
            JOIN
                students s ON a.student_id = s.student_id
            WHERE
                a.internship_id = ?
            ORDER BY
                a.applied_at DESC
        `,
      [internship_id]
    );

    if (applications.length === 0) {
      return res
        .status(404)
        .json({ message: "No applications found for this internship." });
    }
    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications for internship:", error);
    res
      .status(500)
      .json({ message: "Internal server error while fetching applications." });
  }
});

// --- New API Route: Update Application Status (for Companies) ---
app.put("/api/applications/:application_id/status", async (req, res) => {
  const { application_id } = req.params;
  const { status, company_id } = req.body; // company_id for authorization

  // Validate status
  const validStatuses = ["pending", "shortlisted", "accepted", "rejected"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      message:
        "Invalid or missing status. Must be one of: pending, shortlisted, accepted, rejected.",
    });
  }
  if (!company_id) {
    return res
      .status(400)
      .json({ message: "Company ID is required for authorization." });
  }

  try {
    // 1. Get application and associated internship ID
    const [application] = await db
      .promise()
      .query(
        "SELECT internship_id FROM applications WHERE application_id = ?",
        [application_id]
      );
    if (application.length === 0) {
      return res.status(404).json({ message: "Application not found." });
    }
    const internshipIdOfApplication = application[0].internship_id;

    // 2. Verify that the company making the request owns the internship associated with this application
    const [internship] = await db
      .promise()
      .query("SELECT company_id FROM internships WHERE internship_id = ?", [
        internshipIdOfApplication,
      ]);
    if (internship.length === 0 || internship[0].company_id != company_id) {
      return res.status(403).json({
        message:
          "Unauthorized: You do not own the internship associated with this application.",
      });
    }

    // 3. Update application status
    const [result] = await db
      .promise()
      .query("UPDATE applications SET status = ? WHERE application_id = ?", [
        status,
        application_id,
      ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Application not found or status not updated." });
    }
    res.status(200).json({
      message: `Application status updated to '${status}' successfully!`,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({
      message: "Internal server error while updating application status.",
    });
  }
});

// --- API Routes for Student Profile Management ---

// GET: Retrieve a student's profile by ID
app.get("/api/student/profile/:student_id", async (req, res) => {
  const { student_id } = req.params;

  try {
    const [students] = await db
      .promise()
      .query(
        "SELECT student_id, first_name, last_name, email, major, university, gpa, resume_path FROM students WHERE student_id = ?",
        [student_id]
      );
    if (students.length === 0) {
      return res.status(404).json({ message: "Student profile not found." });
    }
    res.status(200).json(students[0]);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res
      .status(500)
      .json({
        message: "Internal server error while fetching student profile.",
      });
  }
});

// PUT: Update a student's profile
app.put("/api/student/profile/:student_id", async (req, res) => {
  const { student_id } = req.params;
  const { first_name, last_name, email, major, university, gpa, resume_path } =
    req.body;

  // Basic validation (at least one field to update should be present)
  if (
    !first_name &&
    !last_name &&
    !email &&
    !major &&
    !university &&
    !gpa &&
    !resume_path
  ) {
    return res.status(400).json({ message: "No update fields provided." });
  }

  try {
    // Build dynamic query for updates
    const updates = [];
    const params = [];
    if (first_name) {
      updates.push("first_name = ?");
      params.push(first_name);
    }
    if (last_name) {
      updates.push("last_name = ?");
      params.push(last_name);
    }
    if (email) {
      // Optional: Check if new email already exists for another student (excluding current student)
      const [existingEmail] = await db
        .promise()
        .query(
          "SELECT student_id FROM students WHERE email = ? AND student_id != ?",
          [email, student_id]
        );
      if (existingEmail.length > 0) {
        return res
          .status(409)
          .json({ message: "Email already taken by another student." });
      }
      updates.push("email = ?");
      params.push(email);
    }
    if (major) {
      updates.push("major = ?");
      params.push(major);
    }
    if (university) {
      updates.push("university = ?");
      params.push(university);
    }
    if (gpa) {
      updates.push("gpa = ?");
      params.push(gpa);
    }
    if (resume_path) {
      updates.push("resume_path = ?");
      params.push(resume_path);
    }

    if (updates.length === 0) {
      // Should be caught by initial check, but good for safety
      return res
        .status(400)
        .json({ message: "No valid update fields provided." });
    }

    params.push(student_id); // Add student_id for the WHERE clause

    const [result] = await db
      .promise()
      .query(
        `UPDATE students SET ${updates.join(", ")} WHERE student_id = ?`,
        params
      );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Student profile not found or no changes made." });
    }
    res.status(200).json({ message: "Student profile updated successfully!" });
  } catch (error) {
    console.error("Error updating student profile:", error);
    res
      .status(500)
      .json({
        message: "Internal server error while updating student profile.",
      });
  }
});

// --- API Route for Student's Own Application History ---

// GET: Retrieve all applications submitted by a specific student
app.get("/api/student/applications/:student_id", async (req, res) => {
  const { student_id } = req.params;

  try {
    // Optional: Check if student exists (already done in application POST, but good for direct access)
    const [studentCheck] = await db
      .promise()
      .query("SELECT student_id FROM students WHERE student_id = ?", [
        student_id,
      ]);
    if (studentCheck.length === 0) {
      return res.status(404).json({ message: "Student not found." });
    }

    const [applications] = await db.promise().query(
      `SELECT
                a.*,
                i.title AS internship_title,
                i.location AS internship_location,
                i.type AS internship_type,
                c.company_name
            FROM
                applications a
            JOIN
                internships i ON a.internship_id = i.internship_id
            JOIN
                companies c ON i.company_id = c.company_id
            WHERE
                a.student_id = ?
            ORDER BY
                a.applied_at DESC`,
      [student_id]
    );

    if (applications.length === 0) {
      return res
        .status(404)
        .json({ message: "No applications found for this student." });
    }
    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching student applications:", error);
    res
      .status(500)
      .json({
        message: "Internal server error while fetching student applications.",
      });
  }
});

// REMINDER: The server.js file should still have the database connection and server listen parts.
// ... (Your existing db.connect and app.listen code) ...

// --- API Routes for Company Profile Management ---

// GET: Retrieve a company's profile by ID
app.get("/api/company/profile/:company_id", async (req, res) => {
  const { company_id } = req.params;

  try {
    const [companies] = await db
      .promise()
      .query(
        "SELECT company_id, company_name, email, location, description, website, industry FROM companies WHERE company_id = ?",
        [company_id]
      );
    if (companies.length === 0) {
      return res.status(404).json({ message: "Company profile not found." });
    }
    res.status(200).json(companies[0]);
  } catch (error) {
    console.error("Error fetching company profile:", error);
    res
      .status(500)
      .json({
        message: "Internal server error while fetching company profile.",
      });
  }
});

// PUT: Update a company's profile
app.put("/api/company/profile/:company_id", async (req, res) => {
  const { company_id } = req.params;
  const { company_name, email, location, description, website, industry } =
    req.body;

  // Basic validation (at least one field to update should be present)
  if (
    !company_name &&
    !email &&
    !location &&
    !description &&
    !website &&
    !industry
  ) {
    return res.status(400).json({ message: "No update fields provided." });
  }

  try {
    // Build dynamic query for updates
    const updates = [];
    const params = [];
    if (company_name) {
      updates.push("company_name = ?");
      params.push(company_name);
    }
    if (email) {
      // Optional: Check if new email already exists for another company (excluding current company)
      const [existingEmail] = await db
        .promise()
        .query(
          "SELECT company_id FROM companies WHERE email = ? AND company_id != ?",
          [email, company_id]
        );
      if (existingEmail.length > 0) {
        return res
          .status(409)
          .json({ message: "Email already taken by another company." });
      }
      updates.push("email = ?");
      params.push(email);
    }
    if (location) {
      updates.push("location = ?");
      params.push(location);
    }
    if (description) {
      updates.push("description = ?");
      params.push(description);
    }
    if (website) {
      updates.push("website = ?");
      params.push(website);
    }
    if (industry) {
      updates.push("industry = ?");
      params.push(industry);
    }

    if (updates.length === 0) {
      // Should be caught by initial check, but good for safety
      return res
        .status(400)
        .json({ message: "No valid update fields provided." });
    }

    params.push(company_id); // Add company_id for the WHERE clause

    const [result] = await db
      .promise()
      .query(
        `UPDATE companies SET ${updates.join(", ")} WHERE company_id = ?`,
        params
      );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Company profile not found or no changes made." });
    }
    res.status(200).json({ message: "Company profile updated successfully!" });
  } catch (error) {
    console.error("Error updating company profile:", error);
    res
      .status(500)
      .json({
        message: "Internal server error while updating company profile.",
      });
  }
});

// REMINDER: The server.js file should still have the database connection and server listen parts.
// ... (Your existing db.connect and app.listen code) ...

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Access it at: http://localhost:${port}`);
});

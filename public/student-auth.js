document.addEventListener("DOMContentLoaded", () => {
  const studentSignupForm = document.getElementById("studentSignupForm");
  const studentLoginForm = document.getElementById("studentLoginForm");
  const messageDiv = document.getElementById("message");

  // Function to display messages (success or error)
  function showMessage(text, isError = true) {
    messageDiv.textContent = text;
    messageDiv.className = isError ? "error-message" : "success-message";
    messageDiv.style.display = "block";
  }

  // --- Student Sign Up Form Handler ---
  if (studentSignupForm) {
    studentSignupForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent default form submission

      // Reset messages
      showMessage("", false);

      const firstName = studentSignupForm.first_name.value;
      const lastName = studentSignupForm.last_name.value;
      const email = studentSignupForm.email.value;
      const password = studentSignupForm.password.value;
      const major = studentSignupForm.major.value;
      const university = studentSignupForm.university.value;
      const gpa = studentSignupForm.gpa.value;
      const resumePath = studentSignupForm.resume_path.value;

      // Client-side validation (basic)
      if (!firstName || !lastName || !email || !password) {
        showMessage(
          "Please fill in all required fields (First Name, Last Name, Email, Password)."
        );
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage("Please enter a valid email address.");
        return;
      }
      if (password.length < 6) {
        showMessage("Password must be at least 6 characters long.");
        return;
      }
      if (gpa && (isNaN(gpa) || parseFloat(gpa) < 0 || parseFloat(gpa) > 4)) {
        showMessage("GPA must be a number between 0.00 and 4.00.");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/api/student/signup",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              first_name: firstName,
              last_name: lastName,
              email,
              password,
              major,
              university,
              gpa: gpa ? parseFloat(gpa) : null, // Convert to number, or null if empty
              resume_path: resumePath,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          showMessage(data.message, false); // Success
          studentSignupForm.reset();
          setTimeout(() => {
            window.location.href = "student-login.html";
          }, 2000);
        } else {
          showMessage(data.message || "Student sign up failed.");
        }
      } catch (error) {
        console.error("Error during student sign up:", error);
        showMessage(
          "An unexpected error occurred during sign up. Please try again later."
        );
      }
    });
  }

  // --- Student Login Form Handler ---
  if (studentLoginForm) {
    studentLoginForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent default form submission

      // Reset messages
      showMessage("", false);

      const email = studentLoginForm.email.value;
      const password = studentLoginForm.password.value;

      // Client-side validation
      if (!email || !password) {
        showMessage("Please enter your email and password.");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/api/student/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          showMessage(data.message, false); // Success
          console.log("Login successful:", data);
          // Store student info (e.g., ID and name) in session storage for later use
          sessionStorage.setItem("loggedInUserType", "student");
          sessionStorage.setItem("studentId", data.studentId);
          sessionStorage.setItem("studentName", data.studentName);

          // Redirect to student dashboard (we'll create this page next)
          setTimeout(() => {
            window.location.href = "student-dashboard.html"; // Placeholder for now
          }, 1000);
        } else {
          showMessage(
            data.message || "Login failed. Please check your credentials."
          );
        }
      } catch (error) {
        console.error("Error during student login:", error);
        showMessage(
          "An unexpected error occurred during login. Please try again later."
        );
      }
    });
  }
});

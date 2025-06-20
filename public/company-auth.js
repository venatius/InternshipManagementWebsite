document.addEventListener("DOMContentLoaded", () => {
  const companySignupForm = document.getElementById("companySignupForm");
  const companyLoginForm = document.getElementById("companyLoginForm");
  const messageDiv = document.getElementById("message");

  // Function to display messages (success or error)
  function showMessage(text, isError = true) {
    messageDiv.textContent = text;
    messageDiv.className = isError ? "error-message" : "success-message";
    messageDiv.style.display = "block"; // Ensure it's visible
  }

  // --- Company Sign Up Form Handler ---
  if (companySignupForm) {
    companySignupForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent default form submission

      // Reset messages
      showMessage("", false); // Clear previous messages

      const companyName = companySignupForm.company_name.value;
      const email = companySignupForm.email.value;
      const password = companySignupForm.password.value;
      const location = companySignupForm.location.value;
      const industry = companySignupForm.industry.value;
      const website = companySignupForm.website.value;
      const description = companySignupForm.description.value;

      // Client-side validation (basic)
      if (!companyName || !email || !password) {
        showMessage(
          "Please fill in all required fields (Company Name, Email, Password)."
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

      try {
        const response = await fetch(
          "http://localhost:3000/api/company/signup",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              company_name: companyName,
              email,
              password,
              location,
              industry,
              website,
              description,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          showMessage(data.message, false); // Success message
          companySignupForm.reset(); // Clear the form
          // Optionally redirect after a short delay
          setTimeout(() => {
            window.location.href = "company-login.html";
          }, 2000);
        } else {
          showMessage(data.message || "Company sign up failed."); // Error message from server
        }
      } catch (error) {
        console.error("Error during company sign up:", error);
        showMessage(
          "An unexpected error occurred during sign up. Please try again later."
        );
      }
    });
  }

  // --- Company Login Form Handler ---
  if (companyLoginForm) {
    companyLoginForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent default form submission

      // Reset messages
      showMessage("", false);

      const email = companyLoginForm.email.value;
      const password = companyLoginForm.password.value;

      // Client-side validation
      if (!email || !password) {
        showMessage("Please enter your email and password.");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/api/company/login",
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
          showMessage(data.message, false); // Success message
          // In a real app, you'd store tokens/user info in localStorage/sessionStorage
          // For now, let's just log and redirect to a placeholder dashboard
          console.log("Login successful:", data);
          // Store company info (e.g., ID and name) in session storage for later use
          sessionStorage.setItem("loggedInUserType", "company");
          sessionStorage.setItem("companyId", data.companyId);
          sessionStorage.setItem("companyName", data.companyName);

          // Redirect to company dashboard (we'll create this page next)
          setTimeout(() => {
            window.location.href = "company-dashboard.html"; // Placeholder for now
          }, 1000);
        } else {
          showMessage(
            data.message || "Login failed. Please check your credentials."
          );
        }
      } catch (error) {
        console.error("Error during company login:", error);
        showMessage(
          "An unexpected error occurred during login. Please try again later."
        );
      }
    });
  }
});

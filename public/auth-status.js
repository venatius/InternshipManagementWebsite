document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  // Check if a user is logged in
  const loggedInUserType = sessionStorage.getItem("loggedInUserType");
  const companyId = sessionStorage.getItem("companyId");
  const studentId = sessionStorage.getItem("studentId");

  // Basic check for logged-in status to show/hide logout button
  if (logoutBtn) {
    if (loggedInUserType) {
      logoutBtn.style.display = "inline-block"; // Show if logged in
    } else {
      logoutBtn.style.display = "none"; // Hide if not logged in
    }

    logoutBtn.addEventListener("click", () => {
      // Clear session storage
      sessionStorage.removeItem("loggedInUserType");
      sessionStorage.removeItem("companyId");
      sessionStorage.removeItem("companyName");
      sessionStorage.removeItem("studentId");
      sessionStorage.removeItem("studentName");

      // Redirect to homepage or login page
      window.location.href = "index.html"; // Or 'student-login.html', 'company-login.html'
    });
  }

  // --- Auth Guard (simple redirection if not logged in) ---
  // This is a basic client-side check. For full security, always rely on server-side checks.
  const path = window.location.pathname;

  if (
    path.includes("company-dashboard.html") &&
    loggedInUserType !== "company"
  ) {
    alert("Access Denied. Please login as a Company."); // Use alert for now for simplicity, replace with custom modal
    window.location.href = "company-login.html";
    return;
  }

  if (
    path.includes("student-dashboard.html") &&
    loggedInUserType !== "student"
  ) {
    alert("Access Denied. Please login as a Student."); // Use alert for now for simplicity, replace with custom modal
    window.location.href = "student-login.html";
    return;
  }

  // Add similar checks for other protected pages as you create them
  // For example:
  // if (path.includes('company-internships.html') && loggedInUserType !== 'company') { ... }
  // Add similar checks for other protected pages as you create them
  if (
    path.includes("company-internships.html") &&
    loggedInUserType !== "company"
  ) {
    alert("Access Denied. Please login as a Company."); // Replace with custom modal later
    window.location.href = "company-login.html";
    return;
  }
  // if (path.includes('student-profile.html') && loggedInUserType !== 'student') { ... }

  // Add similar checks for other protected pages as you create them
  // ... existing checks ...

  if (
    path.includes("company-applications.html") &&
    loggedInUserType !== "company"
  ) {
    alert("Access Denied. Please login as a Company."); // Replace with custom modal later
    window.location.href = "company-login.html";
    return;
  }

  // ... existing checks ...

  if (path.includes("student-profile.html") && loggedInUserType !== "student") {
    alert("Access Denied. Please login as a Student."); // Replace with custom modal later
    window.location.href = "student-login.html";
    return;
  }

  // ... existing checks ...

  if (
    path.includes("student-applications.html") &&
    loggedInUserType !== "student"
  ) {
    alert("Access Denied. Please login as a Student."); // Replace with custom modal later
    window.location.href = "student-login.html";
    return;
  }
});

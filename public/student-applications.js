document.addEventListener("DOMContentLoaded", () => {
  const studentId = sessionStorage.getItem("studentId");
  const loggedInUserType = sessionStorage.getItem("loggedInUserType");
  const myApplicationsListDiv = document.getElementById("myApplicationsList");
  const pageMessageDiv = document.getElementById("message");

  // Redirect if not a logged-in student
  if (!studentId || loggedInUserType !== "student") {
    alert(
      "Access Denied. Please login as a Student to view your applications."
    );
    window.location.href = "student-login.html";
    return;
  }

  function showPageMessage(text, isError = true) {
    pageMessageDiv.textContent = text;
    pageMessageDiv.className = isError ? "error-message" : "success-message";
    pageMessageDiv.style.display = "block";
  }

  // --- Fetch and Display Student's Applications ---
  async function fetchStudentApplications() {
    try {
      showPageMessage("Loading your applications...", false);
      const response = await fetch(
        `http://localhost:3000/api/student/applications/${studentId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch your applications."
        );
      }

      const applications = await response.json();
      console.log("Successfully fetched student applications:", applications);

      myApplicationsListDiv.innerHTML = ""; // Clear previous content

      if (applications.length === 0) {
        myApplicationsListDiv.innerHTML =
          "<p>You have not submitted any applications yet.</p>";
        showPageMessage("", false);
        return;
      }

      applications.forEach((app) => {
        const applicationItem = document.createElement("div");
        applicationItem.className = "application-item";
        applicationItem.innerHTML = `
                        <h3>Applied for: ${app.internship_title} at ${
          app.company_name
        }</h3>
                        <p><strong>Location:</strong> ${
                          app.internship_location
                        }</p>
                        <p><strong>Type:</strong> ${app.internship_type}</p>
                        <p><strong>Applied On:</strong> ${new Date(
                          app.applied_at
                        ).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> <span style="font-weight: bold; color: ${getStatusColor(
                          app.status
                        )};">${app.status.toUpperCase()}</span></p>
                        ${
                          app.cover_letter
                            ? `<p><strong>Your Cover Letter:</strong><br>${app.cover_letter}</p>`
                            : ""
                        }
                    `;
        myApplicationsListDiv.appendChild(applicationItem);
      });
      showPageMessage("", false);
    } catch (error) {
      console.error("Error loading student applications:", error);
      myApplicationsListDiv.innerHTML = `<p style="color: red;">Error loading your applications: ${error.message}</p>`;
      showPageMessage(
        `Error loading your applications: ${error.message}`,
        true
      );
    }
  }

  // Helper function for status display color
  function getStatusColor(status) {
    switch (status) {
      case "pending":
        return "#ffc107"; // Yellow
      case "shortlisted":
        return "#17a2b8"; // Teal
      case "accepted":
        return "#28a745"; // Green
      case "rejected":
        return "#dc3545"; // Red
      default:
        return "#6c757d"; // Gray
    }
  }

  // Initial fetch when page loads
  fetchStudentApplications();
});

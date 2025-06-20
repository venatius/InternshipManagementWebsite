document.addEventListener("DOMContentLoaded", () => {
  const companyId = sessionStorage.getItem("companyId");
  const loggedInUserType = sessionStorage.getItem("loggedInUserType");
  const applicationListDiv = document.getElementById("applicationList");
  const pageMessageDiv = document.getElementById("message");

  // Redirect if not a logged-in company
  if (!companyId || loggedInUserType !== "company") {
    alert("Access Denied. Please login as a Company to view applications.");
    window.location.href = "company-login.html";
    return;
  }

  function showPageMessage(text, isError = true) {
    pageMessageDiv.textContent = text;
    pageMessageDiv.className = isError ? "error-message" : "success-message";
    pageMessageDiv.style.display = "block";
  }

  // --- Fetch and Display All Applications for Company's Internships ---
  async function fetchAllApplications() {
    try {
      showPageMessage("Loading all applications...", false);

      // First, fetch all internships posted by this company
      const internshipsResponse = await fetch(
        `http://localhost:3000/api/internships/company/${companyId}`
      );
      if (!internshipsResponse.ok) {
        const errorData = await internshipsResponse.json();
        throw new Error(
          errorData.message ||
            "Failed to fetch company internships to get applications."
        );
      }
      const internships = await internshipsResponse.json();

      if (internships.length === 0) {
        applicationListDiv.innerHTML =
          "<p>You have not posted any internships, so there are no applications.</p>";
        showPageMessage("", false);
        return;
      }

      let allApplications = [];

      // For each internship, fetch its applications
      for (const internship of internships) {
        const applicationsResponse = await fetch(
          `http://localhost:3000/api/internships/${internship.internship_id}/applications?company_id=${companyId}`
        );
        // Note: We include company_id as query param for the server-side authorization check
        if (applicationsResponse.ok) {
          const applications = await applicationsResponse.json();
          // Add internship title to each application for easier display
          applications.forEach((app) => {
            app.internship_title = internship.title;
            app.internship_id = internship.internship_id; // Add internship_id for reference
          });
          allApplications = allApplications.concat(applications);
        } else if (applicationsResponse.status === 404) {
          // No applications for this specific internship, which is fine
          console.warn(
            `No applications found for internship ID: ${internship.internship_id}`
          );
        } else {
          const errorData = await applicationsResponse.json();
          console.error(
            `Error fetching applications for internship ${internship.internship_id}:`,
            errorData.message
          );
          // Optionally, show a partial error message but continue loading others
        }
      }

      // Sort all applications by applied_at date
      allApplications.sort(
        (a, b) => new Date(b.applied_at) - new Date(a.applied_at)
      );

      applicationListDiv.innerHTML = ""; // Clear previous content

      if (allApplications.length === 0) {
        applicationListDiv.innerHTML =
          "<p>No applications have been submitted for your internships yet.</p>";
        showPageMessage("", false);
        return;
      }

      allApplications.forEach((app) => {
        const applicationItem = document.createElement("div");
        applicationItem.className = "application-item";
        applicationItem.innerHTML = `
                        <h3>Application for: ${app.internship_title}</h3>
                        <p><strong>Applicant:</strong> ${app.first_name} ${
          app.last_name
        } (${app.email})</p>
                        <p><strong>Major:</strong> ${app.major || "N/A"}</p>
                        <p><strong>University:</strong> ${
                          app.university || "N/A"
                        }</p>
                        <p><strong>GPA:</strong> ${app.gpa || "N/A"}</p>
                        <p><strong>Applied On:</strong> ${new Date(
                          app.applied_at
                        ).toLocaleDateString()}</p>
                        <p><strong>Current Status:</strong> <span id="status-${
                          app.application_id
                        }">${app.status}</span></p>
                        ${
                          app.resume_path
                            ? `<p><a href="${app.resume_path}" target="_blank">View Resume</a></p>`
                            : ""
                        }
                        ${
                          app.cover_letter
                            ? `<p><strong>Cover Letter:</strong><br>${app.cover_letter}</p>`
                            : ""
                        }
                        <div class="application-actions">
                            <select id="statusSelect-${
                              app.application_id
                            }" data-application-id="${app.application_id}">
                                <option value="pending" ${
                                  app.status === "pending" ? "selected" : ""
                                }>Pending</option>
                                <option value="shortlisted" ${
                                  app.status === "shortlisted" ? "selected" : ""
                                }>Shortlisted</option>
                                <option value="accepted" ${
                                  app.status === "accepted" ? "selected" : ""
                                }>Accepted</option>
                                <option value="rejected" ${
                                  app.status === "rejected" ? "selected" : ""
                                }>Rejected</option>
                            </select>
                            <button class="update-status-btn" data-application-id="${
                              app.application_id
                            }">Update Status</button>
                        </div>
                    `;
        applicationListDiv.appendChild(applicationItem);
      });
      showPageMessage("", false);
    } catch (error) {
      console.error("Error fetching all applications:", error);
      showPageMessage(`Error loading applications: ${error.message}`, true);
    }
  }

  // --- Handle Update Status Button Click ---
  applicationListDiv.addEventListener("click", async (event) => {
    if (event.target.classList.contains("update-status-btn")) {
      const applicationId = event.target.dataset.applicationId;
      const statusSelect = document.getElementById(
        `statusSelect-${applicationId}`
      );
      const newStatus = statusSelect.value;

      if (!newStatus) {
        showPageMessage("Please select a status to update.", true);
        return;
      }

      try {
        showPageMessage("Updating status...", false);
        const response = await fetch(
          `http://localhost:3000/api/applications/${applicationId}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: newStatus,
              company_id: parseInt(companyId),
            }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          showPageMessage(data.message, false);
          // Update the displayed status directly without re-fetching all
          document.getElementById(`status-${applicationId}`).textContent =
            newStatus;
        } else {
          showPageMessage(data.message || "Error updating status.", true);
        }
      } catch (error) {
        console.error("Error updating application status:", error);
        showPageMessage(
          "An unexpected error occurred during status update. Please try again.",
          true
        );
      }
    }
  });

  // Initial fetch when page loads
  fetchAllApplications();
});

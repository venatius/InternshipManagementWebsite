document.addEventListener("DOMContentLoaded", () => {
  const internshipListDiv = document.getElementById("internship-list");
  const loggedInUserType = sessionStorage.getItem("loggedInUserType");
  const studentId = sessionStorage.getItem("studentId");
  const studentName = sessionStorage.getItem("studentName");
  const companyId = sessionStorage.getItem("companyId");
  const companyName = sessionStorage.getItem("companyName");

  const loggedInUserWelcome = document.getElementById("loggedInUserWelcome");

  // Application Modal elements
  const applyModal = document.getElementById("applyModal");
  const applyCloseButton = applyModal
    ? applyModal.querySelector(".close-button")
    : null;
  const applyForm = document.getElementById("applyForm");
  const applyInternshipTitle = document.getElementById("applyInternshipTitle");
  const applyInternshipId = document.getElementById("applyInternshipId");
  const applyFormMessageDiv = document.getElementById("applyFormMessage");

  // Display welcome message for logged-in users
  if (loggedInUserWelcome) {
    if (loggedInUserType === "student" && studentName) {
      loggedInUserWelcome.textContent = `Welcome, ${studentName}! Ready to find your next internship?`;
    } else if (loggedInUserType === "company" && companyName) {
      loggedInUserWelcome.textContent = `Welcome, ${companyName}! Manage your internships from the dashboard.`;
    } else {
      loggedInUserWelcome.textContent =
        "Sign up or login to apply for internships or post opportunities!";
    }
  }

  // Helper function for messages, consistent with style.css
  function showApplyFormMessage(text, isError = true) {
    applyFormMessageDiv.textContent = text;
    applyFormMessageDiv.className = isError
      ? "error-message"
      : "success-message"; // Use custom classes
    applyFormMessageDiv.style.display = "block";
  }

  async function fetchInternships() {
    try {
      internshipListDiv.innerHTML =
        '<p class="text-muted">Loading internships...</p>'; // Show loading message with Bootstrap class
      const response = await fetch("http://localhost:3000/api/internships/all");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch internships from the server."
        );
      }

      const internships = await response.json();
      console.log("Successfully fetched internships:", internships);

      internshipListDiv.innerHTML = ""; // Clear loading message

      if (internships.length === 0) {
        internshipListDiv.innerHTML =
          '<p class="text-muted">No internships currently available. Please check back later!</p>';
        return;
      }

      internships.forEach((internship) => {
        const internshipItem = document.createElement("div");
        internshipItem.className = "internship-item"; // Custom class for styling

        const salaryDisplay =
          internship.salary !== null &&
          typeof internship.salary === "number" &&
          !isNaN(internship.salary)
            ? " | Salary: $" + internship.salary.toFixed(2)
            : "";

        let applyButtonHtml = "";
        // Only show apply button if a student is logged in AND it's not their own company's internship
        if (
          loggedInUserType === "student" &&
          parseInt(companyId) !== internship.company_id
        ) {
          // Ensure companyId is parsed to int for comparison
          applyButtonHtml = `<button class="btn btn-primary apply-btn" data-internship-id="${internship.internship_id}" data-internship-title="${internship.title}">Apply Now</button>`;
        } else if (
          loggedInUserType === "company" &&
          parseInt(companyId) === internship.company_id
        ) {
          applyButtonHtml = `<p class="text-muted font-italic mt-2">(This is your internship)</p>`; // Use Bootstrap classes
        } else if (!loggedInUserType) {
          applyButtonHtml = `<p class="text-muted font-italic mt-2">Login as a student to apply</p>`; // Use Bootstrap classes
        }

        internshipItem.innerHTML = `
                        <h3>${internship.title} at ${
          internship.company_name
        }</h3>
                        <p><strong>Location:</strong> ${internship.location}</p>
                        <p><strong>Type:</strong> ${internship.type}</p>
                        <p><strong>Duration:</strong> ${internship.duration}</p>
                        <p><strong>Deadline:</strong> ${new Date(
                          internship.deadline
                        ).toLocaleDateString()}</p>
                        <p>${internship.description}</p>
                        <p class="text-muted">
                            <em>
                                Skills: ${internship.required_skills || "N/A"}
                                ${salaryDisplay}
                            </em>
                        </p>
                        ${applyButtonHtml}
                    `;
        internshipListDiv.appendChild(internshipItem);
      });
    } catch (error) {
      console.error("Error fetching internships:", error);
      internshipListDiv.innerHTML = `<p class="text-danger">Error loading internships: ${error.message}</p>`;
    }
  }

  // --- Application Modal Functionality ---
  if (internshipListDiv) {
    internshipListDiv.addEventListener("click", (event) => {
      if (event.target.classList.contains("apply-btn")) {
        const id = event.target.dataset.internshipId;
        const title = event.target.dataset.internshipTitle;

        applyInternshipTitle.textContent = title;
        applyInternshipId.value = id;
        applyForm.reset(); // Clear form fields
        applyFormMessageDiv.textContent = ""; // Clear previous messages
        applyModal.style.display = "block";
      }
    });
  }

  if (applyCloseButton) {
    applyCloseButton.addEventListener("click", () => {
      applyModal.style.display = "none";
    });
  }

  window.addEventListener("click", (event) => {
    if (event.target == applyModal) {
      applyModal.style.display = "none";
    }
  });

  // --- Handle Application Form Submission ---
  if (applyForm) {
    applyForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      showApplyFormMessage("Submitting application...", false);

      const internshipId = applyInternshipId.value;
      const resumePath = applyForm.applyResumePath.value;
      const coverLetter = applyForm.applyCoverLetter.value;

      const payload = {
        student_id: parseInt(studentId), // Ensure student_id is sent as a number
        internship_id: parseInt(internshipId),
        resume_path: resumePath || null, // Send null if empty
        cover_letter: coverLetter || null, // Send null if empty
      };

      try {
        const response = await fetch("http://localhost:3000/api/applications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          showApplyFormMessage(data.message, false);
          applyForm.reset();
          // Optionally hide modal after successful save
          setTimeout(() => {
            applyModal.style.display = "none";
          }, 1500);
          // No need to refresh internships, as application status isn't shown here
        } else {
          showApplyFormMessage(
            data.message || "Error submitting application.",
            true
          );
        }
      } catch (error) {
        console.error("Error submitting application:", error);
        showApplyFormMessage(
          "An unexpected error occurred. Please try again.",
          true
        );
      }
    });
  }

  fetchInternships(); // Initial fetch when page loads
});

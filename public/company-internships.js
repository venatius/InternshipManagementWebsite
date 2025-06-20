document.addEventListener("DOMContentLoaded", () => {
  const companyId = sessionStorage.getItem("companyId");
  const loggedInUserType = sessionStorage.getItem("loggedInUserType");
  const internshipListDiv = document.getElementById("internshipList");
  const addInternshipBtn = document.getElementById("addInternshipBtn");
  const pageMessageDiv = document.getElementById("message");

  // Modal elements
  const internshipModal = document.getElementById("internshipModal");
  const closeButton = document.querySelector(".close-button");
  const internshipForm = document.getElementById("internshipForm");
  const formTitle = document.getElementById("formTitle");
  const formMessageDiv = document.getElementById("formMessage");

  // Redirect if not a logged-in company
  if (!companyId || loggedInUserType !== "company") {
    alert("Access Denied. Please login as a Company to manage internships.");
    window.location.href = "company-login.html";
    return;
  }

  function showPageMessage(text, isError = true) {
    pageMessageDiv.textContent = text;
    pageMessageDiv.className = isError ? "error-message" : "success-message";
    pageMessageDiv.style.display = "block";
  }

  function showFormMessage(text, isError = true) {
    formMessageDiv.textContent = text;
    formMessageDiv.className = isError ? "error-message" : "success-message";
    formMessageDiv.style.display = "block";
  }

  // --- Fetch and Display Internships ---
  async function fetchCompanyInternships() {
    try {
      showPageMessage("Loading your internships...", false);
      const response = await fetch(
        `http://localhost:3000/api/internships/company/${companyId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch company internships."
        );
      }

      const internships = await response.json();
      internshipListDiv.innerHTML = ""; // Clear previous content

      if (internships.length === 0) {
        internshipListDiv.innerHTML =
          '<p>You have not posted any internships yet. Click "Post New Internship" to get started!</p>';
        showPageMessage("", false); // Clear loading message
        return;
      }

      internships.forEach((internship) => {
        const internshipItem = document.createElement("div");
        internshipItem.className = "internship-item";
        internshipItem.innerHTML = `
                        <h3>${internship.title}</h3>
                        <div class="internship-actions">
                            <button class="edit-btn" data-id="${
                              internship.internship_id
                            }">Edit</button>
                            <button class="delete-btn" data-id="${
                              internship.internship_id
                            }">Delete</button>
                        </div>
                        <p><strong>Location:</strong> ${internship.location}</p>
                        <p><strong>Type:</strong> ${internship.type}</p>
                        <p><strong>Duration:</strong> ${internship.duration}</p>
                        <p><strong>Deadline:</strong> ${new Date(
                          internship.deadline
                        ).toLocaleDateString()}</p>
                        <p>${internship.description}</p>
                        <p>
                            <em>
                                Skills: ${internship.required_skills || "N/A"}
                                ${
                                  internship.salary !== null &&
                                  typeof internship.salary === "number" &&
                                  !isNaN(internship.salary)
                                    ? " | Salary: $" +
                                      internship.salary.toFixed(2)
                                    : ""
                                }
                            </em>
                        </p>
                        <p><small>Posted on: ${new Date(
                          internship.posted_at
                        ).toLocaleDateString()}</small></p>
                    `;
        internshipListDiv.appendChild(internshipItem);
      });
      showPageMessage("", false); // Clear success message
    } catch (error) {
      console.error("Error loading company internships:", error);
      showPageMessage(`Error loading your internships: ${error.message}`, true);
    }
  }

  // --- Modal Functionality ---
  addInternshipBtn.addEventListener("click", () => {
    formTitle.textContent = "Post New Internship";
    internshipForm.reset(); // Clear form fields
    document.getElementById("internship_id").value = ""; // Clear hidden ID for new entry
    formMessageDiv.textContent = ""; // Clear any previous form messages
    internshipModal.style.display = "block";
  });

  closeButton.addEventListener("click", () => {
    internshipModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target == internshipModal) {
      internshipModal.style.display = "none";
    }
  });

  // --- Handle Create/Update Internship Form Submission ---
  internshipForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showFormMessage("Saving...", false);

    const internshipId = document.getElementById("internship_id").value;
    const method = internshipId ? "PUT" : "POST";
    const url = internshipId
      ? `http://localhost:3000/api/internships/${internshipId}`
      : "http://localhost:3000/api/internships";

    const payload = {
      company_id: parseInt(companyId), // Ensure company_id is sent as a number
      title: internshipForm.title.value,
      location: internshipForm.location.value,
      type: internshipForm.type.value,
      required_skills: internshipForm.required_skills.value,
      salary: internshipForm.salary.value
        ? parseFloat(internshipForm.salary.value)
        : null,
      duration: internshipForm.duration.value,
      deadline: internshipForm.deadline.value,
      description: internshipForm.description.value,
    };

    // Basic client-side validation
    if (
      !payload.title ||
      !payload.location ||
      !payload.type ||
      !payload.duration ||
      !payload.deadline ||
      !payload.description
    ) {
      showFormMessage("Please fill in all required fields.");
      return;
    }
    if (
      payload.salary !== null &&
      (isNaN(payload.salary) || payload.salary < 0)
    ) {
      showFormMessage("Salary must be a valid non-negative number.");
      return;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        showFormMessage(data.message, false);
        internshipModal.style.display = "none";
        fetchCompanyInternships(); // Refresh the list
      } else {
        showFormMessage(data.message || "Error saving internship.");
      }
    } catch (error) {
      console.error("Error saving internship:", error);
      showFormMessage("An unexpected error occurred. Please try again.");
    }
  });

  // --- Edit and Delete Handlers (Delegation) ---
  internshipListDiv.addEventListener("click", async (event) => {
    if (event.target.classList.contains("edit-btn")) {
      const id = event.target.dataset.id;
      try {
        const response = await fetch(
          `http://localhost:3000/api/internships/${id}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch internship for editing."
          );
        }
        const internship = await response.json();

        // Populate form with existing data
        formTitle.textContent = "Edit Internship";
        document.getElementById("internship_id").value =
          internship.internship_id;
        internshipForm.title.value = internship.title;
        internshipForm.location.value = internship.location;
        internshipForm.type.value = internship.type;
        internshipForm.required_skills.value = internship.required_skills;
        internshipForm.salary.value = internship.salary;
        internshipForm.duration.value = internship.duration;
        internshipForm.deadline.value = internship.deadline;
        internshipForm.description.value = internship.description;

        formMessageDiv.textContent = ""; // Clear messages
        internshipModal.style.display = "block";
      } catch (error) {
        console.error("Error editing internship:", error);
        showPageMessage(
          `Error loading internship for edit: ${error.message}`,
          true
        );
      }
    } else if (event.target.classList.contains("delete-btn")) {
      const id = event.target.dataset.id;
      if (confirm("Are you sure you want to delete this internship?")) {
        // Using confirm for simplicity, replace with custom modal
        try {
          showPageMessage("Deleting internship...", false);
          const response = await fetch(
            `http://localhost:3000/api/internships/${id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ company_id: parseInt(companyId) }), // Send company_id for server-side auth
            }
          );

          const data = await response.json();
          if (response.ok) {
            showPageMessage(data.message, false);
            fetchCompanyInternships(); // Refresh the list
          } else {
            showPageMessage(data.message || "Error deleting internship.", true);
          }
        } catch (error) {
          console.error("Error deleting internship:", error);
          showPageMessage(
            "An unexpected error occurred during deletion. Please try again.",
            true
          );
        }
      }
    }
  });

  // Initial fetch when page loads
  fetchCompanyInternships();
});

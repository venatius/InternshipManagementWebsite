document.addEventListener("DOMContentLoaded", () => {
  const studentId = sessionStorage.getItem("studentId");
  const loggedInUserType = sessionStorage.getItem("loggedInUserType");

  const profileDisplayDiv = document.getElementById("profileDisplay");
  const profileEditFormDiv = document.getElementById("profileEditForm");
  const editProfileBtn = document.getElementById("editProfileBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const studentProfileForm = document.getElementById("studentProfileForm");
  const pageMessageDiv = document.getElementById("pageMessage");
  const formMessageDiv = document.getElementById("formMessage");

  // Redirect if not a logged-in student
  if (!studentId || loggedInUserType !== "student") {
    alert("Access Denied. Please login as a Student to view your profile.");
    window.location.href = "student-login.html";
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

  // --- Fetch and Display Student Profile ---
  async function fetchStudentProfile() {
    try {
      showPageMessage("Loading profile...", false);
      const response = await fetch(
        `http://localhost:3000/api/student/profile/${studentId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch student profile."
        );
      }

      const student = await response.json();

      // Populate display fields
      document.getElementById("displayFirstName").textContent =
        student.first_name || "N/A";
      document.getElementById("displayLastName").textContent =
        student.last_name || "N/A";
      document.getElementById("displayEmail").textContent =
        student.email || "N/A";
      document.getElementById("displayMajor").textContent =
        student.major || "N/A";
      document.getElementById("displayUniversity").textContent =
        student.university || "N/A";
      document.getElementById("displayGPA").textContent =
        student.gpa !== null ? student.gpa.toFixed(2) : "N/A";

      const resumeLinkElem = document.getElementById("displayResumeLink");
      if (student.resume_path) {
        resumeLinkElem.innerHTML = `<a href="${student.resume_path}" target="_blank">${student.resume_path}</a>`;
      } else {
        resumeLinkElem.textContent = "N/A";
      }

      // Populate form fields for editing
      document.getElementById("editFirstName").value = student.first_name || "";
      document.getElementById("editLastName").value = student.last_name || "";
      document.getElementById("editEmail").value = student.email || "";
      document.getElementById("editMajor").value = student.major || "";
      document.getElementById("editUniversity").value =
        student.university || "";
      document.getElementById("editGPA").value =
        student.gpa !== null ? student.gpa.toFixed(2) : "";
      document.getElementById("editResumePath").value =
        student.resume_path || "";

      profileDisplayDiv.style.display = "block";
      profileEditFormDiv.style.display = "none";
      showPageMessage("", false); // Clear message after loading
    } catch (error) {
      console.error("Error fetching student profile:", error);
      showPageMessage(`Error loading your profile: ${error.message}`, true);
    }
  }

  // --- Event Listeners for Edit/Cancel ---
  editProfileBtn.addEventListener("click", () => {
    profileDisplayDiv.style.display = "none";
    profileEditFormDiv.style.display = "block";
    formMessageDiv.textContent = ""; // Clear previous messages
  });

  cancelEditBtn.addEventListener("click", () => {
    profileDisplayDiv.style.display = "block";
    profileEditFormDiv.style.display = "none";
    formMessageDiv.textContent = ""; // Clear previous messages
    fetchStudentProfile(); // Re-fetch to reset form with current data
  });

  // --- Handle Student Profile Form Submission ---
  studentProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showFormMessage("Saving changes...", false);

    const payload = {
      first_name: studentProfileForm.editFirstName.value,
      last_name: studentProfileForm.editLastName.value,
      email: studentProfileForm.editEmail.value,
      major: studentProfileForm.editMajor.value,
      university: studentProfileForm.editUniversity.value,
      gpa: studentProfileForm.editGPA.value
        ? parseFloat(studentProfileForm.editGPA.value)
        : null,
      resume_path: studentProfileForm.editResumePath.value,
    };

    // Client-side validation
    if (!payload.first_name || !payload.last_name || !payload.email) {
      showFormMessage("First Name, Last Name, and Email are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      showFormMessage("Please enter a valid email address.");
      return;
    }
    if (
      payload.gpa !== null &&
      (isNaN(payload.gpa) || payload.gpa < 0 || payload.gpa > 4)
    ) {
      showFormMessage("GPA must be a number between 0.00 and 4.00.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/student/profile/${studentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showFormMessage(data.message, false);
        // Update session storage if name changed
        sessionStorage.setItem(
          "studentName",
          `${payload.first_name} ${payload.last_name}`
        );
        fetchStudentProfile(); // Re-fetch to update displayed data
        // Optionally hide form and show display after successful save
        setTimeout(() => {
          profileDisplayDiv.style.display = "block";
          profileEditFormDiv.style.display = "none";
        }, 1500);
      } else {
        showFormMessage(data.message || "Error updating profile.", true);
      }
    } catch (error) {
      console.error("Error updating student profile:", error);
      showFormMessage("An unexpected error occurred. Please try again.", true);
    }
  });

  // Initial fetch when page loads
  fetchStudentProfile();
});

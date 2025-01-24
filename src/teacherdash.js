document.addEventListener("DOMContentLoaded", async function () {
    const teacherEmail = localStorage.getItem("loggedInTeacherEmail");

    if (!teacherEmail) {
        console.error("Teacher email not found in local storage.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8081/api/users/teacher/email/${teacherEmail}/students`);
        if (response.ok) {
            const students = await response.json();
            renderStudentList(students, teacherEmail);
        } else {
            console.error("Failed to fetch students:", await response.text());
        }
    } catch (error) {
        console.error("Error fetching students:", error);
    }
});


function renderStudentList(students, teacherEmail) {
    const studentListContainer = document.getElementById("students");
    studentListContainer.innerHTML = ""; // Clear previous list

    students.forEach((student) => {
        const studentCard = document.createElement("div");
        studentCard.className = "student-card";
        studentCard.dataset.studentEmail = student.email;

        // ✅ Use color from backend
        const colorCode = document.createElement("div");
        colorCode.className = "color-code";
        colorCode.style.backgroundColor = student.colorCode;

        const details = document.createElement("div");
        details.className = "details";
        details.innerHTML = `
            <p><strong>${student.firstName} ${student.lastName}</strong></p>
            <p>Math Level: ${student.mathLevel}</p>
        `;

        const userId = document.createElement("div");
        userId.className = "user-id";
        userId.textContent = `UserID: ${student.id ? student.id : "Not Found"}`;  // ✅ Fix UserID

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.innerHTML = `<img src="/public/img/deleteicon.png" alt="Delete" width="20">`;
        deleteButton.onclick = (event) => {
            event.stopPropagation();
            confirmDelete(teacherEmail, student.email, studentCard);
        };

        // **Navigate to teacherhwcheck.html when clicking a student card**
        studentCard.addEventListener("click", function () {
            window.location.href = `teacherhw.html?studentEmail=${student.email}`;
        });

        studentCard.appendChild(colorCode);
        studentCard.appendChild(details);
        studentCard.appendChild(userId);
        studentCard.appendChild(deleteButton);

        studentListContainer.appendChild(studentCard);
    });
}




// Confirm before deleting a student
function confirmDelete(teacherEmail, studentEmail, studentCard) {
    const confirmation = confirm("Are you sure you want to remove this student?");
    if (confirmation) {
        deleteStudent(teacherEmail, studentEmail, studentCard);
    }
}

// Delete Student Function
async function deleteStudent(teacherEmail, studentEmail, studentCard) {
    try {
        const response = await fetch(`http://localhost:8081/api/users/teacher/remove-student`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ teacherEmail, studentEmail })
        });

        if (response.ok) {
            alert("Student removed successfully!");
            studentCard.remove(); // Remove student from the list visually
        } else {
            const error = await response.text();
            alert(`Error: ${error}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}


// Resize Profile Photo
function setProfilePhotoSize(width, height) {
    const profilePhoto = document.getElementById("profile-photo");
    if (profilePhoto) {
        profilePhoto.style.width = width + "px";
        profilePhoto.style.height = height + "px";
    }
}
setProfilePhotoSize(100, 100);

// Profile Photo Click Event (Navigates to My Info Page)
document.getElementById("profile-photo").addEventListener("click", function () {
    window.location.href = "../../public/myinfo.html";
});

// Check My Schedule Button Event
document.getElementById("checkScheduleButton").addEventListener("click", function () {
    window.location.href = "teacherschedule.html";
});

// Open and Close Add Student Modal
const addStudentButton = document.getElementById("addStudentButton");
const addStudentModal = document.getElementById("addStudentModal");
const closeModal = document.getElementById("closeModal");

addStudentButton.addEventListener("click", () => {
    addStudentModal.style.display = "block";
});

closeModal.addEventListener("click", () => {
    addStudentModal.style.display = "none";
});

// Submit Form to Add Student
const addStudentForm = document.getElementById("addStudentForm");

addStudentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const teacherEmail = localStorage.getItem("loggedInTeacherEmail");
    const studentEmail = document.getElementById("studentEmail").value;

    try {
        const response = await fetch("http://localhost:8081/api/users/teacher/add-student", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ teacherEmail, studentEmail })
        });

        if (response.ok) {
            alert("Student added successfully!");
            addStudentForm.reset();
            location.reload();
        } else {
            const error = await response.text();
            if (error.includes("already assigned")) {
                alert("This student is already assigned to you!");
            } else {
                alert(`Error: ${error}`);
            }
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});


// Close Modal when Clicking Outside
window.addEventListener("click", (event) => {
    if (event.target === addStudentModal) {
        addStudentModal.style.display = "none";
    }
});

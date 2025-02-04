document.addEventListener("DOMContentLoaded", async function () {
    // ✅ Get the latest student email from the URL every time
    const urlParams = new URLSearchParams(window.location.search);
    const studentEmail = urlParams.get("studentEmail");

    console.log("Updated student email:", studentEmail); // ✅ Debugging: Check if email changes

    if (!studentEmail) {
        console.error("❌ Student email not found in URL.");
        return;
    }

    try {
        // ✅ Step 1: Fetch studentId using studentEmail
        const studentResponse = await fetch(`http://localhost:8081/api/users/student-id/${encodeURIComponent(studentEmail)}`);
        
        if (!studentResponse.ok) {
            console.error("❌ Failed to fetch student ID:", await studentResponse.text());
            return;
        }

        const studentData = await studentResponse.json();
        const studentId = studentData.studentId;

        console.log("✅ Fetched student ID:", studentId); // ✅ Debugging: Check if student ID updates

        // ✅ Store studentId in localStorage (for adding homework later)
        localStorage.setItem("currentStudentId", studentId);

        // ✅ Step 2: Fetch homework using studentId (NO teacherEmail needed)
        const homeworkResponse = await fetch(`http://localhost:8081/api/homework/student-id/${studentId}`);
        if (homeworkResponse.ok) {
            const homeworkList = await homeworkResponse.json();
            
            console.log("✅ Fetched Homework List:", homeworkList); // ✅ Debugging: Check if homework data is received
            
            renderHomeworkList(homeworkList);
        } else {
            console.error("❌ Failed to fetch homework:", await homeworkResponse.text());
        }
    } catch (error) {
        console.error("❌ Error fetching student ID or homework:", error);
    }
});

// ✅ Add Homework Function (Uses studentId, NO teacherEmail needed)
async function addHomework() {
    const homeworkInput = document.getElementById("homework-input");
    const title = homeworkInput.value.trim();
    const studentId = localStorage.getItem("currentStudentId");
    const teacherEmail = localStorage.getItem("loggedInTeacherEmail"); // ✅ Use email instead

    if (!title) {
        alert("❌ Please enter homework before adding.");
        return;
    }
    if (!teacherEmail) {
        console.error("❌ Teacher email is missing in localStorage.");
        return;
    }

    const requestData = { studentId, teacherEmail, title }; // ✅ teacherId 대신 teacherEmail만 전달

    console.log("🚀 Sending POST request:", requestData); // ✅ Debugging

    try {
        const response = await fetch("http://localhost:8081/api/homework", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            homeworkInput.value = "";  
            location.reload();
        } else {
            const errorText = await response.text();
            console.error("❌ Failed to add homework:", errorText);
            alert("Failed to add homework. " + errorText);
        }
    } catch (error) {
        console.error("❌ Error:", error);
        alert(`Error: ${error.message}`);
    }
}

async function fetchHomework() {
    const studentId = localStorage.getItem("currentStudentId");
    const teacherEmail = localStorage.getItem("loggedInTeacherEmail"); // ✅ Use email instead of ID

    if (!studentId || !teacherEmail) {
        console.error("❌ Missing student ID or teacher email.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8081/api/homework/teacher/${teacherEmail}/student/${studentId}`);
        if (response.ok) {
            const homeworkList = await response.json();
            renderHomeworkList(homeworkList);
        } else {
            console.error("❌ Failed to fetch homework:", await response.text());
        }
    } catch (error) {
        console.error("❌ Error fetching homework:", error);
    }
}



// ✅ Render Homework Checklist
function renderHomeworkList(homeworkList) {
    const homeworkContainer = document.getElementById("homework-list");
    homeworkContainer.innerHTML = ""; // ✅ Clear previous list

    // ✅ Sort: Unfinished first, Completed last
    homeworkList.sort((a, b) => a.completed - b.completed);

    homeworkList.forEach((hw) => {
        const homeworkItem = document.createElement("div");
        homeworkItem.className = "homework-item";
        homeworkItem.style.backgroundColor = hw.completed ? "#a0a0a0" : "#ffffff"; // ✅ Darker for completed

        // ✅ Checkbox for completion
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = hw.completed;
        checkbox.addEventListener("change", () => toggleHomeworkCompletion(hw.id, checkbox.checked));

        // ✅ Homework title
        const title = document.createElement("span");
        title.textContent = hw.title;
        title.style.textDecoration = hw.completed ? "line-through" : "none";

        // ✅ Delete button
        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = `<img src="/public/img/deleteicon.png" alt="Delete" width="16">`;
        deleteButton.onclick = () => confirmDelete(hw.id, homeworkItem);

        homeworkItem.appendChild(checkbox);
        homeworkItem.appendChild(title);
        homeworkItem.appendChild(deleteButton);
        homeworkContainer.appendChild(homeworkItem);
    });
}

// ✅ Toggle Homework Completion Status
async function toggleHomeworkCompletion(id, completed) {
    try {
        await fetch(`http://localhost:8081/api/homework/${id}/complete?completed=${completed}`, {
            method: "PUT"
        });
        location.reload();
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    }
}

// ✅ Delete Homework
async function confirmDelete(homeworkId, homeworkItem) {
    const confirmation = confirm("Are you sure you want to delete this homework?");
    if (!confirmation) return;

    try {
        const response = await fetch(`http://localhost:8081/api/homework/delete/${homeworkId}`, { method: "DELETE" });

        if (response.ok) {
            alert("✅ Homework deleted successfully!");
            homeworkItem.remove(); // Remove from UI
            location.reload(); // ✅ Refresh to ensure DB reflects changes
        } else {
            alert(`❌ Failed to delete homework: ${await response.text()}`);
        }
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    }
}

document.getElementById("reset-homework").addEventListener("click", async function () {
    const confirmation = confirm("Are you sure you want to delete ALL homework? This action cannot be undone.");
    if (!confirmation) return; // Stop if the user cancels

    const teacherEmail = localStorage.getItem("loggedInTeacherEmail");
    const studentId = localStorage.getItem("currentStudentId");

    if (!teacherEmail || !studentId) {
        alert("Error: Teacher or student info missing.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8081/api/homework/teacher/${teacherEmail}/student/${studentId}`, {
            method: "DELETE",
        });

        if (response.ok) {
            alert("All homework deleted successfully!");
            location.reload(); // Refresh the page to update the list
        } else {
            const errorText = await response.text();
            console.error("Failed to delete all homework:", errorText);
            alert("Failed to delete homework: " + errorText);
        }
    } catch (error) {
        console.error("Error deleting all homework:", error);
        alert("Error: " + error.message);
    }
});


//*********Donut Chart**********/

let homeworkChart; // Global variable to store the chart instance

// Function to Calculate & Update Completion Chart
function updateCompletionChart(homeworkList) {
    const completedCount = homeworkList.filter(hw => hw.completed).length;
    const totalCount = homeworkList.length;
    const completionPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    // Update Percentage in the Center
    document.getElementById("completionPercentage").innerText = `${completionPercentage}%`;

    // Destroy Old Chart if Exists
    if (homeworkChart) {
        homeworkChart.destroy();
    }

    // Create New Donut Chart
    const ctx = document.getElementById("homeworkChart").getContext("2d");
    homeworkChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ["Completed", "Remaining"],
            datasets: [{
                data: [completedCount, totalCount - completedCount],
                backgroundColor: ["#4caf50", "#dcdcdc"], // Green for completed, gray for remaining
                borderWidth: 1
            }]
        },
        options: {
            cutout: "70%", // Creates the hole in the center
            plugins: {
                legend: { display: false } // Hide legend
            }
        }
    });
}

// Modify renderHomeworkList() to Call This Function
function renderHomeworkList(homeworkList) {
    const homeworkContainer = document.getElementById("homework-list");
    homeworkContainer.innerHTML = ""; // Clear previous list

    // Sort: Unfinished first, Completed last
    homeworkList.sort((a, b) => a.completed - b.completed);

    homeworkList.forEach((hw) => {
        const homeworkItem = document.createElement("div");
        homeworkItem.className = "homework-item";
        homeworkItem.style.backgroundColor = hw.completed ? "#a0a0a0" : "#ffffff"; 

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = hw.completed;
        checkbox.addEventListener("change", async () => {
            await toggleHomeworkCompletion(hw.id, checkbox.checked);
            updateCompletionChart(homeworkList); // Update Chart
        });

        const title = document.createElement("span");
        title.textContent = hw.title;
        title.style.textDecoration = hw.completed ? "line-through" : "none";

        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = `<img src="/public/img/deleteicon.png" alt="Delete" width="16">`;
        deleteButton.onclick = async () => {
            await confirmDelete(hw.id, homeworkItem);
            updateCompletionChart(homeworkList); // Update Chart
        };

        homeworkItem.appendChild(checkbox);
        homeworkItem.appendChild(title);
        homeworkItem.appendChild(deleteButton);
        homeworkContainer.appendChild(homeworkItem);
    });

    updateCompletionChart(homeworkList); // Update Chart
}




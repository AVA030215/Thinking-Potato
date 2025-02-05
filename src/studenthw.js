document.addEventListener("DOMContentLoaded", async function () {
    // ✅ Get student email from localStorage
    const studentEmail = localStorage.getItem("loggedInStudentEmail");

    console.log("📩 Student Email Retrieved:", studentEmail); // ✅ Debugging

    if (!studentEmail) {
        console.error("❌ Error: No student email found in localStorage.");
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

        console.log("🆔 Fetched Student ID:", studentId); // ✅ Debugging Output

        // ✅ Step 2: Store studentId in localStorage for future reference
        localStorage.setItem("currentStudentId", studentId);

        const userDetailsResponse = await fetch(`http://localhost:8081/api/users/details/${studentEmail}`);
        if (userDetailsResponse.ok) {
            const userData = await userDetailsResponse.json();
            updateProfilePhotoFromDB(userData.profilePhoto); // ✅ Update Profile Photo
        } else {
            console.error("❌ Failed to fetch user details:", await userDetailsResponse.text());
        }


        // ✅ Step 3: Fetch homework assigned to this student
        const homeworkResponse = await fetch(`http://localhost:8081/api/homework/student-id/${studentId}`);


        if (homeworkResponse.ok) {
            const homeworkList = await homeworkResponse.json();
            console.log("📚 Homework List:", homeworkList);
            renderStudentHomeworkList(homeworkList);
        } else {
            console.error("❌ Failed to fetch homework:", await homeworkResponse.text());
        }
    } catch (error) {
        console.error("❌ Error fetching student ID or homework:", error);
    }
});


function updateProfilePhotoFromDB(photoUrl) {
    const profilePhoto = document.getElementById("profile-photo");
    if (profilePhoto && photoUrl) {
        profilePhoto.src = photoUrl; // ✅ Set profile photo dynamically from DB
    } else {
        console.error("❌ Profile photo element not found or missing photo URL.");
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

// ✅ Function to Render Homework for Students (NO Delete or Add Button)
function renderStudentHomeworkList(homeworkList) {
    const homeworkContainer = document.getElementById("homework-list");
    homeworkContainer.innerHTML = ""; // Clear previous list

    let completedCount = 0;

    if (homeworkList.length === 0) {
        // ✅ If no homework, show a message
        homeworkContainer.innerHTML = `<div class="no-homework-message">No homework assigned yet. Please check back later!</div>`;
        return;
    }


    // ✅ Sort: Unfinished first, Completed last
    homeworkList.sort((a, b) => a.completed - b.completed);

    homeworkList.forEach((hw) => {
        if (hw.completed) completedCount++;

        const homeworkItem = document.createElement("div");
        homeworkItem.className = "homework-item";
        homeworkItem.style.backgroundColor = hw.completed ? "#a0a0a0" : "#ffffff"; // ✅ Darker for completed

        // ✅ Checkbox for completion (Students can mark homework as completed)
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = hw.completed;
        checkbox.addEventListener("change", () => toggleHomeworkCompletion(hw.id, checkbox.checked));

        // ✅ Homework title (Strike-through if completed)
        const title = document.createElement("span");
        title.textContent = hw.title;
        title.style.textDecoration = hw.completed ? "line-through" : "none";

        // ✅ Append items to container
        homeworkItem.appendChild(checkbox);
        homeworkItem.appendChild(title);
        homeworkContainer.appendChild(homeworkItem);
    });

    // ✅ Update Completion Percentage
    updateCompletionPercentage(homeworkList.length, completedCount);
}


// ✅ Function to Update Completion Percentage in Donut Chart
function updateCompletionPercentage(total, completed) {
    const completionCircle = document.getElementById("completion-circle");

    if (!completionCircle) {
        console.error("❌ Error: Completion circle element not found.");
        return;
    }

    if (total === 0) {
        console.log("📌 No homework assigned. Setting completion to 0%.");
        completionCircle.style.background = "conic-gradient(#ccc 0%, #ccc 100%)"; // Default gray circle
        completionCircle.innerHTML = `<span>0%</span>`; // Show "0%" inside the donut
        return;
    }

    const percentage = Math.round((completed / total) * 100);
    
    console.log(`📊 Updating Completion: ${completed}/${total} (${percentage}%)`);
    
    completionCircle.style.background = `
        conic-gradient(#4caf50 ${percentage}%, #ccc ${percentage}%)
    `;
    completionCircle.innerHTML = `<span>${percentage}%</span>`; // Show percentage inside
}


// ✅ Toggle Homework Completion Status (When Student Clicks Checkbox)
async function toggleHomeworkCompletion(id, completed) {
    try {
        const response = await fetch(`http://localhost:8081/api/homework/${id}/complete?completed=${completed}`, {
            method: "PUT"
        });

        if (!response.ok) {
            console.error("❌ Failed to update homework status:", await response.text());
        } else {
            console.log("✅ Homework completion status updated.");
            location.reload(); // Refresh to reflect changes
        }
    } catch (error) {
        console.error("❌ Error updating homework:", error);
    }
}

// ✅ Ensure Chart.js is loaded
async function loadChartJS() {
    if (typeof Chart === "undefined") {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.async = true;
        document.head.appendChild(script);
        return new Promise(resolve => (script.onload = resolve));
    }
}

// ✅ Function to Update the Donut Chart
async function updateCompletionPercentage(total, completed) {
    await loadChartJS(); // Ensure Chart.js is loaded

    const ctx = document.getElementById("homeworkChart").getContext("2d");
    const percentageLabel = document.getElementById("completionPercentage");

    if (!ctx || !percentageLabel) {
        console.error("❌ Error: Chart elements not found in DOM.");
        return;
    }

    if (total === 0) {
        console.log("📌 No homework assigned. Setting completion to 0%.");
        percentageLabel.textContent = "0%";
        return;
    }

    const percentage = Math.round((completed / total) * 100);
    console.log(`📊 Updating Completion: ${completed}/${total} (${percentage}%)`);

    // ✅ Update the percentage label
    percentageLabel.textContent = `${percentage}%`;

    // ✅ Destroy previous chart if it exists
    if (window.homeworkChartInstance) {
        window.homeworkChartInstance.destroy();
    }

    // ✅ Create a new Donut Chart
    window.homeworkChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Completed", "Remaining"],
            datasets: [{
                data: [completed, total - completed],
                backgroundColor: ["#4caf50", "#dcdcdc"],
                borderWidth: 1
            }]
        },
        options: {
            cutout: "70%", // ✅ Creates the donut effect
            plugins: {
                legend: { display: false }
            }
        }
    });

    if (percentage ===100){
        launchConfetti();
    }
}

async function fetchStudentHomework() {
    const studentEmail = localStorage.getItem("loggedInStudentEmail");
    if (!studentEmail) {
        console.error("❌ Student email not found in local storage.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8081/api/homework/student/${studentEmail}`);
        if (response.ok) {
            const homeworkList = await response.json();
            renderStudentHomeworkList(homeworkList);

            console.log("📚 Homework List:", homeworkList);

            // ✅ Count completed & total homework
            const totalHomework = homeworkList.length;
            const completedHomework = homeworkList.filter(hw => hw.completed).length;

            // ✅ Update the donut chart
            updateCompletionPercentage(totalHomework, completedHomework);
        } else {
            console.error("❌ Failed to fetch homework:", await response.text());
        }
    } catch (error) {
        console.error("❌ Error fetching homework:", error);
    }
}


//Confetti
function launchConfetti() {
    var duration = 3 * 300;
    var animationEnd = Date.now() + duration;

   

    function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });

        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });

        if (Date.now() < animationEnd) {
            requestAnimationFrame(frame);
        } else {
            document.body.removeChild(message);
        }
    }
    frame();
}



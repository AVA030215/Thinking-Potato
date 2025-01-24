document.addEventListener("DOMContentLoaded", async function () {
    const addScheduleButton = document.getElementById("addScheduleButton");
    const addScheduleModal = document.getElementById("addScheduleModal");
    const closeScheduleModal = document.getElementById("closeScheduleModal");
    const lessonTypeSelect = document.getElementById("lessonType");
    const addressSection = document.getElementById("addressSection");
    const studentSelect = document.getElementById("studentSelect");
    const addScheduleForm = document.getElementById("addScheduleForm");

    const teacherEmail = localStorage.getItem("loggedInTeacherEmail");


    // Open & Close Modal
    addScheduleButton.addEventListener("click", () => addScheduleModal.style.display = "block");
    closeScheduleModal.addEventListener("click", () => addScheduleModal.style.display = "none");
    window.addEventListener("click", (event) => {
        if (event.target === addScheduleModal) addScheduleModal.style.display = "none";
    });

    // Show/Hide Address Field
    lessonTypeSelect.addEventListener("change", () => {
        addressSection.style.display = lessonTypeSelect.value === "in-person" ? "block" : "none";
    });

    // Fetch Students for Dropdown
    async function fetchStudents() {
        try {
            const response = await fetch(`http://localhost:8081/api/users/teacher/email/${teacherEmail}/students`);
            if (response.ok) {
                const students = await response.json();
                students.forEach((student, index) => {
                    const option = document.createElement("option");
                    option.value = student.email;
                    option.textContent = student.firstName + " " + student.lastName;
                    option.style.color = getColorCode(index);
                    studentSelect.appendChild(option);
                });
            } else {
                console.error("Failed to fetch students:", await response.text());
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    }


    // Submit Schedule
    addScheduleForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const scheduleData = {
            teacherEmail: teacherEmail,
            studentEmail: studentSelect.value,
            startDate: document.getElementById("startDate").value,
            endDate: document.getElementById("endDate").value || null,
            repetition: document.getElementById("repetition").value || 1,
            startTime: document.getElementById("startTime").value,
            endTime: document.getElementById("endTime").value,
            lessonType: lessonTypeSelect.value,
            address: document.getElementById("address").value || null
        };
        

        try {
            const response = await fetch("http://localhost:8081/api/schedules/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(scheduleData)
            });

            if (response.ok) {
                alert("Schedule added successfully!");
                addScheduleModal.style.display = "none";
                location.reload(); // Refresh schedule list
            } else {
                alert(`Error: ${await response.text()}`);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    // Load students on page load
    fetchStudents();
});

// Function to get color code
function getColorCode(index) {
    const colors = ["#ff6666", "#66b3ff", "#99ff99", "#ffcc99", "#c299ff"];
    return colors[index % colors.length];
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




document.addEventListener("DOMContentLoaded", async function () {
    const scheduleContainer = document.getElementById("scheduleContainer");
    const teacherEmail = localStorage.getItem("loggedInTeacherEmail");

    // ✅ Fetch and Render Weekly Schedule Data
    async function fetchWeeklySchedule() {
        try {
            const response = await fetch(`http://localhost:8081/api/schedules/weekly/${teacherEmail}`);
            if (response.ok) {
                const scheduleData = await response.json();
                console.log("✅ API Response:", scheduleData); // ✅ Check the full response
                renderListView(scheduleData);
            } else {
                console.error("❌ Failed to fetch weekly schedule:", await response.text());
            }
        } catch (error) {
            console.error("❌ Error fetching weekly schedule:", error);
        }
    }
    
    

    // ✅ Modify function to process `scheduleData` correctly
    function groupByDate(scheduleData) {
        const grouped = {};
        Object.entries(scheduleData).forEach(([date, schedules]) => {
            grouped[date] = schedules; // Directly assign since API already groups data
        });
        return grouped;
    }

    // ✅ Function to Render List View
    function renderListView(scheduleData) {
        console.log("🛠️ renderListView() called with:", scheduleData); // ✅ Debugging
    
        scheduleContainer.innerHTML = ""; // Clear previous content
        const groupedData = groupByDate(scheduleData);
    
        Object.keys(groupedData).sort().forEach(date => {
            console.log("📆 Processing Date:", date); // ✅ Debugging
    
            const dateSection = document.createElement("div");
            dateSection.classList.add("date-section");
            dateSection.innerText = formatDate(date);
            scheduleContainer.appendChild(dateSection);
    
            groupedData[date].forEach(schedule => {
                console.log("🎨 Student Color:", schedule.studentColor); // ✅ Debugging color
    
                const scheduleBox = document.createElement("div");
                scheduleBox.classList.add("schedule-box");
                scheduleBox.style.backgroundColor = schedule.studentColor || "#f0f0f0"; // ✅ Use student's color
    
                scheduleBox.innerHTML = `
                    <div class="schedule-info">
                        <p><strong>${schedule.studentName}</strong></p>
                        <p>${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}</p>
                        <p>${schedule.lessonType}</p>
                        ${schedule.lessonType === "In-Person" ? `<p>Address: ${schedule.address}</p>` : ""}
                    </div>
                    <div class="button-container">
                        <img src="/public/img/deleteicon.png" alt="Delete" class="delete-btn" data-id="${schedule.id}">
                        <img src="/public/img/editicon.png" alt="Edit" class="edit-btn" data-id="${schedule.id}">
                    </div>
                `;
    
                scheduleContainer.appendChild(scheduleBox);
            });
        });
    }
    
    
    
    
    
    // ✅ Function to Format Date (e.g., "10.16")
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}.${date.getDate()}`;
    }

    // ✅ Function to Format Time (e.g., "10:00 AM")
    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(":");
        const hours12 = ((parseInt(hours) + 11) % 12 + 1);
        const ampm = parseInt(hours) >= 12 ? "PM" : "AM";
        return `${hours12}:${minutes} ${ampm}`;
    }

    // ✅ Fetch and Render Weekly Schedule on Page Load
    fetchWeeklySchedule();
});

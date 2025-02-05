document.addEventListener("DOMContentLoaded", async function () {
    // ✅ Get teacher email from localStorage
    let teacherEmail = localStorage.getItem("loggedInTeacherEmail");

    console.log("📩 Teacher Email Retrieved:", teacherEmail); // ✅ Debugging

    if (!teacherEmail) {
        console.error("❌ Error: No teacher email found in localStorage.");
        return;
    }

    try {
        // ✅ Step 1: Fetch teacher details (including profile photo)
        const teacherDetailsResponse = await fetch(`http://localhost:8081/api/users/details/${teacherEmail}`);
        
        if (teacherDetailsResponse.ok) {
            const teacherData = await teacherDetailsResponse.json();
            updateProfilePhotoFromDB(teacherData.profilePhoto); // ✅ Update Profile Photo
        } else {
            console.error("❌ Failed to fetch teacher details:", await teacherDetailsResponse.text());
        }
    } catch (error) {
        console.error("❌ Error fetching teacher details:", error);
    }
});

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



document.addEventListener("DOMContentLoaded", async function () {
    const scheduleContainer = document.getElementById("scheduleContainer");
    const viewTypeSelect = document.getElementById("viewType");
    const teacherEmail = localStorage.getItem("loggedInTeacherEmail");

    if (!scheduleContainer) {
        console.error("Error: scheduleContainer not found in the DOM.");
        return;
    }

    document.body.addEventListener("click", async (event) => {
        if (event.target.classList.contains("delete-btn")) {
            const scheduleId = event.target.dataset.id;  // Get schedule ID
            let scheduleDate = event.target.dataset.date; // Get schedule date
            
            if (!scheduleId) {
                console.error("No schedule ID found.");
                return;
            }
    
            // Prevent sending `undefined` date
            if (!scheduleDate || scheduleDate === "undefined" || scheduleDate.trim() === "") {
                console.error("Invalid schedule date. Cannot delete.");
                alert("Error: Schedule date is missing.");
                return;
            }
    
            // Confirm deletion
            const confirmDelete = confirm(`Are you sure you want to delete this schedule on ${scheduleDate}?`);
            if (!confirmDelete) return;
    
            try {
                const url = new URL(`http://localhost:8081/api/schedules/delete/${scheduleId}`);
                url.searchParams.append("date", scheduleDate);  // Include date parameter
    
                const response = await fetch(url, { method: "DELETE" });
    
                const result = await response.text();
                console.log("Delete response:", result);
    
                if (response.ok) {
                    event.target.closest(".schedule-box").remove();
                } else {
                    console.error("Failed to delete:", result);
                }
            } catch (error) {
                console.error("Error deleting schedule:", error);
            }
        }
    });
    


    // Fetch and Render Schedule Data
    async function fetchSchedule() {
        try {
            const response = await fetch(`http://localhost:8081/api/schedules/weekly/${teacherEmail}`);
            if (response.ok) {
                const scheduleData = await response.json();
                renderSchedule(scheduleData);
                console.log("Fetched Schedule Data:", scheduleData); // 🔍 Debugging log
            } else {
                console.error("Failed to fetch schedule:", await response.text());
            }
        } catch (error) {
            console.error("Error fetching schedule:", error);
        }
    }

    // Render the Schedule Based on Selected View Type
    function renderSchedule(scheduleData) {
        scheduleContainer.innerHTML = ""; // Clear previous content
    
        for (const [date, schedules] of Object.entries(scheduleData)) {
            schedules.forEach(schedule => {
                schedule.startDate = date; // 🔹 Manually add startDate
            });
        }
    
        // Remove any existing view class before applying new one
        scheduleContainer.classList.remove("weekly-view", "list-view");
    
        const viewType = viewTypeSelect.value;
    
        if (viewType === "list") {
            scheduleContainer.classList.add("list-view");
            renderListView(scheduleData);
        } else {
            scheduleContainer.classList.add("weekly-view");
            renderWeeklyView(scheduleData);
        }
    }
    
    // Render List View (Ensures all days in the week are shown)
    function renderListView(scheduleData) {
        scheduleContainer.innerHTML = ""; // Clear old content

        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Set to Monday

        const fullWeek = [];
        let currentDate = new Date(startOfWeek);

        for (let i = 0; i < 7; i++) {
            fullWeek.push(currentDate.toISOString().split("T")[0]); // YYYY-MM-DD format
            currentDate.setDate(currentDate.getDate() + 1);
        }

        fullWeek.forEach(date => {
            const dateSection = document.createElement("div");
            dateSection.classList.add("date-section");
            dateSection.innerText = formatDate(date);
            scheduleContainer.appendChild(dateSection);

            if (scheduleData[date] && scheduleData[date].length > 0) {
                scheduleData[date].forEach(schedule => {
                    const scheduleBox = createScheduleBox(schedule);
                    scheduleContainer.appendChild(scheduleBox);
                });
            } else {
                const emptyBox = document.createElement("div");
                emptyBox.classList.add("schedule-box", "empty-schedule");
                emptyBox.innerHTML = "<p>No schedule for this day.</p>";
                scheduleContainer.appendChild(emptyBox);
            }
        });
    }

    // Render Weekly View
    function renderWeeklyView(scheduleData) {
        scheduleContainer.innerHTML = ""; // Clear previous view
        scheduleContainer.classList.add("weekly-view");
    
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Monday
        const endOfWeek = new Date(today.setDate(startOfWeek.getDate() + 6)); // Sunday
    
        const fullWeek = [];
        let currentDate = new Date(startOfWeek);
        while (currentDate <= endOfWeek) {
            fullWeek.push({
                date: currentDate.toISOString().split("T")[0], // YYYY-MM-DD
                display: `${currentDate.getMonth() + 1}.${currentDate.getDate()}`, // MM.DD
                dayName: currentDate.toLocaleDateString("en-US", { weekday: "long" }) // Monday, Tuesday, etc.
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
    
        // **Grid Container for Weekly View**
        const gridContainer = document.createElement("div");
        gridContainer.classList.add("weekly-grid");
    
        // **Generate Week Columns
        fullWeek.forEach(dayInfo => {
            const dayColumn = document.createElement("div");
            dayColumn.classList.add("day-column");
            dayColumn.innerHTML = `<h3>${dayInfo.display}<br>${dayInfo.dayName}</h3>`; // Example: "01.27 Monday"
    
            if (scheduleData[dayInfo.date]) {
                scheduleData[dayInfo.date].forEach(schedule => {
                    const scheduleBox = createScheduleBox(schedule);
                    dayColumn.appendChild(scheduleBox);
                });
            } else {
                // Placeholder when no schedules exist
                const emptyBox = document.createElement("div");
                emptyBox.classList.add("schedule-box", "empty-schedule");
                emptyBox.innerHTML = "<p>No schedule</p>";
                dayColumn.appendChild(emptyBox);
            }
    
            gridContainer.appendChild(dayColumn);
        });
    
        // **Append Only the Grid (No Extra Date List on Left!)**
        scheduleContainer.appendChild(gridContainer);
    }
    
    

    // Create Schedule Box
    function createScheduleBox(schedule) {
        const scheduleBox = document.createElement("div");
        scheduleBox.classList.add("schedule-box");
        scheduleBox.style.backgroundColor = schedule.studentColor || "#ccc";
    
        // Ensure `startDate` is assigned correctly but hidden
        const scheduleDate = schedule.startDate ? schedule.startDate : "";
    
        console.log("Creating schedule box - ID:", schedule.id, "Date:", scheduleDate); // Debugging log
    
        scheduleBox.innerHTML = `
            <div class="schedule-info">
                <p><strong>${schedule.studentName}</strong></p>
                <p>${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}</p>
                <p>${schedule.lessonType}</p>
                ${schedule.lessonType.toLowerCase() === "in-person" ? `<p>Address: ${schedule.address}</p>` : ""}
                <span class="hidden-date" data-date="${scheduleDate}"></span> <!-- 🔹 Hidden element for date -->
            </div>
            
            <div class="button-container">
                <img src="/public/img/deleteicon.png" alt="Delete" class="delete-btn" 
                     data-id="${schedule.id}" data-date="${scheduleDate}">
            </div>
        `;
        return scheduleBox;
    }
    
    
    //Delete Schedule
    
    async function deleteSchedule(scheduleId, date, deleteFuture, repetition) {
        try {
            let url = `http://localhost:8081/api/schedules/delete/${scheduleId}`;
            let method = "DELETE";
    
            if (deleteFuture) {
                // 🔹 If deleting all occurrences, proceed with full deletion
                url += `?future=true`;
            } else {
                // 🔹 If only deleting a single occurrence, update the start date if repetition exists
                if (repetition > 1) {
                    url = `http://localhost:8081/api/schedules/update/${scheduleId}`;
                    method = "PUT";
    
                    // Calculate the new start date based on the repetition interval
                    const currentDate = new Date(date);
                    currentDate.setDate(currentDate.getDate() + (repetition * 7)); // Move to the next scheduled week
    
                    const updatedSchedule = {
                        startDate: currentDate.toISOString().split("T")[0] // Convert to YYYY-MM-DD format
                    };
    
                    console.log("Updating Schedule Start Date:", updatedSchedule);
                } else {
                    // If it's not repeating, just delete it normally
                    url += `?date=${date}`;
                }
            }
    
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: method === "PUT" ? JSON.stringify(updatedSchedule) : null
            });
    
            const result = await response.text();
            console.log("Delete/Update response:", result);
    
            if (response.ok) {
                if (deleteFuture) {
                    alert("All future occurrences deleted successfully!");
                } else if (repetition > 1) {
                    alert("This occurrence deleted, and future occurrences updated accordingly.");
                } else {
                    alert("Single occurrence deleted successfully!");
                }
    
                fetchSchedule(); // Refresh the schedule list
            } else {
                console.error("Failed to delete/update:", result);
            }
        } catch (error) {
            console.error("Error deleting/updating schedule:", error);
        }
    }
    

    // Format Date
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}.${date.getDate()}`;
    }

    // Format Time
    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(":");
        const hours12 = ((parseInt(hours) + 11) % 12 + 1);
        const ampm = parseInt(hours) >= 12 ? "PM" : "AM";
        return `${hours12}:${minutes} ${ampm}`;
    }

    // Listen for view type change & re-render
    viewTypeSelect.addEventListener("change", () => fetchSchedule());

    // Fetch and Render Schedule on Load
    fetchSchedule();
});





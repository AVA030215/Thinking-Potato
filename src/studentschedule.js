document.addEventListener("DOMContentLoaded", async function () {
    const scheduleContainer = document.getElementById("scheduleContainer");
    const viewTypeSelect = document.getElementById("viewType");
    const studentEmail = localStorage.getItem("loggedInStudentEmail"); // Get the logged-in student’s email

    if (!studentEmail) {
        console.error("❌ Student email not found in local storage.");
        return;
    }

    if (!scheduleContainer) {
        console.error("❌ Error: scheduleContainer not found in the DOM.");
        return;
    }

    try {
        // ✅ Step 1: Fetch student details (including profile photo)
        const studentDetailsResponse = await fetch(`http://localhost:8081/api/users/details/${studentEmail}`);
        
        if (studentDetailsResponse.ok) {
            const studentData = await studentDetailsResponse.json();
            updateProfilePhotoFromDB(studentData.profilePhoto); // ✅ Update Profile Photo
        } else {
            console.error("❌ Failed to fetch student details:", await studentDetailsResponse.text());
        }

        // ✅ Step 2: Fetch and render student schedule
        await fetchStudentSchedule();

    } catch (error) {
        console.error("❌ Error fetching student details or schedule:", error);
    }

    // Fetch and Render Schedule Data
    async function fetchStudentSchedule() {
        try {
            const response = await fetch(`http://localhost:8081/api/schedules/student/${studentEmail}`);
            if (response.ok) {
                const scheduleData = await response.json();
                renderSchedule(scheduleData);
                console.log("✅ Fetched Schedule Data:", scheduleData);
            } else {
                console.error("❌ Failed to fetch schedule:", await response.text());
            }
        } catch (error) {
            console.error("❌ Error fetching schedule:", error);
        }
    }

    // Render the Schedule Based on Selected View Type
    function renderSchedule(scheduleData) {
        scheduleContainer.innerHTML = ""; // Clear previous content

        for (const [date, schedules] of Object.entries(scheduleData)) {
            schedules.forEach(schedule => {
                schedule.startDate = date; // 🔹 Add startDate to the schedule object
            });
        }

        // Remove any existing view class before applying the new one
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

    // Render List View
    function renderListView(scheduleData) {
        scheduleContainer.innerHTML = "";

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

        // **Generate Week Columns**
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

        // **Append Only the Grid**
        scheduleContainer.appendChild(gridContainer);
    }

    // Create Schedule Box (NO DELETE OR EDIT BUTTON)
    function createScheduleBox(schedule) {
        const scheduleBox = document.createElement("div");
        scheduleBox.classList.add("schedule-box");
        scheduleBox.style.backgroundColor = schedule.studentColor || "#ccc";

        console.log("Creating schedule box - ID:", schedule.id, "Date:", schedule.startDate);

        scheduleBox.innerHTML = `
            <div class="schedule-info">
                <p><strong>${schedule.studentName}</strong></p>
                <p>${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}</p>
                <p>${schedule.lessonType}</p>
                ${schedule.lessonType.toLowerCase() === "in-person" ? `<p>Address: ${schedule.address}</p>` : ""}
            </div>
        `;
        return scheduleBox;
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
    viewTypeSelect.addEventListener("change", () => fetchStudentSchedule());

    // Fetch and Render Schedule on Load
    fetchStudentSchedule();
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







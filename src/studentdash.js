document.addEventListener("DOMContentLoaded", async function () {
    let studentEmail = localStorage.getItem("loggedInStudentEmail");

    console.log("🔹 Stored Student Email:", studentEmail); // Debugging log

    // 🔄 Small retry mechanism (up to 3 times)
    let attempts = 0;
    while (!studentEmail && attempts < 3) {
        console.warn(`🔄 Attempt ${attempts + 1}: Waiting for student email...`);
        await new Promise(resolve => setTimeout(resolve, 200)); // Wait 200ms
        studentEmail = localStorage.getItem("loggedInStudentEmail");
        attempts++;
    }

    if (!studentEmail) {
        console.error("❌ Student email still not found in local storage after retries.");
        return;
    }

    console.log("✅ Final Stored Student Email:", studentEmail); // Debugging log

    try {
        // Fetch student details for greeting
        const studentDetailsResponse = await fetch(`http://localhost:8081/api/users/details/${studentEmail}`);
        if (studentDetailsResponse.ok) {
            const studentData = await studentDetailsResponse.json();
            displayUserGreeting(studentData);
            updateProfilePhotoFromDB(studentData.profilePhoto);
        } else {
            console.error("❌ Failed to fetch student details:", await studentDetailsResponse.text());
        }
    } catch (error) {
        console.error("❌ Error fetching student details:", error);
    }
});

// ✅ Display user greeting function
function displayUserGreeting(user) {
    const greetingElement = document.getElementById("greeting");
    if (greetingElement && user.firstName) {
        greetingElement.textContent = `Kia Ora, ${user.firstName}`;
    } else {
        console.error("❌ Element with ID 'greeting' not found or user firstName missing.");
    }
}

function updateProfilePhotoFromDB(photoUrl) {
    const profilePhoto = document.getElementById("profile-photo");
    if (profilePhoto && photoUrl) {
        profilePhoto.src = photoUrl; // ✅ Set profile photo dynamically from DB
    } else {
        console.error("❌ Profile photo element not found or missing photo URL.");
    }
}

// ✅ Resize Profile Photo
function setProfilePhotoSize(width, height) {
    const profilePhoto = document.getElementById("profile-photo");
    if (profilePhoto) {
        profilePhoto.style.width = `${width}px`;
        profilePhoto.style.height = `${height}px`;
    }
}
setProfilePhotoSize(100, 100);

// ✅ Ensure elements exist before adding event listeners
const profilePhoto = document.getElementById("profile-photo");
if (profilePhoto) {
    profilePhoto.addEventListener("click", function () {
        window.location.href = "../../public/myinfo.html";
    });
}

const checkScheduleButton = document.getElementById("checkScheduleButton");
if (checkScheduleButton) {
    checkScheduleButton.addEventListener("click", function () {
        window.location.href = "studentschedule.html";
    });
}

const checkHomeworkButton = document.getElementById("checkHomeworkButton");
if (checkHomeworkButton) {
    checkHomeworkButton.addEventListener("click", function () {
        window.location.href = "studenthw.html";
    });
}




document.addEventListener("DOMContentLoaded", async function () {
    let email = localStorage.getItem("loggedInTeacherEmail") || localStorage.getItem("loggedInStudentEmail");

    if (!email) {
        console.error("❌ Error: User email not found in localStorage.");
        return;
    }

    console.log("📩 Fetching user info for:", email);

    try {
        const response = await fetch(`http://localhost:8081/api/users/details/${email}`);
        
        if (response.ok) {
            const userData = await response.json();
            updateProfilePhotoFromDB(userData.profilePhoto);
            fillUserInfo(userData); // ✅ Load user info into form
        } else {
            console.error("❌ Failed to fetch user details:", await response.text());
        }
    } catch (error) {
        console.error("❌ Error fetching user details:", error);
    }
});

// ✅ Pre-fill user info but keep fields `readonly` until clicked
function fillUserInfo(userData) {
    document.getElementById("email").value = userData.email; // Email is read-only

    document.getElementById("first-name").value = userData.firstName || "";
    document.getElementById("first-name").readOnly = true;

    document.getElementById("last-name").value = userData.lastName || "";
    document.getElementById("last-name").readOnly = true;

    document.getElementById("math-level").value = userData.mathLevel || "";
    document.getElementById("math-level").readOnly = true;

}

// ✅ Enable editing when clicking inside the input box
function enableEditing(fieldId) {
    const inputField = document.getElementById(fieldId);
    
    if (inputField.readOnly) {
        inputField.readOnly = false; // ✅ Enable editing
        inputField.focus(); // ✅ Auto-focus for easy typing
        console.log(`✏️ Editing field: ${fieldId}`);
    }
}

// ✅ Function to Save Updated User Info
async function saveUserInfo() {
    let email = localStorage.getItem("loggedInTeacherEmail") || localStorage.getItem("loggedInStudentEmail");

    if (!email) {
        alert("❌ User not logged in. Please log in again.");
        return;
    }

    // ✅ Get Updated Values
    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const mathLevel = document.getElementById("math-level").value.trim();

    // ✅ Check for empty fields
    if (!firstName || !lastName || !mathLevel) {
        alert("❌ Please fill in all fields before saving.");
        return;
    }

    // ✅ Ask for confirmation
    const confirmUpdate = confirm("Are you sure you want to update your information?");
    if (!confirmUpdate) return;

    try {
        const response = await fetch(`http://localhost:8081/api/users/update/${email}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, mathLevel }),
        });

        if (response.ok) {
            alert("✅ Your information has been updated successfully!");
            
            // ✅ Make fields readonly again after saving
            document.getElementById("first-name").readOnly = true;
            document.getElementById("last-name").readOnly = true;
            document.getElementById("math-level").readOnly = true;
        } else {
            alert("❌ Failed to update user information.");
            console.error(await response.text());
        }
    } catch (error) {
        console.error("❌ Error updating user info:", error);
    }
}



// ✅ Function to update the profile photo from DB URL
function updateProfilePhotoFromDB(photoUrl) {
    const profilePhoto = document.getElementById("profile-photo");
    if (profilePhoto && photoUrl) {
        profilePhoto.src = photoUrl; // ✅ Set profile photo dynamically from DB
    } else {
        console.error("❌ Profile photo element not found or missing photo URL.");
    }
}



// Tab switching function
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[onclick="openTab('${tabName}')"]`).classList.add('active');
}

// Enable input field editing
function editField(fieldId) {
    document.getElementById(fieldId).disabled = false;
    document.getElementById(fieldId).focus();
}

// Open profile picture modal
function openPhotoModal() {
    document.getElementById("photo-modal").style.display = "block";
}

// Close profile picture modal
function closePhotoModal() {
    document.getElementById("photo-modal").style.display = "none";
}

function updateProfilePhoto(imageSrc) {
    let email = localStorage.getItem("loggedInTeacherEmail"); // ✅ Try teacher email first

    if (!email) {
        email = localStorage.getItem("loggedInStudentEmail"); // ✅ If null, check student email
    }

    if (!email) {
        alert("User not logged in! Please log in again.");
        window.location.href = "/login.html"; // Redirect to login page
        return;
    }

    console.log(`Updating profile photo for: ${email}`);

    fetch(`http://localhost:8081/api/users/${email}/profile-photo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePhoto: imageSrc }),
    })
    .then(response => {
        if (!response.ok) throw new Error("Failed to update profile photo.");
        return response.json();
    })
    .then(data => {
        if (data.profilePhoto) {
            document.getElementById("profile-photo").src = data.profilePhoto; // ✅ Update UI instantly
            alert("Profile photo updated successfully!");
        } else {
            alert("Could not update profile photo.");
        }
    })
    .catch(error => console.error("Error:", error));

    closePhotoModal();
}


async function verifyCurrentPassword() {
    let email = localStorage.getItem("loggedInTeacherEmail") || localStorage.getItem("loggedInStudentEmail");
    if (!email) {
        alert("❌ User not logged in!");
        return;
    }

    const currentPassword = document.getElementById("current-password").value.trim();
    if (!currentPassword) {
        document.getElementById("current-password-error").textContent = "❌ Please enter your current password.";
        return;
    } else {
        document.getElementById("current-password-error").textContent = "";
    }

    try {
        const response = await fetch(`http://localhost:8081/api/users/verify-password`, { // ✅ FIXED URL
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, currentPassword }),
        });

        if (response.ok) {
            // ✅ Current password is correct, enable new password fields
            document.getElementById("new-password").disabled = false;
            document.getElementById("confirm-password").disabled = false;
            document.getElementById("change-password-btn").disabled = false;
            alert("✅ Current password verified. You can now enter a new password.");
        } else {
            document.getElementById("current-password-error").textContent = "❌ Incorrect current password.";
        }
    } catch (error) {
        console.error("❌ Error verifying password:", error);
    }
}

// ✅ Change Password Function
async function changePassword() {
    let email = localStorage.getItem("loggedInTeacherEmail") || localStorage.getItem("loggedInStudentEmail");

    if (!email) {
        alert("❌ User not logged in!");
        return;
    }

    const newPassword = document.getElementById("new-password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();

    if (!newPassword) {
        document.getElementById("new-password-error").textContent = "❌ Please enter a new password.";
        return;
    } else {
        document.getElementById("new-password-error").textContent = "";
    }

    if (newPassword !== confirmPassword) {
        document.getElementById("confirm-password-error").textContent = "❌ Passwords do not match.";
        return;
    } else {
        document.getElementById("confirm-password-error").textContent = "";
    }

    if (!confirm("Are you sure you want to change your password?")) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:8081/api/users/update-password`, { // ✅ Correct API URL
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPassword }), // ✅ Sending email & new password
        });

        if (response.ok) {
            alert("✅ Password changed successfully!");
            document.getElementById("current-password").value = "";
            document.getElementById("new-password").value = "";
            document.getElementById("confirm-password").value = "";

            document.getElementById("new-password").disabled = true;
            document.getElementById("confirm-password").disabled = true;
            document.getElementById("change-password-btn").disabled = true;
        } else {
            const errorMsg = await response.text();
            alert(`❌ Failed to change password: ${errorMsg}`);
        }
    } catch (error) {
        console.error("❌ Error changing password:", error);
    }
}



document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the form from submitting

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:8081/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.role === "teacher") {
                localStorage.setItem("loggedInTeacherEmail", email); // Store the teacher's email
                window.location.href = "teacherdash.html"; // Redirect to the teacher dashboard
            } else {
                alert("You are not authorized to access this page.");
            }
        } else {
            const error = await response.text();
            alert(`Error: ${error}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});




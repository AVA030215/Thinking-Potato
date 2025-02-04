document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get input values
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:8081/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }), // Fix: Proper object structure
        });

        if (response.ok) {
            const data = await response.json();
            console.log("🔹 Login Response:", data); // Debugging

            if (data.email) {
                if (data.role === "teacher") {
                    localStorage.setItem("loggedInTeacherEmail", data.email);
                    console.log("✅ Teacher email stored:", localStorage.getItem("loggedInTeacherEmail"));
                    window.location.href = "../../public/teacherdash.html";
                } else if (data.role === "student") {
                    localStorage.setItem("loggedInStudentEmail", data.email);
                    
                    // 🔄 Ensure email is properly saved
                    setTimeout(() => {
                        console.log("✅ Student email stored:", localStorage.getItem("loggedInStudentEmail"));
                        window.location.href = "../../public/studentdash.html"; // Redirect on success  
                    }, 100);
                }
            } else {
                console.error("❌ Login response missing email field:", data);
                document.getElementById("message").innerText = "Error: Login response missing email.";
            }
        } else {
            const error = await response.text();
            document.getElementById("message").innerText = `Error: ${error}`;
        }
    } catch (error) {
        document.getElementById("message").innerText = `Error: ${error.message}`;
    }
});




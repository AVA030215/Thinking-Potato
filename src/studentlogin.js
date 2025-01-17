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
            if(data.role === "teacher"){
                window.location.href ="../../public/teacherdash.html";
            }else{
                window.location.href = "../../public/studentdash.html"; // Redirect on success   
            }
        } else {
            const error = await response.text();
            document.getElementById("message").innerText = `Error: ${error}`;
        }
    } catch (error) {
        document.getElementById("message").innerText = `Error: ${error.message}`;
    }
});



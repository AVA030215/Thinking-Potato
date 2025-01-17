document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // 폼의 기본 동작 방지

    // 입력 값 가져오기
    const email = document.getElementById("email").value;

    // 이메일 중복 확인
    const emailCheckResponse = await fetch(`http://localhost:8081/api/users/check-email?email=${email}`);
    const emailExists = await emailCheckResponse.json();

    if (emailExists) {
        alert("This email is already registered. Please use a different email.");
        return; // 중복된 이메일이면 폼 제출 중단
    }

    // 사용자 데이터
    const userData = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: email,
        password: document.getElementById("password").value,
        mathLevel: document.getElementById("mathLevel").value || null,
    };

    try {
        // API 호출
        const response = await fetch("http://localhost:8081/api/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        if (response.ok) {
            window.location.href = "../../public/success.html"; // 성공 페이지로 이동
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});


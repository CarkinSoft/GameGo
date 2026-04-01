const loginForm = document.getElementById("loginForm");
const messageBox = document.getElementById("formMessage");

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    let data = await response.json();

    messageBox.textContent = data.message;
    messageBox.classList.remove("hidden", "success-message", "error-message");

    if (data.success) {
        messageBox.classList.add("success-message");

        setTimeout(() => {
            window.location.href = "/home";
        }, 1000);
    } else {
        messageBox.classList.add("error-message");
    }

    setTimeout(() => {
        messageBox.textContent = "";
        messageBox.classList.add("hidden");
        messageBox.classList.remove("success-message", "error-message");
    }, 4000);
});
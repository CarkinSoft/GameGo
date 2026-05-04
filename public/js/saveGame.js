let form = document.querySelector("#saveGameForm");
let message = document.querySelector("#feedbackDiv");

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    let formData = new FormData(form);

    let response = await fetch("/saveGame", {
        method: "POST",
        body: new URLSearchParams(formData)
    });

    let data = await response.json();

    message.style.display = "block";

    if (data.error) {
        message.textContent = data.error;
        message.className = "mt-3 fw-bold text-danger";
    } else {
        message.textContent = data.success;
        message.className = "mt-3 fw-bold text-success";
    }
});
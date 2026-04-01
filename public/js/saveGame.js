const saveGameForm = document.getElementById("saveGameForm");
const messageBox = document.getElementById("formMessage");

saveGameForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    let rawgGameId = document.querySelector('input[name="rawg_game_id"]').value;
    let title = document.querySelector('input[name="title"]').value;
    let coverImage = document.querySelector('input[name="cover_image"]').value;
    let genres = document.querySelector('input[name="genres"]').value;
    let status = document.getElementById("status").value;
    let isFavorite = document.getElementById("is_favorite").checked ? 1 : 0;

    let response = await fetch("/saveGame", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            rawg_game_id: rawgGameId,
            title: title,
            cover_image: coverImage,
            genres: genres,
            status: status,
            is_favorite: isFavorite
        })
    });

    let data = await response.json();

    messageBox.textContent = data.message;
    messageBox.classList.remove("hidden", "success-message", "error-message");

    if (data.success) {
        messageBox.classList.add("success-message");
    } else {
        messageBox.classList.add("error-message");
    }

    setTimeout(() => {
        messageBox.textContent = "";
        messageBox.classList.add("hidden");
        messageBox.classList.remove("success-message", "error-message");
    }, 4000);
});
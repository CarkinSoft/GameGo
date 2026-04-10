document.querySelector("#saveGameForm").addEventListener("submit", saveGame);

let feedbackDiv = document.querySelector("#feedbackDiv");
feedbackDiv.style.display = "none";

async function saveGame(event) {
    event.preventDefault();

    let rawgGameId = document.querySelector("input[name=rawg_game_id]").value;
    let title = document.querySelector("input[name=title]").value;
    let coverImage = document.querySelector("input[name=cover_image]").value;
    let genres = document.querySelector("input[name=genres]").value;
    let status = document.querySelector("select[name=status]").value;
    let isFavorite = document.querySelector("input[name=is_favorite]").checked ? 1 : 0;

    if (status == "") {
        feedbackDiv.style.display = "block";
        feedbackDiv.textContent = "Error: please select a status";
        feedbackDiv.style.color = "red";
        return;
    }

    let formData = new URLSearchParams();
    formData.append("rawg_game_id", rawgGameId);
    formData.append("title", title);
    formData.append("cover_image", coverImage);
    formData.append("genres", genres);
    formData.append("status", status);
    formData.append("is_favorite", isFavorite);

    let response = await fetch("/saveGame", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData
    });

    let data = await response.json();

    feedbackDiv.style.display = "block";

    if (data.error) {
        feedbackDiv.textContent = data.error;
        feedbackDiv.style.color = "red";
    }
    else {
        feedbackDiv.textContent = data.success;
        feedbackDiv.style.color = "green";
    }
}
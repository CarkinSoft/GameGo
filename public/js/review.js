const reviewForm = document.getElementById("reviewForm");

if (reviewForm) {
    reviewForm.addEventListener("submit", addReview);
}

const reviewFeedback = document.getElementById("reviewFeedbackDiv");

if (reviewFeedback) {
    reviewFeedback.style.display = "none";
}

async function addReview(event) {
    event.preventDefault();

    let rawgGameId = document.querySelector("#reviewForm input[name='rawg_game_id']").value;
    let rating = document.querySelector("#rating").value;
    let reviewTitle = document.querySelector("#review_title").value.trim();
    let reviewText = document.querySelector("#review_text").value.trim();

    if (reviewTitle === "" || reviewText === "") {
        reviewFeedback.style.display = "block";
        reviewFeedback.textContent = "Review title and text cannot be blank.";
        reviewFeedback.style.color = "red";
        return;
    }

    let formData = new URLSearchParams();
    formData.append("rawg_game_id", rawgGameId);
    formData.append("rating", rating);
    formData.append("review_title", reviewTitle);
    formData.append("review_text", reviewText);

    let response = await fetch("/addReview", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData
    });

    let data = await response.json();

    if (data.error) {
        reviewFeedback.textContent = data.error;
        reviewFeedback.style.color = "red";
    } else {
        reviewFeedback.textContent = data.success;
        reviewFeedback.style.color = "green";
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

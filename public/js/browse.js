document.addEventListener("DOMContentLoaded", () => {
    let buttons = document.querySelectorAll(".carousel-btn");

    for (let button of buttons) {
        button.addEventListener("click", () => {
            let trackId = button.getAttribute("data-track");
            let track = document.getElementById(trackId);

            if (!track) {
                return;
            }

            let card = track.querySelector(".browse-card");
            let scrollAmount = 300;

            if (card) {
                scrollAmount = card.offsetWidth + 16;
            }

            if (button.classList.contains("left")) {
                track.scrollBy({
                    left: -(scrollAmount * 2),
                    behavior: "smooth"
                });
            } else {
                track.scrollBy({
                    left: (scrollAmount * 2),
                    behavior: "smooth"
                });
            }
        });
    }
});
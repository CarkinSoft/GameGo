async function getCheapSharkDeal(gameName) {
            try {
                let url = "https://www.cheapshark.com/api/1.0/deals?title=" + encodeURIComponent(gameName) + "&pageSize=1";
                let response = await fetch(url);
                let deals = await response.json();

                if (deals && deals.length > 0) {
                    return deals[0];
                }

                return null;
            } catch (error) {
                console.error("CheapShark error:", error);
                return null;
            }
        }

        async function loadTopGames() {
            let topGamesDiv = document.getElementById("topGames");

            try {
                let rawgUrl = "https://api.rawg.io/api/games?key=ae5a2588f0c9456a914d874aeee6c546&ordering=-rating&page_size=10&dates=2000-01-01,2025-12-31";
                let response = await fetch(rawgUrl);
                let data = await response.json();

                let games = data.results
                    .filter(game => game.released)
                    .slice(0, 3);

                topGamesDiv.innerHTML = "";

                if (!games || games.length === 0) {
                    topGamesDiv.innerHTML = "<p style='color:red;'>No games loaded.</p>";
                    return;
                }

                for (let game of games) {
                    let deal = await getCheapSharkDeal(game.name);

                    let dealInfo = "";

                    if (deal) {
                        dealInfo = `
                            <p><strong>Normal Price:</strong> $${parseFloat(deal.normalPrice).toFixed(2)}</p>
                            <p><strong>Sale Price:</strong> $${parseFloat(deal.salePrice).toFixed(2)}</p>
                            <p><strong>Discount:</strong> ${parseFloat(deal.savings).toFixed(2)}%</p>

                            <a 
                                href="https://www.cheapshark.com/redirect?dealID=${deal.dealID}" 
                                target="_blank" 
                                class="btn btn-success btn-sm me-2"
                            >
                                View Deal
                            </a>
                        `;
                    } else {
                        dealInfo = `<p><strong>CheapShark Deal:</strong> Not available</p>`;
                    }

                    topGamesDiv.innerHTML += `
                        <div class="col-md-4 mb-4">
                            <div class="card p-3 h-100 search-card">
                                <h5>${game.name}</h5>

                                ${game.background_image ? `<img src="${game.background_image}" alt="${game.name}" class="img-fluid mb-2">` : ""}

                                <p><strong>RAWG Rating:</strong> ${game.rating}</p>

                                ${dealInfo}

                                <a 
                                    href="/gameInfo?gameId=${game.id}" 
                                    class="btn btn-primary btn-sm mt-2"
                                >
                                    View Game
                                </a>
                            </div>
                        </div>
                    `;
                }

            } catch (error) {
                console.error("Error loading games:", error);
                topGamesDiv.innerHTML = "<p style='color:red;'>Could not load games.</p>";
            }
        }

        loadTopGames();
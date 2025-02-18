$(document).ready(function () {
    let heroes = [];

    // Handle CSV File Upload
    $("#file-upload").on("change", function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const csvData = e.target.result;
            parseCSV(csvData);
        };
        reader.readAsText(file);
    });

    function parseCSV(csvData) {
        Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                heroes = results.data;
                populateHeroGrids(heroes);
            }
        });
    }

    function populateHeroGrids(heroes) {
        const hero1Select = $("#hero1-select");
        const hero2Select = $("#hero2-select");

        hero1Select.empty();
        hero2Select.empty();

        // Add default "Choose a Hero" option
        hero1Select.append('<option value="" disabled selected>Choose a Hero</option>');
        hero2Select.append('<option value="" disabled selected>Choose a Hero</option>');

        heroes.forEach(hero => {
            const heroOption = `
                <option value="${hero.hero_name}">
                    ${hero.hero_name}
                </option>
            `;
            hero1Select.append(heroOption);
            hero2Select.append(heroOption);
        });

        $(".hero-select").change(function () {
            const selectedHeroName = $(this).val();
            const selectedHero = heroes.find(h => h.hero_name === selectedHeroName);
            const selectId = $(this).attr("id");

            if (selectId === "hero1-select") {
                updateHeroStats(selectedHero, "#hero1-stats");
            } else {
                updateHeroStats(selectedHero, "#hero2-stats");
            }

            showBattlePrediction();
        });
    }

    function updateHeroStats(hero, containerId) {
        if (!hero) {
            $(containerId).empty();
            return;
        }

        $(containerId).html(`
            <h3>${hero.hero_name}</h3>
            <div class="stat-container">
                <p><strong>HP:</strong> ${hero.hp}</p>
                <div class="hp-bar-container">
                    <div class="hp-bar" style="width: ${hero.hp / 10}%;"></div>
                </div>
            </div>
            <p><strong>Physical Attack:</strong> ${hero.physical_atk}</p>
            <p><strong>Magic Defense:</strong> ${hero.magic_defense}</p>
            <p><strong>Win Rate:</strong> ${hero.win_rate}%</p>
        `);
    }

    function showBattlePrediction() {
        let hero1Name = $("#hero1-stats h3").text();
        let hero2Name = $("#hero2-stats h3").text();

        if (!hero1Name || !hero2Name) {
            $("#battle-result").hide();
            return;
        }

        let hero1 = heroes.find(h => h.hero_name === hero1Name);
        let hero2 = heroes.find(h => h.hero_name === hero2Name);

        if (!hero1 || !hero2) return;

        // Calculate probabilities based on attributes
        let hero1Score = (parseFloat(hero1.hp) * 0.4) +
                         (parseFloat(hero1.physical_atk) * 0.4) +
                         (parseFloat(hero1.win_rate) * 0.2);

        let hero2Score = (parseFloat(hero2.hp) * 0.4) +
                         (parseFloat(hero2.physical_atk) * 0.4) +
                         (parseFloat(hero2.win_rate) * 0.2);

        let totalScore = hero1Score + hero2Score;
        let hero1Probability = ((hero1Score / totalScore) * 100).toFixed(2);
        let hero2Probability = ((hero2Score / totalScore) * 100).toFixed(2);

        // Update UI
        $("#hero1-probability").text(`${hero1.hero_name}: ${hero1Probability}%`);
        $("#hero2-probability").text(`${hero2.hero_name}: ${hero2Probability}%`);

        // Adjust probability bar with smooth transition
        $("#probability-fill").animate({ width: `${hero1Probability}%` }, 500);

        // Show the battle result section
        $("#battle-result").fadeIn();
    }
});
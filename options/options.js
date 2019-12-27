function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
        piecetheme: document.querySelector("#piecetheme").value,
        boardtheme: document.querySelector("#boardtheme").value,
        boardsize: document.querySelector("#boardsize").value
    });
}

function restoreOptions() {

    function setCurrentChoice(result) {
        document.querySelector("#piecetheme").value =
            result.piecetheme || "wikipedia";
        document.querySelector("#boardtheme").value =
            result.boardtheme || "blue";
        document.querySelector("#boardsize").value =
            result.boardsize || 300;
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    var getting = browser.storage.sync.get(
        ["piecetheme", "boardtheme", "boardsize"]
    );
    getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("#piecetheme").addEventListener("input", saveOptions);
document.querySelector("#boardtheme").addEventListener("input", saveOptions);
document.querySelector("#boardsize").addEventListener("input", saveOptions);
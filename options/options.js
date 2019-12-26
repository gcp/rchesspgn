function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
        piecetheme: document.querySelector("#piecetheme").value,
        boardtheme: document.querySelector("#boardtheme").value
    });
}

function restoreOptions() {

    function setCurrentChoice(result) {
        document.querySelector("#piecetheme").value = result.piecetheme || "merida";
        document.querySelector("#boardtheme").value = result.boardtheme || "blue";
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    var getting = browser.storage.sync.get(["piecetheme", "boardtheme"]);
    getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("#savesettings").addEventListener("click", saveOptions);
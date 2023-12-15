document.addEventListener("DOMContentLoaded", function () {
  var links = document.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
    (function () {
      var ln = links[i];
      var location = ln.href;
      ln.onclick = function () {
        chrome.tabs.create({ active: true, url: location });
      };
    })();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get("version").then((result) => {
    if (result.version != chrome.runtime.getManifest().version) {
      alert(
        `New update!
        Features:
        -Saving and loading!!!!
          -Auto saves after every ball drop. Loads on game start. Try it out!
        -Cross computer syncing! For all the people on a chromebook.
          -Your highscore, saved games, and other secret stats are now saved across devices!

        Bugs squashed:
        -Fruits no longer have different hitboxes depending on the state that they were created.
        -Certain fruits (like the pineapple and cherry) have had their sprites changed to fix collision issues.

        Tweaks:
        -Made the grape hitbox slightly smaller.
        -Changed the background colors, as well as font.
      `
      );
      chrome.storage.sync.set({ version: chrome.runtime.getManifest().version });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get("dataTransferred").then((result) => {
    if (!result.dataTransferred) {
      chrome.storage.sync.set({
        highScore: localStorage.getItem("highscore"),
        ballsDropped: localStorage.getItem("ballsDropped"),
        dataTransferred: true,
      });
    }
  });
});

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
  if (localStorage.getItem("version") != chrome.runtime.getManifest().version) {
    alert(
      `New update!
      Features:
      - Strawberries and cherries now spawn less the further you progress into the game
      - Cheats! bored of the normal game? enable the following cheats (will disable high score saving);
        - Fast Drop: lowers the cooldown of fruits
        - No Game Over: disables game overs
      - Earthquakes!!!
        - Every 25 balls dropped you get access to an earthquake!
        - Pressing "e" or the button on the UI will activate an earthquake

      Fixes:
      - game over dialog no longer appears more than once on game over 

      Tweaks:
      - removed intro background (kept p5play logo)
      - made the area for the "loseline" to appear smaller
        - made the phisical line thinner (to make it less scary)
      `
    );
    localStorage.setItem("version", chrome.runtime.getManifest().version);
  }
});

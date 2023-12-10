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
      Fixes:
      -Fixed the bug where the fruits would infinitly combine.
      -Played around with the physics of combining fruits (now they have a little explotion that effect the fruits around them)
      Additions:
      -Added a button to reset the high score achieved by doing afformentioned infinite combining.
      -Changed the way a game over is triggered

      Animations and new sprites are coming soon.
      This game is still in like, beta beta beta, so expect breakaege. And tell me if it happens.
      
      -william
      `
    );
    localStorage.setItem("version", chrome.runtime.getManifest().version);
  }
});

const input = document.getElementById("toggleSwitch") as HTMLInputElement;
input.addEventListener("click", checkBoxClick);
const enabledImageSRC = "../../assets/images/icon38.png";
const disabledImageSRC = "../../assets/images/disabled_icon38.png";

window.onload = () => {
  chrome.storage.sync.get("youtube_audio_state", ({ youtube_audio_state }) => {
    input.checked = youtube_audio_state;
    changeIcon(youtube_audio_state);
    input.parentElement.offsetHeight;
    removeClass("preloaded");
  });
};

function checkBoxClick() {
  const youtube_audio_state = input.checked;
  changeIcon(youtube_audio_state);
  chrome.storage.sync.set({ youtube_audio_state });
}

function changeIcon(on) {
  (document.getElementById("titleIcon") as HTMLImageElement).src = on
    ? enabledImageSRC
    : disabledImageSRC;

  on
    ? chrome.action.setIcon({
        path: {
          128: "../../assets/images/icon128.png",
          38: "../../assets/images/icon38.png",
        },
      })
    : chrome.action.setIcon({
        path: {
          38: "../../assets/images/disabled_icon38.png",
        },
      });
}

function removeClass(className: string): void {
  const preloadedElements = document.getElementsByClassName(className);

  for (let i = 0; i < preloadedElements.length; i++) {
    preloadedElements[i].classList.remove(className);
  }
}

chrome.runtime.sendMessage("CreatedNewTab");
// if (response.state) {
var url = document.location.href;
const videoController = new VideoController();

function isVideoPage(url: string): boolean {
  return url.split("/").length == 4 && url.split("/")[3] != "";
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.force && request.audioURL && isVideoPage(url)) {
    videoController.setAudioUrl(request.audioURL);
  }
});

window.onload = () => {
  if (isVideoPage(url)) {
    videoController.onPageLoaded();
  }
  url = document.location.href;
  var bodyList = document.querySelector("body");

  var observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (url != document.location.href) {
        url = document.location.href;
        if (isVideoPage(url)) {
          //wait after switching the video for yt music to load it
          setTimeout(() => {
            videoController.onPageLoaded();
          }, 100);
        }
      }
    });
  });

  var config = {
    childList: true,
    subtree: true,
  };

  observer.observe(bodyList, config);
};
// }

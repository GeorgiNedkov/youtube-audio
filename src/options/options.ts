var disableVideoTextCheckbox = document.getElementById("disable-video-text") as HTMLInputElement;

if (disableVideoTextCheckbox) {
  disableVideoTextCheckbox.addEventListener("change", optionChanged);

  chrome.storage.local.get('disable_video_text', function(values) {
    disableVideoTextCheckbox.checked = (values.disable_video_text ? true : false);
  });
}
  
function optionChanged() {
  chrome.storage.local.set({
    "disable_video_text": disableVideoTextCheckbox.checked
  });
}

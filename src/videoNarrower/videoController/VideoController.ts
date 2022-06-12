class VideoController {
  public audioURL?: string;
  public checkBoxState = false;
  private checkBox?: HTMLInputElement;
  private tmp;

  public setAudioUrl(audioURL: string): void {
    this.tmp = audioURL;
    this.checkBoxState = true;
    const videoElement = this.videoElement;
    const fun = () => {
      if (
        !videoElement ||
        videoElement.src == audioURL ||
        this.audioURL == audioURL
      ) {
        return;
      }
      this.tmp = "";
      if (this.videoElement.src != "") {
        videoElement.src = audioURL;
        videoElement
          .play()
          .then(() => {})
          .catch((error) => {
            // console.warn(error);
          });
        this.audioURL = audioURL;
        this.createThumbnail();
      } else {
        setTimeout(() => {
          fun();
        }, 100);
      }
    };
    fun();
    if (this.checkBox && this.checkBox.checked != this.checkBoxState) {
      this.checkBox.checked = this.checkBoxState;
    }
  }

  public onPageLoaded() {
    this.appendElementToVideoCanvas(this.createSwitch);

    if (this.checkBoxState && this.tmp) {
      this.setAudioUrl(this.tmp);
    }
  }

  private get createSwitch(): HTMLElement {
    const div = document.createElement("div");
    const label = document.createElement("label");
    this.checkBox = document.createElement("input");
    const span = document.createElement("span");

    span.textContent = "Video";

    this.checkBox.checked = this.checkBoxState;
    this.checkBox.setAttribute("type", "checkbox");
    this.checkBox.classList.add("switch-button-checkbox");
    label.classList.add("switch-button-label");
    span.classList.add("switch-button-label-span");
    div.classList.add("switch-button");

    if (!this.isYoutubeMusic) {
      div.classList.add("ytp-chrome-bottom", "ytp-miniplayer-button");
    }

    this.checkBox.addEventListener("click", () => {
      const msg = this.checkBox.checked ? "audio" : "video";
      chrome.runtime.sendMessage(msg);
    });

    label.appendChild(span);
    div.appendChild(this.checkBox);
    div.appendChild(label);
    return div;
  }

  private appendElementToVideoCanvas(ell: HTMLElement): void {
    this.isYoutubeMusic
      ? document.getElementsByClassName("song-media-controls")[0].append(ell)
      : (this.videoElement.parentNode.parentNode as HTMLElement).appendChild(
          ell
        );
  }

  private get videoElement(): HTMLVideoElement | undefined {
    return document.getElementsByTagName("video")[0];
  }

  private createThumbnail() {
    const parent: HTMLElement =
      document.getElementsByTagName("video")[0].parentElement.parentElement;
    const ytidOutside = window.location.href.split("=")[1].split("&")[0];
    function createThumbnailURL(image) {
      const ytid = window.location.href.split("=")[1].split("&")[0];
      return `https://i.ytimg.com/vi/${ytid}/${image}.jpg`;
    }
    // Test thumbnail availability
    function testThumbnail(image) {
      return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            resolve(true);
          } else if (this.readyState == 4 && this.status != 200) {
            resolve(false);
          }
        };
        req.open("GET", createThumbnailURL(image));
        req.send();
      });
    }
    (() => {
      // thumbnail quality in descending order
      const images = [
        "maxresdefault",
        "hq720",
        "sddefault",
        "hqdefault",
        "mqdefault",
        "default",
      ];
      (() => {
        return new Promise((resolve, reject) => {
          function func(i) {
            if (i >= images.length) {
              resolve("");
            }
            testThumbnail(images[i]).then((result) => {
              if (result === true) {
                resolve(createThumbnailURL(images[i]));
              } else {
                func(i + 1);
              }
            });
          }
          func(0);
        });
      })().then((availableImage: string) => {
        // Put thumbnail in video
        const youtubeThumbnail = document.createElement("div");
        youtubeThumbnail.className = "youtube_thumbnail_div";

        const thumbnailImage = document.createElement("img");
        thumbnailImage.className = "youtube_thumbnail";
        thumbnailImage.src = availableImage;
        thumbnailImage.style.width = "100%";
        thumbnailImage.style.height = "100%";
        thumbnailImage.style.objectFit = "contain";

        youtubeThumbnail.appendChild(thumbnailImage);
        var target = document.getElementsByClassName(
          "ytp-cued-thumbnail-overlay"
        )[0];

        let youtube_thumbnail_dives = document.getElementsByClassName(
          "youtube_thumbnail_div"
        );
        for (let i = 0; i < youtube_thumbnail_dives.length; i++) {
          youtube_thumbnail_dives[i].parentNode.removeChild(
            youtube_thumbnail_dives[i]
          );
        }
        parent.insertBefore(youtubeThumbnail, parent.children[2]);
      });
    })();
  }

  private get isYoutubeMusic(): boolean {
    return window.location.hostname == "music.youtube.com";
  }
}

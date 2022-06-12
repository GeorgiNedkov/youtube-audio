class tabStruct {
  state: boolean;
  audioURL: string;
}
const tabIds = new Map<number, tabStruct>();

function removeURLParameters(url: string, parameters: string[]): string {
  parameters.forEach((parameter: string) => {
    var urlParts = url.split("?");
    if (urlParts.length >= 2) {
      var prefix = `${encodeURIComponent(parameter)}=`;
      var pars = urlParts[1].split(/[&;]/g);

      for (var i = pars.length; i-- > 0; ) {
        if (pars[i].lastIndexOf(prefix, 0) !== -1) {
          pars.splice(i, 1);
        }
      }

      url = urlParts[0] + "?" + pars.join("&");
    }
  });
  return url;
}

function processRequest(details) {
  if (!tabIds.has(details.tabId)) {
    return;
  }

  if (
    details.url.indexOf("mime=audio") !== -1 &&
    !details.url.includes("live=1")
  ) {
    var parametersToBeRemoved = ["range", "rn", "rbuf"];
    var audioURL = removeURLParameters(details.url, parametersToBeRemoved);
    if (!tabIds.has(details.tabId)) {
      tabIds.set(details.tabId, { state: false, audioURL: "" });
    }
    const tabIDSetting = tabIds.get(details.tabId);
    tabIDSetting.audioURL = audioURL;

    try {
      chrome.tabs.sendMessage(details.tabId, {
        audioURL: audioURL,
        force: tabIDSetting.state,
      });
    } catch (e) {
      // console.warn(e);
    }
  }
}

chrome.runtime.onMessage.addListener(
  (
    message: string,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    const tabID: number = sender.tab.id;
    switch (message) {
      case "CreatedNewTab":
        if (!tabIds.has(tabID)) {
          tabIds.set(tabID, { audioURL: "", state: false });
        } else {
          //ToDO
          // if state = true
          // block all memo=video requests
        }
        break;
      case "audio":
        if (!tabIds.has(tabID)) {
          tabIds.set(tabID, { state: true, audioURL: "" });
        } else {
          tabIds.get(tabID).state = true;
        }
        chrome.tabs.reload(tabID);
        break;
      case "video":
        if (!tabIds.has(tabID)) {
          tabIds.set(tabID, { state: false, audioURL: "" });
        } else {
          tabIds.get(tabID).state = false;
        }
        chrome.tabs.reload(tabID);
        break;
    }
    sendResponse({ received: true, state: true });
  }
);

// chrome.webNavigation.onHistoryStateUpdated.addListener(() => {
  chrome.webRequest.onBeforeRequest.addListener(processRequest, {
    urls: ["https://*.googlevideo.com/*"],
    types: ["xmlhttprequest"],
  });
// },{
//   url: [{hostContains:"youtube.com"}]
// });

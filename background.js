window.savedTabs = [];

function savedTabsMessageHandler(request) {
  if (request.type !== 'savedTabs') return;

  window.savedTabs[request.windowId] = request.tabs;
}

function tabsRequestedHandler(request, sender, sendResponse) {
  if (request.type !== 'tabsRequested') return;

  const result = window.savedTabs[request.windowId] === undefined
    ? []
    : window.savedTabs[request.windowId];

  sendResponse(result);
}

browser.runtime.onMessage.addListener(savedTabsMessageHandler);
browser.runtime.onMessage.addListener(tabsRequestedHandler);

browser.windows.onRemoved.addListener((windowId) => {
  window.savedTabs.splice(windowId, 1);
});

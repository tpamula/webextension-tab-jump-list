import { events } from './events.js';

export default class BrowserWrapper {
  static activateTab(tabId) {
    browser.tabs.update(tabId, { active: true });
  }

  static async getBackgroundSavedTabsAsync(windowId) {
    const savedTabs = await BrowserWrapper.sendMessage({ type: 'tabsRequested', windowId });
    return savedTabs;
  }

  static async getCurrentTabAsync() {
    const currentWindowTabs = await this.getCurrentWindowVisibleTabs();
    return currentWindowTabs.find(t => t.active);
  }

  static getCurrentWindowVisibleTabs() {
    // filtering this way because querying for "hidden: false" breaks Chrome
    return browser.tabs.query({ currentWindow: true }).then(tabs => tabs.filter(t => !t.hidden));
  }

  static getCurrentWindow() {
    return browser.windows.getCurrent();
  }

  static sendMessage(message) {
    return browser.runtime.sendMessage(message);
  }
}

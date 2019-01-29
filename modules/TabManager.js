import { events } from './events.js';
import Tab from './Tab.js';
import BrowserWrapper from './BrowserWrapper.js';

class TabList {
  constructor() {
    this.savedTabs = [];
  }

  add(tab) {
    if (this.savedTabs.some(tt => tt.id === tab.id)) return;

    this.savedTabs.push(tab);
  }

  remove(tabId) {
    this.savedTabs = this.savedTabs.filter(tt => tt.id !== tabId);
  }

  updateDescription(tabId, description) {
    const tab = this.savedTabs.find(t => t.id === tabId);
    tab.description = description;
  }
}

export default class TabManager {
  constructor() {
    this._tabList = new TabList();

    this._initializeTabs();
    this._addListeners();
  }

  remove(tabId) {
    this._tabList.remove(tabId);

    this._persistTabs();

    this._contentChanged();
  }

  async saveCurrentTabAsync() {
    const description = '';
    const currentTab = await BrowserWrapper.getCurrentTabAsync();
    this._tabList.add(new Tab(currentTab.id, currentTab.title, description));

    this._persistTabs();

    this._contentChanged();
  }

  _addListeners() {
    document.addEventListener(events.currentTabAddTriggered, () => {
      this.saveCurrentTabAsync().then(() => {
        document.dispatchEvent(new Event(events.windowCloseTriggered));
      });
    });

    document.addEventListener(events.savedTabCheckboxToggled, (e) => {
      if (!e.detail.checked) this.remove(parseInt(e.detail.tabId, 10));
    });
  }

  _contentChanged() {
    document.dispatchEvent(new CustomEvent(events.contentChanged,
      { detail: { tabs: this._tabList.savedTabs } }));
  }

  _initializeTabs() {
    Promise.all([BrowserWrapper.getCurrentWindow(), BrowserWrapper.getCurrentWindowVisibleTabs()])
      .then((resolved) => {
        const currentWindow = resolved[0];
        const currentWindowVisibleTabs = resolved[1];

        BrowserWrapper.getBackgroundSavedTabsAsync(currentWindow.id)
          .then((tabs) => {
            const currentWindowVisibleTabsIds = currentWindowVisibleTabs.flatMap(vt => vt.id);
            // filter out hidden & closed tabs
            this._tabList.savedTabs = tabs.filter(t => currentWindowVisibleTabsIds.includes(t.id));
            this._contentChanged();
          });
      });
  }

  _persistTabs() {
    BrowserWrapper.getCurrentWindow().then((window) => {
      BrowserWrapper.sendMessage({
        type: 'savedTabs',
        windowId: window.id,
        tabs: this._tabList.savedTabs,
      });
    });
  }
}

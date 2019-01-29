import { events } from './events.js';
import BrowserWrapper from './BrowserWrapper.js';
import Tab from './Tab.js';

export default class Presenter {
  static initialize() {
    Presenter._setCurrentTabTitle();
    Presenter._addDispatchers();
    Presenter._addListeners();
  }

  static reload(tabs) {
    Presenter._clearCurrentPresentation();
    Presenter._createPresentation(tabs);
  }

  static switchTab(tabId, closeWindow = false) {
    BrowserWrapper.activateTab(tabId);
    if (closeWindow) window.close();
  }

  static _addDispatchers() {
    const currentTabButton = document.getElementById('current-tab-button');
    currentTabButton.onclick = () => {
      document.dispatchEvent(new Event(events.currentTabAddTriggered));
    };

    window.addEventListener('keydown', (event) => {
      const addTabShortcuts = ['s', 'd'];
      if (addTabShortcuts.includes(event.key)) {
        document.dispatchEvent(new Event(events.currentTabAddTriggered));
      }
    });
  }

  static _addListeners() {
    document.addEventListener(events.contentChanged, e => Presenter.reload(e.detail.tabs));

    document.addEventListener(events.tabClicked, e => Presenter.switchTab(e.detail.tabId));

    document.addEventListener(events.windowCloseTriggered, () => window.close());

    for (let i = 1; i <= 9; i += 1) {
      window.addEventListener('keydown', (event) => {
        if (event.key === i.toString()) {
          const tabId = parseInt(document.getElementsByTagName('li')[i - 1].getAttribute('tab-id'), 10);
          Presenter.switchTab(tabId, true);
        }
      });
    }
  }

  static _clearCurrentPresentation() {
    document.getElementById('saved-tabs').innerHTML = '';
  }

  static _createPresentation(tabs) {
    tabs.forEach((t) => {
      const liNode = Tab.toDomLiNode(t);
      document.getElementById('saved-tabs').appendChild(liNode);
    });
  }

  static _setCurrentTabTitle() {
    BrowserWrapper.getCurrentTabAsync()
      .then((val) => {
        const trimmedTitle = Tab.trimTitle(val.title);
        document.getElementById('current-tab-title').innerHTML = trimmedTitle;
      });
  }
}

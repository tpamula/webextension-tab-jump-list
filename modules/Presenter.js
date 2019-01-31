import { events } from './events.js';
import BrowserWrapper from './BrowserWrapper.js';
import Tab from './Tab.js';

export default class Presenter {
  static initialize() {
    Presenter._setCurrentTabTitleDisplay();
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
  }

  static _addListeners() {
    document.addEventListener(events.contentChanged, e => Presenter.reload(e.detail.tabs));

    document.addEventListener(events.tabClicked, e => Presenter.switchTab(e.detail.tabId));

    document.addEventListener(events.windowCloseTriggered, () => window.close());

    window.addEventListener('keydown', (event) => {
      const addTabShortcuts = ['s', 'd'];
      if (addTabShortcuts.includes(event.key)) {
        document.dispatchEvent(new Event(events.currentTabAddTriggered));
      }
    });

    const dispatchRemovalTabTriggered = (tabId) => {
      const savedTabRemovalTriggeredEvent = new CustomEvent(events.savedTabRemovalTriggered, {
        detail: {
          tabId,
        },
      });
      document.dispatchEvent(savedTabRemovalTriggeredEvent);
    };
    const numberKeyboardEventCodes = Array.from(Array(9).keys()).map(number => `Digit${number + 1}`);
    window.addEventListener('keydown', (event) => {
      if (numberKeyboardEventCodes.includes(event.code)) {
        const numberPressed = parseInt(event.code.slice(-1), 10);
        const tabNodes = document.getElementsByTagName('li');
        if (tabNodes.length <= numberPressed - 1) return;
        const tabId = parseInt(tabNodes[numberPressed - 1].getAttribute('tab-id'), 10);
        if (event.shiftKey) {
          dispatchRemovalTabTriggered(tabId);
        } else {
          Presenter.switchTab(tabId, true);
        }
      }
    });
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

  static _setCurrentTabTitleDisplay() {
    BrowserWrapper.getCurrentTabAsync()
      .then((currentTab) => {
        const truncatedTitle = Tab.truncateTitle(currentTab.title);
        document.getElementById('current-tab-title').innerHTML = truncatedTitle;
      });
  }
}

import { events } from './events.js';

export default class Tab {
  constructor(id, title, description = '') {
    this.id = id;
    this.title = title;
    this.description = description;
  }

  static toDomLiNode(tab) {
    const liNode = document.createElement('li');
    const trimmedTitle = Tab.truncateTitle(tab.title);
    liNode.innerHTML = `<span style="white-space: nowrap; cursor: pointer;"><input type="checkbox" class="saved-tab-checkbox" checked /> <span class="title">${trimmedTitle}</span> ${tab.description}</span>`;
    liNode.setAttribute('tab-id', tab.id);

    liNode.getElementsByClassName('title').item(0).onclick = function activateTab() {
      const tabClicked = new CustomEvent(events.tabClicked, {
        detail: {
          tabId: tab.id,
        },
      });

      document.dispatchEvent(tabClicked);
    };

    const checkbox = liNode.getElementsByClassName('saved-tab-checkbox')[0];

    checkbox.onchange = () => {
      const savedTabRemovalTriggeredEvent = new CustomEvent(events.savedTabRemovalTriggered, {
        detail: {
          tabId: tab.id,
        },
      });

      document.dispatchEvent(savedTabRemovalTriggeredEvent);
    };

    return liNode;
  }

  static truncateTitle(title) {
    const maxTitleChars = 65;

    return title.length > maxTitleChars
      ? `${title.substring(0, maxTitleChars - 5)}(...)`
      : title;
  }
}

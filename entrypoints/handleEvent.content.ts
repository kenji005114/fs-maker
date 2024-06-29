import { toHiragana, toKatakana, toRomaji } from "wanakana";

import {
  DisplayMode,
  ExtEvent,
  ExtStorage,
  FURIGANA_CLASS,
  FuriganaType,
  SelectMode,
  type StyleEvent,
} from "@/commons/constants";

import { Selector } from "@/commons/selectElement";
import { toStorageKey } from "@/commons/utils";

export default defineContentScript({
  matches: ["https://*/*"],
  runAt: "document_start",
  async main() {
    // styleHandler uses storage and is called immediately,
    // so it needs to be initialized immediately.
    const styleEvents: StyleEvent[] = [
      ExtEvent.SwitchDisplayMode,
      ExtEvent.SwitchSelectMode,
      ExtEvent.AdjustFontSize,
      ExtEvent.AdjustFontColor,
      ExtEvent.ToggleKanjiFilter,
    ];
    await Promise.all(styleEvents.map((item) => styleHandler(item)));

    browser.runtime.onMessage.addListener((event: ExtEvent) => {
      switch (event) {
        case ExtEvent.SwitchFuriganaType:
          switchFuriganaHandler();
          break;
        case ExtEvent.AddFurigana:
          addFuriganaHandler();
          break;
        case ExtEvent.MarkActiveTab:
          break;
        default:
          styleHandler(event);
          break;
      }
    });
  },
});

async function styleHandler(type: StyleEvent) {
  const rubySelector = `ruby.${FURIGANA_CLASS}`;
  const rtSelector = `${rubySelector} > rt`;
  const rtHoverSelector = `${rubySelector}:hover > rt`;
  const rpSelector = `${rubySelector} > rp`;
  const filteredRtSelector = `${rubySelector}.isFiltered > rt`;

  const value = await storage.getItem(`local:${toStorageKey(type)}`);
  let css = "";
  switch (type) {
    case ExtEvent.SwitchDisplayMode:
      if (value === DisplayMode.Never) {
        css = `
          ${rtSelector} {
            display: none;
          }`;
      } else if (value === DisplayMode.Hover) {
        css = `
          ${rtSelector} {
            opacity: 0;
          }

          ${rtHoverSelector} {
            opacity: 1;
          }`;
      } else if (value === DisplayMode.HoverNoGap) {
        css = `
          ${rtSelector} {
            display: none;
          }

          ${rtHoverSelector} {
            display: revert;
          }`;
      }
      break;
    case ExtEvent.SwitchSelectMode:
      css = `
        ${rtSelector} {
          user-select: ${value === SelectMode.Original ? "none" : "text"};
        }

        ${rpSelector} {
          display: ${value === SelectMode.Parentheses ? "block" : "none"};
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }`;
      break;
    case ExtEvent.AdjustFontSize:
      css = `
        ${rtSelector} {
          font-size: ${value}%;
        }`;
      break;
    case ExtEvent.AdjustFontColor:
      css = `
        ${rtSelector} {
          color: ${value};
        }`;
      break;
    case ExtEvent.ToggleKanjiFilter:
      if (value) {
        css = `
          ${filteredRtSelector} {
            display: none;
          }`;
      }
      break;
  }
  const id = `${FURIGANA_CLASS}${type}`;
  const oldStyle = document.getElementById(id);
  if (oldStyle) {
    oldStyle.textContent = css;
  } else {
    const style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.setAttribute("id", id);
    style.textContent = css;
    document.head.appendChild(style);
  }
}

async function switchFuriganaHandler() {
  const rtSelector = `ruby.${FURIGANA_CLASS} > rt`;
  const nodes = document.querySelectorAll(rtSelector);
  const value = (await storage.getItem(`local:${ExtStorage.FuriganaType}`)) as FuriganaType;
  switch (value) {
    case FuriganaType.Hiragana:
      for (const node of nodes) {
        node.textContent = toHiragana(node.textContent!);
      }
      break;
    case FuriganaType.Katakana:
      for (const node of nodes) {
        node.textContent = toKatakana(node.textContent!);
      }
      break;
    case FuriganaType.Romaji:
      for (const node of nodes) {
        node.textContent = toRomaji(node.textContent!);
      }
      break;
  }
}

function addFuriganaHandler() {
  const selector = Selector.create();
  const selectHandler = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      selector.close();
      document.removeEventListener("keydown", selectHandler);
    }
  };
  selector.open();
  document.addEventListener("keydown", selectHandler);
}

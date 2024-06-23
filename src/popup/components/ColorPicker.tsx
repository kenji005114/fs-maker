import { TinyColor } from "@ctrl/tinycolor";
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const { t } = useTranslation("popup");

  return (
    <Popover className="flex grow">
      {({ open }) => (
        <>
          <PopoverButton className="group flex flex-1 items-center justify-between rounded px-2 capitalize transition-all hover:bg-gray-200 focus-visible:bg-gray-200 dark:hover:bg-slate-700 dark:focus-visible:bg-slate-700">
            {t("btnSelectColor")}
            <div
              className="hidden size-3 rounded-full group-hover:block group-focus-visible:block"
              style={{ backgroundColor: color }}
            />
          </PopoverButton>
          <Transition
            appear
            show={open}
            enter="transition ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <PopoverPanel focus className="absolute inset-0 z-50 bg-white dark:bg-slate-900">
              <ColorPickerPanel color={color} onChange={onChange}>
                <PopoverButton className="flex items-center justify-center gap-2 rounded border-none px-1.5 font-sans shadow-sm outline-none ring-1 ring-gray-300 transition-all hover:text-sky-500 focus-visible:text-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500 dark:ring-slate-700 dark:focus-visible:ring-sky-500">
                  {t("btnClosePanel")}
                  <span className="size-4 i-[material-symbols--close-rounded]" aria-hidden="true" />
                </PopoverButton>
              </ColorPickerPanel>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

interface ColorPickerPanelProps {
  color: string;
  children: React.ReactNode;
  onChange: (color: string) => void;
}

function ColorPickerPanel({ color, children, onChange }: ColorPickerPanelProps) {
  const hsv = new TinyColor(color).toHsv();
  const [hue, setHue] = useState(hsv.h);
  const [saturationAndValue, setSaturationAndValue] = useState(
    color === "currentColor" ? { s: 1, v: 1 } : { s: hsv.s, v: hsv.v },
  );
  const [input, setInput] = useState(new TinyColor(color).toHexString());

  const { t } = useTranslation("popup");

  return (
    <div className="flex size-full flex-col justify-between px-2.5 py-3">
      <SaturationAndValuePicker
        color={{ s: saturationAndValue.s, v: saturationAndValue.v }}
        hue={hue}
        onChange={(sv) => {
          setSaturationAndValue(sv);
          const newColor = new TinyColor({
            h: hue,
            ...sv,
          }).toHexString();
          setInput(newColor);
          onChange(newColor);
        }}
      />
      <div className="flex gap-1">
        <HuePicker
          hue={hue}
          onChange={(h) => {
            setHue(h);
            const newColor = new TinyColor({
              s: saturationAndValue.s,
              v: saturationAndValue.v,
              h,
            }).toHexString();
            setInput(newColor);
            onChange(newColor);
          }}
        />
        <div
          className="size-4 rounded-sm"
          style={{
            boxShadow:
              "rgba(0, 0, 0, 0.15) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.25) 0px 0px 4px inset",
            backgroundColor: color,
          }}
        />
      </div>
      <div>
        <div className="flex items-center justify-between text-sm">
          <label>
            <span>HEX </span>
            <input
              className="h-6 w-[4.5rem] rounded border-none px-1.5 font-mono text-sm uppercase shadow-sm ring-1 ring-inset ring-gray-300 focus:border-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-950 dark:ring-slate-700 dark:focus-visible:ring-sky-500"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && new TinyColor(input).isValid) {
                  const hsv = new TinyColor(input).toHsv();
                  setHue(hsv.h);
                  setSaturationAndValue({ s: hsv.s, v: hsv.v });
                  const colorStr = new TinyColor(input).toHexString();
                  setInput(colorStr);
                  onChange(colorStr);
                }
              }}
            />
          </label>
          <button
            className="flex h-6 max-w-[7ch] items-center justify-center gap-0.5 rounded border-none px-1.5 font-sans shadow-sm outline-none ring-1 ring-gray-300 transition-all hover:text-sky-500 focus-visible:text-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500 dark:bg-slate-950 dark:ring-slate-700 dark:focus-visible:ring-sky-500"
            onClick={() => {
              setHue(0);
              setSaturationAndValue({ s: 1, v: 1 });
              setInput("#000000");
              onChange("currentColor");
            }}
          >
            <span className="">{t("btnReset")}</span>
            <span
              className="text-lg min-w-0 i-[material-symbols--refresh-rounded]"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
      <ColorSwitcher
        onChange={(color) => {
          const tinycolor = new TinyColor(color);
          setHue(tinycolor.toHsv().h);
          setSaturationAndValue(tinycolor.toHsv());
          setInput(tinycolor.toHexString());
          onChange(color);
        }}
      />
      {children}
    </div>
  );
}

function addPointerEventListener(
  element: HTMLElement,
  pointerId: number,
  listener: (event: PointerEvent) => void,
) {
  element.setPointerCapture(pointerId);
  element.addEventListener("pointermove", listener);
  element.addEventListener(
    "pointerup",
    () => {
      element.releasePointerCapture(pointerId);
      element.removeEventListener("pointermove", listener);
    },
    { once: true },
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

interface HS {
  s: number;
  v: number;
}

interface SaturationAndValuePickerProps {
  color: HS;
  hue: number;
  onChange: (color: HS) => void;
}

function SaturationAndValuePicker({ color, hue, onChange }: SaturationAndValuePickerProps) {
  function handleSaturationCanvasPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const saturationCanvas = event.currentTarget;
    const { width, height, left, top } = saturationCanvas.getBoundingClientRect();
    updateSaturationAndValue(event);
    addPointerEventListener(saturationCanvas, event.pointerId, updateSaturationAndValue);
    function updateSaturationAndValue(event: React.PointerEvent | PointerEvent) {
      onChange({
        s: clamp((event.clientX - left) / width, 0, 1),
        v: clamp(1 - (event.clientY - top) / height, 0, 1),
      });
    }
  }

  return (
    <div className="relative aspect-[7/6] w-full cursor-crosshair rounded-sm">
      <div
        onPointerDown={handleSaturationCanvasPointerDown}
        className="absolute inset-0 rounded-sm shadow-inner"
        style={{
          background: `linear-gradient(to right, white, ${new TinyColor({
            h: hue,
            s: 100,
            v: 100,
          }).toHexString()})`,
        }}
      >
        <div className="absolute inset-0 rounded-sm bg-gradient-to-b from-transparent to-black" />
        <div
          className="absolute size-1 -translate-x-1/2 -translate-y-1/2 rounded-full "
          style={{
            boxShadow:
              "rgb(255, 255, 255) 0px 0px 0px 1.5px, rgba(0, 0, 0, 0.3) 0px 0px 1px 1px inset, rgba(0, 0, 0, 0.4) 0px 0px 1px 2px",
            left: `${color.s * 100}%`,
            top: `${100 - color.v * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

interface HuePickerProps {
  hue: number;
  onChange: (hue: number) => void;
}

function HuePicker({ hue, onChange }: HuePickerProps) {
  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const hueCanvas = event.currentTarget;
    const { width, left } = hueCanvas.getBoundingClientRect();
    updateHue(event);
    addPointerEventListener(hueCanvas, event.pointerId, updateHue);
    function updateHue(event: React.PointerEvent | PointerEvent) {
      onChange(clamp(((event.clientX - left) / width) * 360, 0, 359));
    }
  }
  return (
    <div
      onPointerDown={handlePointerDown}
      className="relative h-4 flex-1 cursor-crosshair rounded-sm"
      style={{
        background:
          "linear-gradient(to right, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 17%, rgb(0, 255, 0) 33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 67%, rgb(255, 0, 255) 83%, rgb(255, 0, 0) 100%)",
      }}
    >
      <div
        className="absolute top-1/2 h-3.5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-[1px] bg-white"
        style={{
          boxShadow: "rgba(0, 0, 0, 0.6) 0px 0px 2px",
          left: `${(hue / 360) * 100}%`,
        }}
      />
    </div>
  );
}

function ColorSwitcher({ onChange }: { onChange: (color: string) => void }) {
  // biome-ignore format: next-line
  const colors = [
    'black', 'white', 'violet', 'orange', 'gold',
    'sienna', 'lime', 'springgreen', 'forestgreen', 'fuchsia',
    'blueviolet', 'orangered', 'aquamarine', 'teal', 'royalblue',
    'darkturquoise', 'silver', 'crimson', 'pink', 'lightskyblue',
    'aqua', 'lightsalmon', 'paleturquoise', 'gray', 'tomato',
  ]
  return (
    <div className="grid grid-cols-5 grid-rows-5 gap-2.5 border-t-2 border-gray-300 pt-3 dark:border-slate-700">
      {colors.map((color) => {
        const baseShadow = "rgba(0, 0, 0, 0.15) 0px 0px 0px 1px inset";
        const focusShadow = `${baseShadow} ,${color} 0px 0px 6px`;
        return (
          <button
            key={color}
            className="h-4 w-full cursor-pointer rounded-sm outline-offset-2"
            style={{ boxShadow: baseShadow, backgroundColor: color }}
            onFocus={(event) => {
              event.currentTarget.style.boxShadow = focusShadow;
            }}
            onBlur={(event) => {
              event.currentTarget.style.boxShadow = baseShadow;
            }}
            onClick={() => {
              onChange(color);
            }}
          >
            <span className="sr-only">{color}</span>
          </button>
        );
      })}
    </div>
  );
}

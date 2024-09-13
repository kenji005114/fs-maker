import { ExtStorage, type MoreSettings } from "@/commons/constants";
import { moreSettings, setMoreSettings } from "@/commons/utils";

import { Suspense, use } from "react";
import { useTranslation } from "react-i18next";

import { Switch } from "@headlessui/react";
import { Transition } from "@headlessui/react";

import ExclusionHandler from "../components/ExclusionHandler";
import LanguageSwitcher from "../components/LanguageSwitcher";
import Page from "../components/Page";

export default function Settings() {
  const { t } = useTranslation();

  return (
    <Page title={t("navSettings")} icon="i-tabler-settings">
      <Suspense>
        <Transition
          as="div"
          appear
          show={true}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <MoreSettingsMenu settingsPromise={moreSettings.getValue()} />
        </Transition>
      </Suspense>
    </Page>
  );
}

function MoreSettingsMenu({ settingsPromise }: { settingsPromise: Promise<MoreSettings> }) {
  const [settings, setSettings] = useState(use(settingsPromise));
  const { i18n, t } = useTranslation();

  async function handleLanguageChange(language: string) {
    if (settings[ExtStorage.Language] === language) {
      return;
    }
    await setMoreSettings(ExtStorage.Language, language);
    setSettings({ ...settings, [ExtStorage.Language]: language });
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }

  async function handleDisableWarningChange(enabled: boolean) {
    if (settings[ExtStorage.DisableWarning] === enabled) {
      return;
    }
    await setMoreSettings(ExtStorage.DisableWarning, enabled);
    setSettings({ ...settings, [ExtStorage.DisableWarning]: enabled });
  }

  async function handleColoringKanjiChange(enabled: boolean) {
    if (settings[ExtStorage.ColoringKanji] === enabled) {
      return;
    }
    await setMoreSettings(ExtStorage.ColoringKanji, enabled);
    setSettings({ ...settings, [ExtStorage.ColoringKanji]: enabled });
  }

  async function handleExclusionListChange(sites: string[]) {
    const unrepeatedSites = Array.from(new Set(sites));
    await setMoreSettings(ExtStorage.ExcludeSites, unrepeatedSites);
    setSettings({ ...settings, [ExtStorage.ExcludeSites]: unrepeatedSites });
  }
  return (
    <menu className="xl:w-[800px] text-pretty flex justify-between items-center flex-col space-y-10">
      <li className="flex gap-4 items-center w-full justify-between">
        <div>
          <div className="text-slate-800 dark:text-slate-200 text-lg font-bold">
            {t("settingsLanguage")}
          </div>
          <div>{t("settingsLanguageDesc")}</div>
        </div>
        <LanguageSwitcher
          language={settings[ExtStorage.Language] ?? i18n.language}
          onChange={handleLanguageChange}
        />
      </li>
      <li className="flex gap-4 items-center w-full justify-between">
        <div>
          <div className="text-slate-800 dark:text-slate-200 text-lg font-bold">
            {t("settingsDisableWarning")}
          </div>
          <div>{t("settingsDisableWarningDesc")}</div>
        </div>
        <SettingSwitch
          enabled={settings[ExtStorage.DisableWarning]}
          onChange={handleDisableWarningChange}
        />
      </li>
      <li className="flex gap-4 items-center w-full justify-between">
        <div>
          <div className="text-slate-800 dark:text-slate-200 text-lg font-bold">
            {t("settingsColoringKanji")}
          </div>
          <div>{t("settingsColoringKanjiDesc")}</div>
        </div>
        <SettingSwitch
          enabled={settings[ExtStorage.ColoringKanji]}
          onChange={handleColoringKanjiChange}
        />
      </li>
      <ExclusionHandler
        sites={settings[ExtStorage.ExcludeSites]}
        onChange={handleExclusionListChange}
      />
    </menu>
  );
}

function SettingSwitch({
  enabled,
  onChange,
}: { enabled: boolean; onChange: (enabled: boolean) => void }) {
  return (
    <div>
      <Switch
        checked={enabled}
        onChange={onChange}
        className="group relative flex h-7 w-14 cursor-pointer rounded-full bg-slate-900/10 dark:bg-white/10 p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white dark:data-[checked]:bg-white/10 data-[checked]:bg-black/10"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-slate-900 dark:bg-white ring-0 shadow-lg transition duration-200 ease-in-out group-data-[checked]:translate-x-7"
        />
      </Switch>
    </div>
  );
}

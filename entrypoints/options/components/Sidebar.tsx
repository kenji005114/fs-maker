import Logo from "@/assets/icons/Logo.svg?react";
import { Transition } from "@headlessui/react";

import { useTranslation } from "react-i18next";
import type { LinkProps } from "react-router-dom";

type CustomLink = LinkProps & { label: string; icon: string };

export default function Sidebar() {
  const { t } = useTranslation();

  const navItems: CustomLink[] = [
    { to: "/", target: "_self", label: t("navEditRules"), icon: "i-tabler-list-details" },
    { to: "/changelog", target: "_self", label: t("navChangelog"), icon: "i-tabler-history" },
    {
      to: chrome.runtime.getURL("/popup.html"),
      target: "_blank",
      label: "Popup",
      icon: "i-tabler-puzzle",
    },
    {
      to: "https://github.com/aiktb/FuriganaMaker",
      target: "_blank",
      label: "GitHub",
      icon: "i-tabler-brand-github",
    },
    {
      to: "https://furiganamaker.app",
      target: "_blank",
      label: t("navOfficialSite"),
      icon: "i-tabler-world",
    },
  ];

  const [sidebarIsOpen, setSidebarIsOpen] = useState(
    window.matchMedia("(min-width: 1024px)").matches,
  );
  useEffect(() => {
    const onResize = () => {
      setSidebarIsOpen(window.matchMedia("(min-width: 1024px)").matches);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <button
        className="flex items-center justify-center fixed top-24 left-4 lg:hidden p-2 -mx-2 z-20 bg-white dark:bg-slate-900 border-2 border-solid rounded dark:border-slate-700 border-gray-300"
        onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
      >
        <div
          className={`${sidebarIsOpen ? "!flex" : "hidden"} fixed inset-0 bg-transparent/40 backdrop-blur backdrop-filter`}
        />
        <i className="text-sky-500 size-7 i-tabler-chevrons-right" />
      </button>
      <Transition show={sidebarIsOpen}>
        <nav
          className={`${sidebarIsOpen ? "!flex" : ""} fixed top-0 z-30 lg:flex transition ease-in-out data-[closed]:opacity-0 data-[enter]:duration-100 data-[enter]:data-[closed]:-translate-x-full data-[leave]:duration-300 data-[leave]:data-[closed]:-translate-x-full min-h-screen w-72 flex-col gap-6 border-gray-200 border-r border-solid bg-white px-6 py-5 font-semibold text-base dark:border-slate-800 dark:bg-slate-900`}
        >
          <div className="flex items-center gap-2">
            <Logo className="size-8" />
            <div className="flex items-center justify-center gap-2 px-1.5 text-black dark:text-white">
              <span className="font-bold text-lg">{chrome.runtime.getManifest().name}</span>
              <span className="font-normal text-slate-700 text-sm dark:text-slate-200">{`v${chrome.runtime.getManifest().version}`}</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-between gap-2">
            <div className="flex flex-col gap-7">
              <div className="-mx-2 flex flex-col gap-2">
                {navItems.map((item) => (
                  <NavLink
                    to={item.to}
                    key={item.label}
                    target={item.target}
                    className={({ isActive }) =>
                      `group flex w-64 items-center justify-between rounded-md p-2 hover:bg-slate-100 dark:hover:bg-gray-800 dark:hover:text-white hover:text-black ${isActive ? "dark:bg-gray-800 bg-slate-100 dark:text-white text-black" : ""}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-4">
                          <i
                            className={`${item.icon} size-6 group-hover:dark:text-white group-hover:text-black ${isActive ? "dark:text-white text-black" : "dark:text-slate-300 text-slate-600"}`}
                          />
                          {item.label}
                        </div>
                        {item.target === "_blank" && (
                          <i className="i-tabler-external-link dark:text-gray-300 text-slate-800" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
              <div>
                <div>{t("yourTips")}</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="flex size-6 items-center justify-center rounded-lg border-2 border-slate-300 dark:border-slate-700 border-solid dark:bg-gray-800">
                      <i className="i-tabler-command size-4 text-gray-400" />
                    </div>
                    {t("manageShortcuts")}
                  </div>
                  <i className="-rotate-45 i-tabler-arrow-back size-4 dark:text-gray-300 text-slate-800" />
                </div>
                {import.meta.env.FIREFOX ? (
                  <Link
                    className="flex justify-center mt-2 text-sm text-black dark:text-white underline decoration-solid"
                    to="https://support.mozilla.org/en-US/kb/manage-extension-shortcuts-firefox"
                    target="_blank"
                  >
                    {t("sidebarFirefoxSupport")}
                  </Link>
                ) : (
                  <p className="mt-2 select-all text-sm">chrome://extensions/shortcuts</p>
                )}
              </div>
            </div>
            <Link
              to="https://buymeacoffee.com/aiktb"
              target="_blank"
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 border-solid bg-slate-50 p-2 text-zinc-800 dark:border-neutral-700 dark:hover:border-neutral-600 dark:bg-gray-800 dark:hover:bg-gray-700 hover:bg-gray-100 dark:text-slate-300"
            >
              <i className="i-tabler-heart size-6 text-pink-500" />
              {t("sidebarSponsor")}
            </Link>
          </div>
        </nav>
      </Transition>
    </>
  );
}

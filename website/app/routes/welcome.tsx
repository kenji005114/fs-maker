import type { MetaFunction } from "@remix-run/cloudflare";

import { Fireworks, type FireworksHandlers } from "@fireworks-js/react";
import { Link } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useContext } from "react";
import { LinksContext } from "../contexts";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Welcome to Furigana Maker",
    },
  ];
};
export default function Welcome() {
  const links = useContext(LinksContext)!;
  const ref = useRef<FireworksHandlers>(null);

  useEffect(() => {
    ref.current?.start();
    setTimeout(() => {
      ref.current?.waitStop();
    }, 30 * 1000);

    const riseObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-rising");
          riseObserver.unobserve(entry.target);
        }
      }
    });
    for (const el of document.querySelectorAll(".animeRising")) {
      riseObserver.observe(el);
    }
    return () => ref.current?.stop() && riseObserver.disconnect();
  }, []);

  return (
    <div className="relative mt-5 flex min-h-screen flex-col items-center gap-5 text-pretty px-10 py-8 pt-24 text-center lg:mt-16 lg:pt-36">
      <Fireworks
        ref={ref}
        options={{ opacity: 0.5 }}
        className="-z-10 fixed top-0 left-0 h-full w-full"
      />
      <section className="container flex flex-col items-center gap-5 text-pretty text-center sm:px-10">
        <h1 className="animeRising font-bold text-3xl lg:text-8xl md:text-6xl sm:text-5xl">
          Welcome to Furigana Maker!🎉
        </h1>
        <p className="animeRising max-w-[42rem] leading-normal sm:text-xl sm:leading-8">
          You have successfully installed the extension, now you can start to add furigana to Kanji,
          please open the Popup page of the extension and click on the{" "}
          <span className="text-sky-400">"Add furigana"</span> button and select the Japanese text
          below and watch the change.
        </p>
      </section>
      <section className="py-20">
        <div className="mb-4 inline-block rounded-full border border-slate-700 bg-slate-800 px-4 py-1.5 font-bold uppercase">
          Example
        </div>
        <h2 lang="ja" className="animeRising mb-2 font-bold font-japanese text-xl sm:text-2xl">
          銀河鉄道の夜 - <span>宮沢賢治</span>
        </h2>
        <p
          lang="ja"
          className="animeRising max-w-[42rem] indent-10 font-japanese leading-normal sm:text-xl sm:leading-8"
        >
          ああそのときでした。見えない天の川のずうっと川下に青や橙やもうあらゆる光でちりばめられた十字架がまるで一本の木という風に川の中から立ってかがやきその上には青じろい雲がまるい環になって後光のようにかかっているのでした。汽車の中がまるでざわざわしました。みんなあの北の十字のときのようにまっすぐに立ってお祈りをはじめました。あっちにもこっちにも子供が瓜に飛びついたときのようなよろこびの声や何とも云いようない深いつつましいためいきの音ばかりきこえました。そしてだんだん十字架は窓の正面になりあの苹果の肉のような青じろい環の雲もゆるやかにゆるやかに繞っているのが見えました。
        </p>
      </section>
      <section className="pb-20">
        <div className="mb-4 inline-block rounded-full border border-slate-700 bg-slate-800 px-4 py-1.5 font-bold uppercase">
          Tips
        </div>
        <ol className="list-inside list-decimal text-400 marker:text-sky-400">
          <li className="animeRising mt-6 sm:text-xl">
            You can set shortcuts for browser extension to access specific features.
          </li>
          <li className="animeRising mt-6 sm:text-xl">
            You can Pin the extension on the browser bar for faster access to Popup page.
          </li>
          <li className="animeRising mt-6 sm:text-xl">
            You can see the preset rules and edit them on the Options page.
          </li>
        </ol>
      </section>
      <Link
        to={links.github}
        target="_blank"
        className="hover:-translate-y-2 mb-12 flex select-none items-center gap-2 rounded-xl border-2 border-sky-400 border-solid bg-slate-900 px-4 py-2 font-bold transition duration-300 lg:mb-15 xl:mb-20 hover:shadow-[hsla(201,80%,66%,.5)_0_0_15px_0,hsla(161,55%,49%,.5)_0_0_30px_0]"
      >
        <i className="i-mdi-github size-5" />
        View on GitHub
        <i className="i-mdi-arrow-top-right" />
      </Link>
    </div>
  );
}

import { Suspense } from "react";

import { customRules } from "@/commons/utils";

import { Transition } from "@headlessui/react";
import { Page } from "../components/Page";
import RulePage from "../components/RulePage";

export default function RuleEditor() {
  return (
    <Page title="Rule editor" icon="i-tabler-list-details">
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
          <RulePage rulesPromise={customRules.getValue()} />
        </Transition>
      </Suspense>
    </Page>
  );
}

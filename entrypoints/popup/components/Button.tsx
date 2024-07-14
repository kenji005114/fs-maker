import ToolTip from "./ToolTip";

interface ButtonProps {
  text: string;
  tip?: string;
  onClick: () => void;
}

export default function Button({ text, tip, onClick }: ButtonProps) {
  function InlineButton() {
    return (
      <button
        className="flex grow items-center justify-start gap-x-1 rounded px-2 capitalize transition-all dark:focus-visible:bg-slate-700 dark:hover:bg-slate-700 focus-visible:bg-gray-200 hover:bg-gray-200"
        onClick={onClick}
      >
        {text}
      </button>
    );
  }
  return tip ? (
    <ToolTip tip={tip}>
      <InlineButton />
    </ToolTip>
  ) : (
    <InlineButton />
  );
}

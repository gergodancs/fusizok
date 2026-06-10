import Link from "next/link";

type TermsAcceptanceCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
};

export function TermsAcceptanceCheckbox({
  checked,
  onChange,
  disabled = false,
  id = "accept-terms",
  name = "accept_terms",
}: TermsAcceptanceCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-600 bg-zinc-800/80 px-4 py-3 text-sm leading-relaxed text-zinc-300 has-[:checked]:border-amber-500/50 has-[:checked]:bg-amber-500/5"
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        value="on"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-0.5 accent-amber-500"
        required
      />
      <span>
        Elfogadom a{" "}
        <Link
          href="/aszf"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-amber-400 underline-offset-2 hover:text-amber-300 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Fusizók Általános Szerződési Feltételeit
        </Link>{" "}
        és tudomásul veszem, hogy az oldal kizárólag közvetítő platformként
        működik.
      </span>
    </label>
  );
}

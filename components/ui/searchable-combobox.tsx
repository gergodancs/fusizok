"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { inputClassName, labelClassName } from "@/lib/ui-classes";

type SearchableComboboxProps = {
  id?: string;
  label: string;
  placeholder?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  emptyMessage?: string;
  hint?: string;
};

export function SearchableCombobox({
  id,
  label,
  placeholder = "Keresés…",
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  emptyMessage = "Nincs találat.",
  hint,
}: SearchableComboboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const listboxId = `${inputId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("hu");
    if (!normalized) {
      return options;
    }
    return options.filter((option) =>
      option.toLocaleLowerCase("hu").includes(normalized),
    );
  }, [options, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        close();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [close]);

  function selectOption(option: string) {
    onChange(option);
    setQuery(option);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative space-y-2">
      <label htmlFor={inputId} className={labelClassName}>
        {label}
        {required ? " *" : ""}
      </label>

      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled}
        required={required}
        value={query}
        placeholder={disabled ? "Előbb válassz megyét…" : placeholder}
        onFocus={() => {
          if (!disabled) {
            setOpen(true);
          }
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          if (!event.target.value.trim()) {
            onChange("");
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            close();
          }
          if (event.key === "Enter" && open && filteredOptions[0]) {
            event.preventDefault();
            selectOption(filteredOptions[0]);
          }
        }}
        className={`${inputClassName} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      />

      {hint && <p className="text-xs text-zinc-500">{hint}</p>}

      {open && !disabled && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-zinc-600 bg-zinc-900 py-1 shadow-2xl shadow-black/40"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-4 py-3 text-sm text-zinc-500">{emptyMessage}</li>
          ) : (
            filteredOptions.map((option) => (
              <li key={option} role="option" aria-selected={option === value}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                  className={`flex min-h-11 w-full items-center px-4 py-2.5 text-left text-sm transition hover:bg-amber-500/10 ${
                    option === value
                      ? "bg-amber-500/15 font-semibold text-amber-300"
                      : "text-zinc-200"
                  }`}
                >
                  {option}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

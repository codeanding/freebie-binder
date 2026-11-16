"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import { Flag } from "./flag";

type Country = { code: string; name: string };

const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Country picker that filters as you type (accent-insensitive, by name or code). */
export function CountryCombobox({
  name,
  countries,
  defaultValue,
  placeholder,
  emptyText,
}: {
  name: string;
  countries: Country[];
  defaultValue?: string;
  placeholder: string;
  emptyText: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = countries.find((c) => c.code === value);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) {
      return countries;
    }
    return countries.filter((c) => normalize(c.name).includes(q) || c.code.toLowerCase() === q);
  }, [countries, query]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && open && results[active]) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function choose(c: Country) {
    setValue(c.code);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={value} required />
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2">
          {selected && !open ? <Flag code={selected.code} className="h-4" /> : <Search className="size-4 text-ink-soft" />}
        </span>
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          className="field pr-10 pl-11"
          placeholder={selected && !open ? selected.name : placeholder}
          value={open ? query : (selected?.name ?? "")}
          onFocus={() => {
            setOpen(true);
            setActive(0);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-soft" />
      </div>
      {open && (
        <ul id={listId} role="listbox" className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-line bg-card p-1.5 shadow-xl">
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-ink-soft">{emptyText}</li>
          ) : (
            results.map((c, i) => (
              <li
                key={c.code}
                role="option"
                aria-selected={c.code === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(c);
                }}
                onMouseEnter={() => setActive(i)}
                ref={(el) => {
                  if (i === active) {
                    el?.scrollIntoView({ block: "nearest" });
                  }
                }}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${i === active ? "bg-paper-deep" : ""}`}
              >
                <Flag code={c.code} className="h-4" />
                <span className="flex-1">{c.name}</span>
                {c.code === value && <Check className="size-4 text-red" />}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

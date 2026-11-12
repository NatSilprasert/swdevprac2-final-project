"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  name?: string;
  options: SelectOption[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

/** Custom dropdown. Renders a hidden input so it works inside native forms. */
export function Select({ id, name, options, defaultValue, onValueChange, className }: SelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(defaultValue ?? options[0]?.value ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  function openList() {
    setActive(
      Math.max(
        0,
        options.findIndex((option) => option.value === value)
      )
    );
    setOpen(true);
  }

  function choose(next: string) {
    setValue(next);
    setOpen(false);
    onValueChange?.(next);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") return setOpen(false);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) return openList();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((index) => (index + step + options.length) % options.length);
    }
    if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      choose(options[active].value);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)} onKeyDown={onKeyDown}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        onClick={() => (open ? setOpen(false) : openList())}
        className="form-control flex items-center justify-between gap-2 text-left"
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={cn(
            "shrink-0 text-muted-foreground transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="rise-in absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-lg border bg-card p-1 shadow-lg"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(option.value)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 text-sm",
                index === active && "bg-muted"
              )}
            >
              <span className="truncate">{option.label}</span>
              {option.value === value && (
                <Check size={16} strokeWidth={1.5} className="shrink-0 text-emerald-700" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

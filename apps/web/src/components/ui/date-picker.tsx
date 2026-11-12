"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
const SHORT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parse = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const todayIso = () => {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth(), now.getDate());
};

interface DatePickerProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  required?: boolean;
}

/** Custom calendar popover. Value is a YYYY-MM-DD string. */
export function DatePicker({ id, name, value, onChange, min, required }: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const base = value ? parse(value) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const esc = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - offset + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
  const today = todayIso();

  function toggle() {
    if (!open) {
      const base = value ? parse(value) : new Date();
      setView(new Date(base.getFullYear(), base.getMonth(), 1));
    }
    setOpen(!open);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
        className="form-control flex items-center justify-between gap-2 text-left"
      >
        <span className={cn("num truncate", !value && "text-muted-foreground/70")}>
          {value ? SHORT.format(parse(value)) : "Select date"}
        </span>
        <CalendarDays size={16} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
      </button>
      {name && <input type="hidden" name={name} value={value} />}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          required
          readOnly
          value={value}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-0 w-full opacity-0"
        />
      )}
      {open && (
        <div
          role="dialog"
          aria-label="Choose date"
          className="rise-in absolute left-0 z-50 mt-1 w-64 rounded-xl border bg-card p-3 shadow-lg"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              className="soft-button h-8 w-8 px-0"
              onClick={() => setView(new Date(year, month - 1, 1))}
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <span className="text-sm font-medium">{MONTH.format(view)}</span>
            <button
              type="button"
              aria-label="Next month"
              className="soft-button h-8 w-8 px-0"
              onClick={() => setView(new Date(year, month + 1, 1))}
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, index) => {
              if (!day) return <span key={index} />;
              const iso = toIso(year, month, day);
              const disabled = !!min && iso < min;
              const selected = iso === value;
              return (
                <button
                  key={index}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={cn(
                    "num mx-auto h-8 w-8 rounded-lg text-sm transition-colors duration-150",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted disabled:hover:bg-transparent",
                    !selected && iso === today && "font-medium text-emerald-700",
                    disabled && "cursor-not-allowed text-muted-foreground/40"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface DateRangeFieldsProps {
  idPrefix: string;
  min: string;
  defaultStart?: string;
  defaultReturn?: string;
}

/** Start and return date pickers. Return date can't be before the start date. */
export function DateRangeFields({
  idPrefix,
  min,
  defaultStart = "",
  defaultReturn = "",
}: DateRangeFieldsProps) {
  const [start, setStart] = useState(defaultStart);
  const [ret, setRet] = useState(defaultReturn);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="form-label" htmlFor={`${idPrefix}-start`}>
          Start date
        </label>
        <DatePicker
          id={`${idPrefix}-start`}
          name="startDate"
          value={start}
          min={min}
          required
          onChange={(next) => {
            setStart(next);
            if (ret && ret < next) setRet("");
          }}
        />
      </div>
      <div>
        <label className="form-label" htmlFor={`${idPrefix}-return`}>
          Return date
        </label>
        <DatePicker
          id={`${idPrefix}-return`}
          name="returnDate"
          value={ret}
          min={start && start > min ? start : min}
          required
          onChange={setRet}
        />
      </div>
    </div>
  );
}

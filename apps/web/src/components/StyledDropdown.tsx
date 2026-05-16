"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type DropdownOption = {
  value: string;
  label: string;
};

type StyledDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  label?: string;
  className?: string;
  compact?: boolean;
  align?: "left" | "right";
};

export function StyledDropdown({
  value,
  onChange,
  options,
  label = "Safidy",
  className = "",
  compact = false,
  align = "right",
}: StyledDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full appearance-none bg-white/95 border border-neutral-200 rounded-xl text-left font-black text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm hover:border-primary/30 transition-colors flex items-center pr-9 ${
          compact ? "h-10 px-3 text-xs" : "h-12 px-4 text-sm"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected?.label || value}
      </button>
      <ChevronDown
        size={14}
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none transition-transform ${
          open ? "rotate-180" : ""
        }`}
      />

      {open && (
        <div
          className={`absolute mt-2 w-full min-w-[220px] bg-white/95 backdrop-blur border border-neutral-100 rounded-2xl shadow-2xl shadow-black/10 z-30 overflow-hidden ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          <div className="px-3 py-2 text-[10px] uppercase tracking-widest font-black text-neutral-400 border-b border-neutral-100 bg-neutral-50/80">
            {label}
          </div>
          <ul role="listbox" className="max-h-64 overflow-y-auto p-1.5 space-y-1">
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors flex items-center justify-between ${
                      active
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-neutral-700 hover:bg-neutral-50 border border-transparent"
                    } ${compact ? "text-xs font-black" : "text-sm font-bold"}`}
                  >
                    <span>{opt.label}</span>
                    {active && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary">
                        <Check size={12} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

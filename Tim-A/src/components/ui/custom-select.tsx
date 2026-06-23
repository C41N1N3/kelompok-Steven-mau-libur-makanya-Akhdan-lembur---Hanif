"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  form?: string;
  defaultValue: string;
  options: string[];
};

export function CustomSelect({ name, form, defaultValue, options }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <input type="hidden" name={name} value={value} form={form} />
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-[50px] w-full items-center rounded-lg border border-[#e7d7c3] bg-[#f8f3ea] px-4 pr-11 text-left text-xl text-[#1d1c16] outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-[#c89b5b] hover:bg-white focus:border-[#c89b5b] focus:bg-white focus:shadow-[0_0_0_3px_rgba(200,155,91,0.18)]"
      >
        <span className="truncate">{value}</span>
      </button>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#6b7280] transition-transform duration-200 ease-out",
          isOpen && "rotate-180"
        )}
      />

      {isOpen && (
        <ul className="absolute left-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-[#e7d7c3] bg-white py-1 shadow-lg outline-none">
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => {
                  setValue(option);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2 text-left text-xl transition-colors duration-150 hover:bg-[#fbf6f1] hover:text-[#976c2f] focus:bg-[#fbf6f1] focus:text-[#976c2f] focus:outline-none",
                  value === option
                    ? "bg-[#976c2f] text-white hover:bg-[#976c2f] hover:text-white"
                    : "text-[#1d1c16]"
                )}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

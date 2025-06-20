import React from "react";

export function Switch({ checked, onCheckedChange, className = "" }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-[#3f51b5]" : "bg-gray-300 dark:bg-gray-700"
      } ${className}`}
      onClick={() => onCheckedChange(!checked)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") onCheckedChange(!checked);
      }}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default Switch;

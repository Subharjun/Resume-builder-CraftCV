"use client";

import { useEffect, useRef, useState } from "react";
import s from "./InlineEdit.module.css";

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function InlineEdit({ value, onChange, placeholder, multiline, className, style }: Props) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    setEditing(false);
    const newVal = ref.current?.innerText || "";
    if (newVal !== value) {
      onChange(newVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      ref.current?.blur();
    }
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={`${s.edit} ${className || ""} ${!value && !editing ? s.empty : ""}`}
      style={style}
      onFocus={() => setEditing(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
    >
      {localValue}
    </div>
  );
}

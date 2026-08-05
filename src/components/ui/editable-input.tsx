import { useState, useEffect, useRef } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";

export function EditableInput({
  value,
  onSave,
  className,
  placeholder,
  type = "text",
  onCtrlEnter,
  autoFocus,
}: {
  value: string;
  onSave: (val: string) => void;
  className?: string;
  placeholder?: string;
  type?: string;
  onCtrlEnter?: () => void;
  autoFocus?: boolean;
}) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const isDirty = localValue !== value;

  const handleSave = () => {
    if (isDirty) {
      onSave(localValue);
    }
  };

  return (
    <div className="relative flex items-center group w-full h-full">
      <input
        ref={inputRef}
        type={type}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
            if (onCtrlEnter) {
              onCtrlEnter();
            }
          } else if (e.key === "Enter") {
            handleSave();
            e.currentTarget.blur();
          }
        }}
        placeholder={placeholder}
        className={className}
      />
      {isDirty && (
        <button
          onClick={handleSave}
          className="absolute right-2 text-green-400 hover:text-green-300 p-0.5 bg-green-400/10 rounded transition-colors z-10"
          title="Save"
        >
          <CheckIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function EditableTextarea({
  value,
  onSave,
  className,
  placeholder,
  onInput,
  onCtrlEnter,
  autoFocus,
}: {
  value: string;
  onSave: (val: string) => void;
  className?: string;
  placeholder?: string;
  onInput?: React.FormEventHandler<HTMLTextAreaElement>;
  onCtrlEnter?: () => void;
  autoFocus?: boolean;
}) {
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    setLocalValue(value);
    setTimeout(adjustHeight, 10);
  }, [value]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const isDirty = localValue !== value;

  const handleSave = () => {
    if (isDirty) {
      onSave(localValue);
    }
  };

  return (
    <div className="relative flex items-start group w-full h-full">
      <textarea
        ref={textareaRef}
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value);
          adjustHeight();
        }}
        onInput={onInput}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
            if (onCtrlEnter) {
              onCtrlEnter();
            }
          } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSave();
            e.currentTarget.blur();
          }
        }}
        placeholder={placeholder}
        className={className}
      />
      {isDirty && (
        <button
          onClick={handleSave}
          className="absolute top-2 right-2 text-green-400 hover:text-green-300 p-0.5 bg-green-400/10 rounded transition-colors z-10"
          title="Save"
        >
          <CheckIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

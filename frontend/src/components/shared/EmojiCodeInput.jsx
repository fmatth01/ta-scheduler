import { useEffect, useCallback, useRef, useState } from 'react';

export const EMOJI_OPTIONS = ['🕵️', '🥸', '🦸', '🔍', '💀', '🙈', '👁️', '🥷', '🚓'];
const EMOJI_REGEX = new RegExp(
  EMOJI_OPTIONS
    .map((emoji) => emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|'),
  'gu'
);

const extractEmojis = (input = '') => {
  const matches = input.match(EMOJI_REGEX);
  return matches ? matches.slice(0, 5) : [];
};

export default function EmojiCodeInput({ value = [], onChange, disabled = false }) {
  const hiddenInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const prevValueLengthRef = useRef(value.length);

  const focusHiddenInput = useCallback(() => {
    if (disabled) return;
    hiddenInputRef.current?.focus();
  }, [disabled]);

  const handleEmojiClick = useCallback((emoji) => {
    if (disabled || value.length >= 5) return;
    const next = [...value, emoji];
    onChange(next);
    if (next.length >= 5) {
      hiddenInputRef.current?.blur();
      return;
    }
    setActiveIndex(Math.min(next.length, 4));
    focusHiddenInput();
  }, [disabled, value, onChange, focusHiddenInput]);

  const handleSlotRemove = useCallback((event, index) => {
    event.stopPropagation();
    event.preventDefault();
    if (disabled || !value[index]) return;
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
    setActiveIndex((prev) => Math.min(prev, Math.min(next.length, 4)));
  }, [disabled, value, onChange]);

  const handlePaste = useCallback((event) => {
    if (disabled) return;
    const pasted = event.clipboardData?.getData('text') ?? '';
    const emojis = extractEmojis(pasted);
    if (!emojis.length) return;
    event.preventDefault();
    onChange(emojis);
    if (emojis.length >= 5) {
      hiddenInputRef.current?.blur();
      return;
    }
    setActiveIndex(Math.min(emojis.length, 4));
    focusHiddenInput();
  }, [disabled, onChange, focusHiddenInput]);

  const handleSlotFocus = useCallback((index) => {
    if (disabled) return;
    setActiveIndex(index);
    focusHiddenInput();
  }, [disabled, focusHiddenInput]);

  const handleContainerClick = useCallback(() => {
    if (disabled) return;
    setActiveIndex(Math.min(value.length, 4));
    focusHiddenInput();
  }, [disabled, value.length, focusHiddenInput]);

  const handleHiddenInputChange = useCallback((event) => {
    // keep hidden input empty so browser paste works repeatedly
    if (event.target.value) event.target.value = '';
  }, []);

  const handleHiddenInputKeyDown = useCallback((event) => {
    if (disabled) return;
    if (event.key === 'Backspace' && value.length > 0) {
      event.preventDefault();
      onChange(value.slice(0, -1));
    }
  }, [disabled, value, onChange]);

  useEffect(() => {
    if (value.length >= 5 && document.activeElement === hiddenInputRef.current) {
      hiddenInputRef.current.blur();
    }
  }, [value.length]);

  useEffect(() => {
    const previousLength = prevValueLengthRef.current;
    if (value.length > previousLength) {
      setActiveIndex(Math.min(value.length, 4));
    } else if (value.length < previousLength || activeIndex > value.length) {
      setActiveIndex((prev) => Math.min(prev, Math.min(value.length, 4)));
    }
    prevValueLengthRef.current = value.length;
  }, [value.length, activeIndex]);

  return (
    <div
      className="flex flex-col items-center gap-4 focus:outline-none"
      role="group"
      tabIndex={disabled ? -1 : 0}
      onClick={handleContainerClick}
    >
      <input
        ref={hiddenInputRef}
        type="text"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute opacity-0 -z-10 pointer-events-none"
        onPaste={handlePaste}
        onChange={handleHiddenInputChange}
        onKeyDown={handleHiddenInputKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {/* 5 display slots */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSlotFocus(i)}
            className={`
              relative w-18 h-18 rounded-lg border-2 flex items-center justify-center text-4xl
              transition-colors cursor-text
              ${value[i]
                ? 'border-gray-300 bg-white hover:border-gray-400'
                : 'border-gray-200 bg-gray-50'
              }
              ${disabled ? 'cursor-default hover:border-gray-300 hover:bg-white' : ''}
              ${isFocused && activeIndex === i ? 'border-mint-400 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]' : ''}
            `}
          >
            {value[i]
              ? (
                <button
                  type="button"
                  className="w-full h-full flex items-center justify-center text-4xl leading-none cursor-pointer bg-transparent border-0 p-0 focus:outline-none"
                  onClick={(event) => handleSlotRemove(event, i)}
                  aria-label={`Remove emoji ${value[i]} from slot ${i + 1}`}
                >
                  {value[i]}
                </button>
              )
              : ''}
            {isFocused && activeIndex === i && (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="block h-8 w-0.5 bg-gray-500 animate-pulse" />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 9 emoji buttons in 3x3 grid */}
      {!disabled && (
        <div className="grid grid-cols-9 gap-2">
          {EMOJI_OPTIONS.map((emoji, i) => (
            <button
              key={i}
              onClick={() => handleEmojiClick(emoji)}
              disabled={value.length >= 5}
              className={`
                w-14 h-14 rounded-lg border border-gray-200 flex items-center justify-center text-4xl
                transition-colors cursor-pointer
                hover:bg-gray-100 hover:border-gray-300
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

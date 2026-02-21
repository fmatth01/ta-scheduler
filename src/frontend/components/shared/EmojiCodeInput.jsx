import { useEffect, useCallback } from 'react';

// TODO: User to confirm exact emoji set. These map to digits 1-9.
const EMOJI_OPTIONS = ['🥷', '🤠', '😂', '💀', '🙈', '😁', '👁️', '🕵️', '🌍'];

export default function EmojiCodeInput({ value = [], onChange, disabled = false }) {
  const handleEmojiClick = useCallback((emoji) => {
    if (disabled || value.length >= 5) return;
    onChange([...value, emoji]);
  }, [disabled, value, onChange]);

  const handleSlotClick = useCallback((index) => {
    if (disabled) return;
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
  }, [disabled, value, onChange]);

  useEffect(() => {
    if (disabled) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace' && value.length > 0) {
        e.preventDefault();
        onChange(value.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, value, onChange]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 5 display slots */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            onClick={() => value[i] && handleSlotClick(i)}
            disabled={disabled || !value[i]}
            className={`
              w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl
              transition-colors
              ${value[i]
                ? 'border-gray-300 bg-white cursor-pointer hover:border-red-300 hover:bg-red-50'
                : 'border-gray-200 bg-gray-50 cursor-default'
              }
              ${disabled ? 'cursor-default hover:border-gray-300 hover:bg-white' : ''}
            `}
          >
            {value[i] || ''}
          </button>
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
                w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-xl
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

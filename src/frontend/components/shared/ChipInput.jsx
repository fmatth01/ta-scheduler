import { useState } from 'react';

export default function ChipInput({ value = [], onChange, placeholder = 'Type and press Enter' }) {
  const [inputText, setInputText] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputText.trim()) {
      e.preventDefault();
      if (!value.includes(inputText.trim())) {
        onChange([...value, inputText.trim()]);
      }
      setInputText('');
    }
    if (e.key === 'Backspace' && !inputText && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeChip = (index) => {
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 border border-gray-300 rounded-lg bg-white min-h-[42px]">
      {value.map((chip, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-mint-500 text-white text-xs font-medium"
        >
          {chip}
          <button
            onClick={() => removeChip(i)}
            className="hover:bg-mint-600 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
          >
            &times;
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[80px] outline-none text-sm py-1 bg-transparent"
      />
    </div>
  );
}

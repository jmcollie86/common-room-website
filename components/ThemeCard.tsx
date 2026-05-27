import { Database } from '@/lib/database.types';
import { Colors } from '@/constants/theme';

type AdoptTheme = Database['public']['Tables']['adopt_themes']['Row'];

interface ThemeCardProps {
  theme: AdoptTheme;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
  onInfo: () => void;
}

export function ThemeCard({ theme, selected, disabled, onSelect, onInfo }: ThemeCardProps) {
  const categoryBg = theme.category_colour ?? Colors.background;

  return (
    <div
      className="relative mb-2.5 rounded-xl overflow-hidden transition-all"
      style={{
        border: `2px solid ${selected ? Colors.accent : 'transparent'}`,
        opacity: disabled ? 0.38 : 1,
      }}
    >
      {/* Category colour wash */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: categoryBg, opacity: 0.25 }}
        aria-hidden
      />

      <div className="relative flex items-center px-3.5 py-3.5 min-h-[64px]">
        {/* Checkbox */}
        <button
          onClick={onSelect}
          disabled={disabled}
          aria-checked={selected}
          aria-label={`Select ${theme.theme}`}
          className="shrink-0 w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center mr-3 transition-colors"
          style={{
            borderColor: selected ? Colors.accent : Colors.subtext,
            backgroundColor: selected ? Colors.accent : 'transparent',
          }}
        >
          {selected && (
            <span className="text-white text-xs font-bold leading-none">✓</span>
          )}
        </button>

        {/* Text — clicks the whole row to select */}
        <button
          onClick={onSelect}
          disabled={disabled}
          className="flex-1 text-left mr-1"
        >
          <p className="font-georgia text-base text-ink leading-[22px]">
            {theme.theme}
          </p>
          {theme.description && (
            <p className="text-xs text-subtext mt-0.5 leading-[18px]">
              {theme.description}
            </p>
          )}
        </button>

        {/* Info button */}
        <button
          onClick={(e) => { e.stopPropagation(); onInfo(); }}
          aria-label={`More information about ${theme.theme}`}
          className="shrink-0 w-11 h-11 flex items-center justify-center"
        >
          <span
            className="flex items-center justify-center w-[26px] h-[26px] rounded-full border-[1.5px] text-xs font-semibold"
            style={{ borderColor: Colors.primary + '60', color: Colors.primary }}
          >
            i
          </span>
        </button>
      </div>
    </div>
  );
}

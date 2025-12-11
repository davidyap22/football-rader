import type { SignalType } from '@/types/market';

export function getSignalType(signal: string | null | undefined): SignalType {
  if (!signal) return 'none';
  if (signal.includes('🟢') || signal.includes('进场')) return 'entry';
  if (signal.includes('🔥') || signal.includes('倍投')) return 'fire';
  if (signal.includes('🟡') || signal.includes('观望')) return 'wait';
  if (signal.includes('🔵') || signal.includes('持有')) return 'hold';
  return 'none';
}

export function getSignalColors(type: SignalType) {
  switch (type) {
    case 'entry':
      return {
        bg: 'bg-signal-entry-bg',
        border: 'border-signal-entry',
        text: 'text-signal-entry',
        glow: 'shadow-[0_0_20px_hsl(var(--signal-entry)/0.3)]',
      };
    case 'fire':
      return {
        bg: 'bg-signal-fire-bg',
        border: 'border-signal-fire',
        text: 'text-signal-fire',
        glow: 'shadow-[0_0_20px_hsl(var(--signal-fire)/0.3)]',
      };
    case 'wait':
      return {
        bg: 'bg-signal-wait-bg',
        border: 'border-signal-wait',
        text: 'text-signal-wait',
        glow: 'shadow-[0_0_20px_hsl(var(--signal-wait)/0.3)]',
      };
    case 'hold':
      return {
        bg: 'bg-signal-hold-bg',
        border: 'border-signal-hold',
        text: 'text-signal-hold',
        glow: 'shadow-[0_0_20px_hsl(var(--signal-hold)/0.3)]',
      };
    default:
      return {
        bg: 'bg-card',
        border: 'border-border',
        text: 'text-muted-foreground',
        glow: '',
      };
  }
}

export function parseSignalText(signal: string | null | undefined): { emoji: string; text: string } {
  if (!signal) return { emoji: '', text: '' };
  const emojiMatch = signal.match(/^(🟢|🔥|🟡|🔵)/);
  const emoji = emojiMatch ? emojiMatch[1] : '';
  const text = signal.replace(/^(🟢|🔥|🟡|🔵)\s*/, '').trim();
  return { emoji, text };
}

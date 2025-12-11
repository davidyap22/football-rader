import { cn } from '@/lib/utils';
import type { MarketTab, HandicapData, OverUnderData, MoneylineData } from '@/types/market';

interface MarketTabsProps {
  activeTab: MarketTab;
  onTabChange: (tab: MarketTab) => void;
  handicapData: HandicapData | undefined;
  overUnderData: OverUnderData | undefined;
  moneylineData: MoneylineData | undefined;
}

const tabs: { id: MarketTab; label: string }[] = [
  { id: 'handicap', label: 'Handicap' },
  { id: 'overunder', label: 'O/U' },
  { id: '1x2', label: '1x2' },
];

export function MarketTabs({
  activeTab,
  onTabChange,
  handicapData,
  overUnderData,
  moneylineData,
}: MarketTabsProps) {
  return (
    <div className="bg-card rounded-lg overflow-hidden glow-card">
      {/* Tab Headers */}
      <div className="flex border-b border-border/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 py-3 text-sm font-semibold transition-all duration-300',
              activeTab === tab.id
                ? 'bg-muted text-primary'
                : 'text-muted-foreground hover:text-accent active:text-accent'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'handicap' && handicapData && (
          <HandicapContent data={handicapData} />
        )}
        {activeTab === 'overunder' && overUnderData && (
          <OverUnderContent data={overUnderData} />
        )}
        {activeTab === '1x2' && moneylineData && (
          <MoneylineContent data={moneylineData} />
        )}
      </div>
    </div>
  );
}

function HandicapContent({ data }: { data: HandicapData }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground">Line:</span>
        <span className="font-mono text-xl font-bold text-primary">{data.handicap}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <OddsCard label="Home" value={data.home_odds} />
        <OddsCard label="Away" value={data.away_odds} />
      </div>
    </div>
  );
}

function OverUnderContent({ data }: { data: OverUnderData }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground">Line:</span>
        <span className="font-mono text-xl font-bold text-primary">{data.handicap}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <OddsCard label="Over" value={data.over_odds} />
        <OddsCard label="Under" value={data.under_odds} />
      </div>
    </div>
  );
}

function MoneylineContent({ data }: { data: MoneylineData }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <OddsCard label="Home" value={data.home_odds} />
      <OddsCard label="Draw" value={data.draw_odds} />
      <OddsCard label="Away" value={data.away_odds} />
    </div>
  );
}

function OddsCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-lg p-3 text-center transition-all duration-300 hover:bg-muted/80 active:bg-muted/80 group">
      <p className="text-xs text-muted-foreground mb-1 group-hover:text-accent group-active:text-accent transition-colors">{label}</p>
      <p className="font-mono text-xl font-bold text-odds group-hover:text-primary group-active:text-primary transition-colors">{value}</p>
    </div>
  );
}

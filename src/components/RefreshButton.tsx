import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface RefreshButtonProps {
  onClick: () => void;
  isRefreshing: boolean;
}

export function RefreshButton({ onClick, isRefreshing }: RefreshButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={isRefreshing}
      className="gap-2 transition-all duration-300 hover:border-accent hover:text-accent hover:shadow-[0_0_15px_hsl(190,100%,50%,0.4)] active:border-primary active:text-primary active:shadow-[0_0_15px_hsl(45,100%,50%,0.4)]"
    >
      <RefreshCw
        className={cn(
          'w-4 h-4',
          isRefreshing && 'animate-spin'
        )}
      />
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
    </Button>
  );
}

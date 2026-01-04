import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, XSquare, DollarSign, Trash2, Download, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BulkActionsProps {
  selectedCount: number;
  onMarkSold: () => void;
  onMarkAvailable: () => void;
  onDelete: () => void;
  onExport: () => void;
  onClearSelection: () => void;
  loading?: boolean;
}

export function BulkActions({
  selectedCount,
  onMarkSold,
  onMarkAvailable,
  onDelete,
  onExport,
  onClearSelection,
  loading = false,
}: BulkActionsProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95vw] max-w-2xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl">
            <div className="flex items-center gap-2 sm:gap-3">
              <Badge variant="secondary" className="h-8 px-3 text-sm font-medium">
                <CheckSquare className="h-4 w-4 mr-1.5" />
                {selectedCount} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-8 text-xs text-muted-foreground"
              >
                <XSquare className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onMarkSold}
                disabled={loading}
                className="h-8 text-xs gap-1.5"
              >
                <DollarSign className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mark Sold</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onMarkAvailable}
                disabled={loading}
                className="h-8 text-xs gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mark Available</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onExport}
                disabled={loading}
                className="h-8 text-xs gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={onDelete}
                disabled={loading}
                className="h-8 text-xs gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

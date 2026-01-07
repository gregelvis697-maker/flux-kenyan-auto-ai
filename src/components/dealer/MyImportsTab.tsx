import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Package, Truck, Ship, FileCheck, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImportItem {
  id: string;
  make: string;
  model: string;
  year: number;
  specs: string;
  budget: number;
  status: string;
  created_at: string;
  accepted_at: string | null;
  delivered_at: string | null;
}

interface MyImportsTabProps {
  onUpdate: () => void;
}

const STATUS_STEPS = [
  { key: 'accepted', label: 'Accepted', icon: CheckCircle },
  { key: 'in_transit', label: 'In Transit', icon: Ship },
  { key: 'cleared', label: 'Cleared', icon: FileCheck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
];

export function MyImportsTab({ onUpdate }: MyImportsTabProps) {
  const { toast } = useToast();
  const [imports, setImports] = useState<ImportItem[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchImports();
  }, []);

  const fetchImports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('dealer_import_requests')
        .select('*')
        .eq('dealer_id', user.id)
        .in('status', ['accepted', 'in_transit', 'cleared', 'delivered'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImports(data || []);
    } catch (error) {
      console.error('Error fetching imports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load imports',
        variant: 'destructive',
      });
    }
  };

  const handleMarkReceived = async (importId: string) => {
    setLoading(importId);
    try {
      const { error } = await supabase
        .from('dealer_import_requests')
        .update({ status: 'received' })
        .eq('id', importId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Import marked as received. You can now add it to your inventory.',
      });

      fetchImports();
      onUpdate();
    } catch (error) {
      console.error('Error marking as received:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark import as received',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const getStatusIndex = (status: string) => {
    const index = STATUS_STEPS.findIndex(step => step.key === status);
    return index === -1 ? 0 : index;
  };

  const getProgressPercentage = (status: string) => {
    const index = getStatusIndex(status);
    return ((index + 1) / STATUS_STEPS.length) * 100;
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; glow: string }> = {
      accepted: { bg: 'bg-primary/20', text: 'text-primary', glow: 'shadow-[0_0_10px_hsl(var(--primary)/0.3)]' },
      in_transit: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', glow: 'shadow-[0_0_10px_rgba(234,179,8,0.3)]' },
      cleared: { bg: 'bg-purple-500/20', text: 'text-purple-400', glow: 'shadow-[0_0_10px_rgba(168,85,247,0.3)]' },
      delivered: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]' },
    };
    return configs[status] || { bg: 'bg-muted', text: 'text-muted-foreground', glow: '' };
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-foreground">Approved Imports</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Track imports that have been accepted by importers
        </p>
      </div>

      {/* Import Cards */}
      {imports.length === 0 ? (
        <Card className="p-8 sm:p-12 bg-card/20 backdrop-blur-sm border-border/30 text-center">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No approved imports yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Your accepted import requests will appear here
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {imports.map((item) => {
            const statusConfig = getStatusConfig(item.status);
            const currentStepIndex = getStatusIndex(item.status);
            
            return (
              <Card 
                key={item.id} 
                className={`p-4 sm:p-6 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 transition-all ${statusConfig.glow}`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {item.year} {item.make} {item.model}
                      </h4>
                      <p className="text-sm text-primary font-medium">
                        ${item.budget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0 self-start sm:self-auto`}>
                    {item.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <Progress 
                    value={getProgressPercentage(item.status)} 
                    className="h-2 bg-muted/30"
                  />
                </div>

                {/* Progress Steps */}
                <div className="grid grid-cols-4 gap-1 sm:gap-2 mb-4">
                  {STATUS_STEPS.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    
                    return (
                      <div 
                        key={step.key} 
                        className={`flex flex-col items-center text-center ${
                          isCompleted ? 'text-primary' : 'text-muted-foreground/50'
                        }`}
                      >
                        <div className={`
                          p-1.5 sm:p-2 rounded-full mb-1 transition-all
                          ${isCurrent 
                            ? 'bg-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-background' 
                            : isCompleted 
                              ? 'bg-primary/10' 
                              : 'bg-muted/20'
                          }
                        `}>
                          <StepIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${isCompleted ? 'text-primary' : 'text-muted-foreground/50'}`} />
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium leading-tight">
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/30">
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(item.created_at).toLocaleDateString()}
                    {item.accepted_at && (
                      <span className="ml-2">
                        • Accepted: {new Date(item.accepted_at).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                  
                  {item.status === 'delivered' && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkReceived(item.id)}
                      disabled={loading === item.id}
                      className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {loading === item.id ? 'Processing...' : 'Mark as Received'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
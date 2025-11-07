import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ImportItem {
  id: string;
  make: string;
  model: string;
  year: number;
  specs: string;
  budget: number;
  status: string;
  created_at: string;
}

interface MyImportsTabProps {
  onUpdate: () => void;
}

export function MyImportsTab({ onUpdate }: MyImportsTabProps) {
  const { toast } = useToast();
  const [imports, setImports] = useState<ImportItem[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchImports();
  }, []);

  const fetchImports = async () => {
    try {
      const { data, error } = await supabase
        .from('dealer_import_requests')
        .select('*')
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      accepted: 'bg-green-500/20 text-green-400 border-green-500/50',
      in_transit: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      cleared: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Approved Imports</h3>
        <p className="text-sm text-muted-foreground">
          Track imports that have been accepted by importers
        </p>
      </div>

      <div className="rounded-lg border border-border/50 bg-card/20 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No approved imports yet
                </TableCell>
              </TableRow>
            ) : (
              imports.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.make} {item.model}
                  </TableCell>
                  <TableCell>{item.year}</TableCell>
                  <TableCell>${item.budget.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.status === 'delivered' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkReceived(item.id)}
                        disabled={loading === item.id}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {loading === item.id ? 'Processing...' : 'Mark Received'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

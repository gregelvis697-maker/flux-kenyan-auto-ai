import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Send, X, Calendar, DollarSign, Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImportRequest {
  id: string;
  make: string;
  model: string;
  year: number;
  specs: string;
  budget: number;
  status: string;
  created_at: string;
}

interface ImportRequestsTabProps {
  onUpdate: () => void;
}

export function ImportRequestsTab({ onUpdate }: ImportRequestsTabProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState<ImportRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    specs: '',
    budget: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('dealer_import_requests')
        .select('*')
        .eq('dealer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load import requests',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('dealer_import_requests').insert({
        dealer_id: user.id,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        specs: formData.specs,
        budget: parseFloat(formData.budget),
        status: 'requested',
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Import request submitted successfully',
      });

      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        specs: '',
        budget: '',
      });
      setShowForm(false);
      fetchRequests();
      onUpdate();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit import request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; label: string }> = {
      requested: { bg: 'bg-muted/50', text: 'text-muted-foreground', label: 'Requested' },
      accepted: { bg: 'bg-primary/20', text: 'text-primary', label: 'Accepted' },
      in_transit: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'In Transit' },
      cleared: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Cleared' },
      delivered: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Delivered' },
      received: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Received' },
      cancelled: { bg: 'bg-destructive/20', text: 'text-destructive', label: 'Cancelled' },
    };
    return configs[status] || { bg: 'bg-muted', text: 'text-muted-foreground', label: status };
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">My Import Requests</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Create and track your vehicle import requests
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all"
        >
          {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showForm ? 'Cancel' : 'New Request'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-4 sm:p-6 bg-card/40 backdrop-blur-sm border-border/50 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make" className="text-sm">Make *</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  required
                  placeholder="e.g., Toyota"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model" className="text-sm">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  placeholder="e.g., Land Cruiser"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm">Budget ($) *</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  required
                  placeholder="50000"
                  step="0.01"
                  className="bg-background/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specs" className="text-sm">Specifications</Label>
              <Textarea
                id="specs"
                value={formData.specs}
                onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                placeholder="Describe desired specs, features, condition..."
                rows={3}
                className="bg-background/50 resize-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowForm(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Requests List - Mobile Cards */}
      <div className="block sm:hidden space-y-3">
        {requests.length === 0 ? (
          <Card className="p-8 bg-card/20 backdrop-blur-sm border-border/30 text-center">
            <Car className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No import requests yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Create one to get started!</p>
          </Card>
        ) : (
          requests.map((request) => {
            const statusConfig = getStatusConfig(request.status);
            return (
              <Card 
                key={request.id} 
                className="p-4 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {request.make} {request.model}
                    </h4>
                    <p className="text-sm text-muted-foreground">{request.year}</p>
                  </div>
                  <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0`}>
                    {statusConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-primary">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span className="font-medium">${request.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Requests Table - Desktop */}
      <div className="hidden sm:block rounded-lg border border-border/30 bg-card/20 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30 bg-muted/20">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Year
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Budget
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Car className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                    No import requests yet. Create one to get started!
                  </td>
                </tr>
              ) : (
                requests.map((request) => {
                  const statusConfig = getStatusConfig(request.status);
                  return (
                    <tr 
                      key={request.id} 
                      className="hover:bg-muted/10 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">
                          {request.make} {request.model}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {request.year}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-primary font-medium">
                          ${request.budget.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0`}>
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mail, Save, Eye, RefreshCw, Car, Ship, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface EmailTemplate {
  id: string;
  template_type: string;
  subject: string;
  body_html: string;
  updated_at: string;
}

const templateConfig: Record<string, { label: string; icon: typeof Mail; description: string; color: string }> = {
  'approval': { label: 'Generic Approval', icon: CheckCircle, description: 'Default approval email for all roles', color: 'bg-green-500/20 text-green-600' },
  'rejection': { label: 'Generic Rejection', icon: XCircle, description: 'Default rejection email for all roles', color: 'bg-red-500/20 text-red-600' },
  'dealer_approval': { label: 'Dealer Approval', icon: Car, description: 'Approval email for dealer accounts', color: 'bg-blue-500/20 text-blue-600' },
  'dealer_rejection': { label: 'Dealer Rejection', icon: Car, description: 'Rejection email for dealer applications', color: 'bg-blue-500/20 text-blue-600' },
  'importer_approval': { label: 'Importer Approval', icon: Ship, description: 'Approval email for importer accounts', color: 'bg-emerald-500/20 text-emerald-600' },
  'importer_rejection': { label: 'Importer Rejection', icon: Ship, description: 'Rejection email for importer applications', color: 'bg-emerald-500/20 text-emerald-600' },
};

export function EmailTemplatesPanel() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedTemplates, setEditedTemplates] = useState<Record<string, { subject: string; body_html: string }>>({});
  const [previewHtml, setPreviewHtml] = useState('');
  const [activeCategory, setActiveCategory] = useState('dealer');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('template_type');

    if (error) {
      toast.error('Failed to load email templates');
      console.error('Error fetching templates:', error);
    } else {
      setTemplates(data || []);
      const edits: Record<string, { subject: string; body_html: string }> = {};
      data?.forEach(t => {
        edits[t.template_type] = { subject: t.subject, body_html: t.body_html };
      });
      setEditedTemplates(edits);
    }
    setLoading(false);
  };

  const handleSave = async (templateType: string) => {
    setSaving(true);
    const edited = editedTemplates[templateType];
    if (!edited) return;

    const { error } = await supabase
      .from('email_templates')
      .update({
        subject: edited.subject,
        body_html: edited.body_html,
      })
      .eq('template_type', templateType);

    if (error) {
      toast.error('Failed to save template');
      console.error('Error saving template:', error);
    } else {
      toast.success('Template saved successfully');
      fetchTemplates();
    }
    setSaving(false);
  };

  const handlePreview = (templateType: string) => {
    const edited = editedTemplates[templateType];
    if (!edited) return;

    let html = edited.body_html
      .replace(/\{\{name\}\}/g, 'John Doe')
      .replace(/\{\{role\}\}/g, templateType.includes('dealer') ? 'Dealer' : templateType.includes('importer') ? 'Importer' : 'User')
      .replace(/\{\{reason\}\}/g, 'Your documentation was incomplete. Please resubmit with valid business license.')
      .replace(/\{\{login_url\}\}/g, window.location.origin + '/auth');

    setPreviewHtml(html);
  };

  const updateTemplate = (templateType: string, field: 'subject' | 'body_html', value: string) => {
    setEditedTemplates(prev => ({
      ...prev,
      [templateType]: {
        ...prev[templateType],
        [field]: value
      }
    }));
  };

  const getTemplatesByCategory = (category: string) => {
    if (category === 'generic') {
      return templates.filter(t => t.template_type === 'approval' || t.template_type === 'rejection');
    }
    return templates.filter(t => t.template_type.startsWith(category));
  };

  const renderTemplateCard = (template: EmailTemplate) => {
    const config = templateConfig[template.template_type] || { 
      label: template.template_type, 
      icon: Mail, 
      description: 'Email template',
      color: 'bg-gray-500/20 text-gray-600'
    };
    const Icon = config.icon;
    const isApproval = template.template_type.includes('approval');

    return (
      <Card key={template.template_type} className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{config.label}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </div>
            </div>
            <Badge variant={isApproval ? 'default' : 'destructive'} className="capitalize">
              {isApproval ? 'Approval' : 'Rejection'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`subject-${template.template_type}`}>Subject Line</Label>
            <Input
              id={`subject-${template.template_type}`}
              value={editedTemplates[template.template_type]?.subject || ''}
              onChange={(e) => updateTemplate(template.template_type, 'subject', e.target.value)}
              placeholder="Email subject..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`body-${template.template_type}`}>Email Body (HTML)</Label>
            <Textarea
              id={`body-${template.template_type}`}
              value={editedTemplates[template.template_type]?.body_html || ''}
              onChange={(e) => updateTemplate(template.template_type, 'body_html', e.target.value)}
              placeholder="Email HTML content..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleSave(template.template_type)}
              disabled={saving}
              className="gap-2"
              size="sm"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => handlePreview(template.template_type)}
                  className="gap-2"
                  size="sm"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>Email Preview - {config.label}</DialogTitle>
                </DialogHeader>
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-[500px] bg-white"
                    title="Email Preview"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(template.updated_at).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Email Templates</h3>
          <p className="text-sm text-muted-foreground">
            Customize role-specific emails. Variables: {"{{name}}"}, {"{{role}}"}, {"{{reason}}"}, {"{{login_url}}"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTemplates} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dealer" className="gap-2">
            <Car className="h-4 w-4" />
            Dealer Templates
          </TabsTrigger>
          <TabsTrigger value="importer" className="gap-2">
            <Ship className="h-4 w-4" />
            Importer Templates
          </TabsTrigger>
          <TabsTrigger value="generic" className="gap-2">
            <Mail className="h-4 w-4" />
            Generic Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dealer" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {getTemplatesByCategory('dealer').map(renderTemplateCard)}
          </div>
          {getTemplatesByCategory('dealer').length === 0 && (
            <p className="text-center text-muted-foreground py-8">No dealer templates found</p>
          )}
        </TabsContent>

        <TabsContent value="importer" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {getTemplatesByCategory('importer').map(renderTemplateCard)}
          </div>
          {getTemplatesByCategory('importer').length === 0 && (
            <p className="text-center text-muted-foreground py-8">No importer templates found</p>
          )}
        </TabsContent>

        <TabsContent value="generic" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {getTemplatesByCategory('generic').map(renderTemplateCard)}
          </div>
          {getTemplatesByCategory('generic').length === 0 && (
            <p className="text-center text-muted-foreground py-8">No generic templates found</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Mail, Save, Eye, RefreshCw } from 'lucide-react';
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

export function EmailTemplatesPanel() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedTemplates, setEditedTemplates] = useState<Record<string, { subject: string; body_html: string }>>({});
  const [previewHtml, setPreviewHtml] = useState('');

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
      .replace(/\{\{role\}\}/g, 'Dealer')
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
            Customize the emails sent to users. Use variables: {"{{name}}"}, {"{{role}}"}, {"{{reason}}"}, {"{{login_url}}"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="approval" className="w-full">
        <TabsList>
          <TabsTrigger value="approval" className="gap-2">
            <Mail className="h-4 w-4" />
            Approval Email
          </TabsTrigger>
          <TabsTrigger value="rejection" className="gap-2">
            <Mail className="h-4 w-4" />
            Rejection Email
          </TabsTrigger>
        </TabsList>

        {templates.map(template => (
          <TabsContent key={template.template_type} value={template.template_type}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{template.template_type} Email Template</CardTitle>
                <CardDescription>
                  Last updated: {new Date(template.updated_at).toLocaleString()}
                </CardDescription>
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
                    className="min-h-[300px] font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSave(template.template_type)}
                    disabled={saving}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Template
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => handlePreview(template.template_type)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                      <DialogHeader>
                        <DialogTitle>Email Preview</DialogTitle>
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
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

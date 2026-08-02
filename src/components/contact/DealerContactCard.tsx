import { MessageCircle, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ContactUtils, type DealerContact, type VehicleInfo } from '@/utils/contactUtils';

interface DealerContactCardProps {
  dealerName?: string | null;
  contact: DealerContact | null | undefined;
  vehicle?: VehicleInfo | null;
  /** `full` = labelled buttons + contact details, `compact` = small inline buttons */
  variant?: 'full' | 'compact';
  className?: string;
}

export function DealerContactCard({
  dealerName,
  contact,
  vehicle,
  variant = 'full',
  className,
}: DealerContactCardProps) {
  const active = ContactUtils.getActiveContactMethods(contact);
  if (!contact || active.length === 0) return null;

  const whatsappHref = ContactUtils.generateWhatsAppLink(
    contact.whatsappNumber,
    ContactUtils.generateVehicleInquiryMessage(vehicle)
  );
  const phoneHref = ContactUtils.generatePhoneLink(contact.phoneNumber);
  const emailHref = ContactUtils.generateEmailLink(
    contact.emailPublic,
    ContactUtils.generateEmailSubject(vehicle),
    ContactUtils.generateEmailBody(vehicle)
  );

  const isCompact = variant === 'compact';
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const buttons = (
    <div
      className={cn(
        'flex gap-2',
        isCompact ? 'flex-row flex-wrap' : 'flex-col sm:flex-row'
      )}
    >
      {active.includes('whatsapp') && (
        <Button
          asChild
          size={isCompact ? 'sm' : 'default'}
          className={cn('gap-2', isCompact ? '' : 'flex-1 h-11')}
        >
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={stop}>
            <MessageCircle className={isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            {isCompact ? 'Chat' : 'WhatsApp'}
          </a>
        </Button>
      )}

      {active.includes('phone') && (
        <Button
          asChild
          variant="outline"
          size={isCompact ? 'sm' : 'default'}
          className={cn('gap-2', isCompact ? '' : 'flex-1 h-11')}
        >
          <a href={phoneHref} onClick={stop}>
            <Phone className={isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            Call
          </a>
        </Button>
      )}

      {active.includes('email') && (
        <Button
          asChild
          variant="outline"
          size={isCompact ? 'sm' : 'default'}
          className={cn('gap-2', isCompact ? '' : 'flex-1 h-11')}
        >
          <a href={emailHref} onClick={stop}>
            <Mail className={isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            Email
          </a>
        </Button>
      )}
    </div>
  );

  if (isCompact) {
    return <div className={cn('mt-2', className)}>{buttons}</div>;
  }

  return (
    <Card className={cn('bg-card/60 border-border/50', className)}>
      <CardContent className="p-5 space-y-4">
        <h3 className="font-semibold text-foreground">
          Contact {dealerName || 'this dealer'}
        </h3>

        {buttons}

        <div className="space-y-1 text-xs text-muted-foreground">
          {active.includes('whatsapp') && (
            <p>WhatsApp: {ContactUtils.formatPhoneNumber(contact.whatsappNumber)}</p>
          )}
          {active.includes('phone') && (
            <p>Phone: {ContactUtils.formatPhoneNumber(contact.phoneNumber)}</p>
          )}
          {active.includes('email') && <p className="break-all">Email: {contact.emailPublic}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

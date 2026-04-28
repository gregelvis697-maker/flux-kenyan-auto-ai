import { MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isCallForPrice } from '@/lib/vehicle-display';

interface MobileStickyBarProps {
  price: number;
  priceOnRequest?: boolean | null;
  onWhatsAppClick: () => void;
}

export function MobileStickyBar({ price, priceOnRequest, onWhatsAppClick }: MobileStickyBarProps) {
  const callForPrice = isCallForPrice({ price, price_on_request: priceOnRequest });

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] px-4 py-3">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        <div>
          {callForPrice ? (
            <p className="text-base font-bold text-primary flex items-center gap-1.5">
              <Phone className="h-4 w-4" />
              Call for Price
            </p>
          ) : (
            <p className="text-lg font-bold text-primary">
              KES {price.toLocaleString()}
            </p>
          )}
        </div>
        <Button
          className="h-11 px-6 text-sm font-semibold gap-2 flex-shrink-0"
          style={{ backgroundColor: '#25D366', color: 'white' }}
          onClick={onWhatsAppClick}
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </Button>
      </div>
    </div>
  );
}

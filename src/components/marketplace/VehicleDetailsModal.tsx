import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Car, Fuel, Settings, Gauge, Palette, Calendar, 
  DollarSign, Phone, Mail, ChevronLeft, ChevronRight,
  Share2, Copy, Facebook, Twitter, Linkedin, Check
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface VehicleDetails {
  id: string;
  make: string;
  model: string;
  year: number;
  condition: string;
  fuel_type: string;
  engine_capacity: string;
  mileage: number | null;
  color: string | null;
  transmission: string | null;
  description: string | null;
  price: number;
  negotiable: boolean;
  photos: string[] | null;
  dealer_id: string;
  dealer_name?: string;
  dealer_email?: string;
}

interface VehicleDetailsModalProps {
  vehicle: VehicleDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestContact?: () => void;
}

export function VehicleDetailsModal({ vehicle, open, onOpenChange, onRequestContact }: VehicleDetailsModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  if (!vehicle) return null;

  const photos = vehicle.photos || [];
  const hasPhotos = photos.length > 0;

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const getShareUrl = () => {
    return `${window.location.origin}/marketplace?vehicle=${vehicle.id}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Vehicle link copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleShareSocial = (platform: 'facebook' | 'twitter' | 'linkedin') => {
    const shareUrl = getShareUrl();
    const text = `Check out this ${vehicle.year} ${vehicle.make} ${vehicle.model} for ${formatPrice(vehicle.price)}!`;
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      new: 'New',
      used: 'Used',
      certified_pre_owned: 'Certified Pre-Owned',
    };
    return labels[condition] || condition;
  };

  const getFuelLabel = (fuel: string) => {
    const labels: Record<string, string> = {
      petrol: 'Petrol',
      diesel: 'Diesel',
      electric: 'Electric',
      hybrid: 'Hybrid',
      plug_in_hybrid: 'Plug-in Hybrid',
    };
    return labels[fuel] || fuel;
  };

  const specs = [
    { icon: Calendar, label: 'Year', value: vehicle.year.toString() },
    { icon: Fuel, label: 'Fuel Type', value: getFuelLabel(vehicle.fuel_type) },
    { icon: Settings, label: 'Transmission', value: vehicle.transmission || 'N/A' },
    { icon: Car, label: 'Engine', value: vehicle.engine_capacity },
    { icon: Gauge, label: 'Mileage', value: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : 'N/A' },
    { icon: Palette, label: 'Color', value: vehicle.color || 'N/A' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-card border-border">
        {/* Photo Gallery */}
        <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-muted/30 to-muted/10">
          {hasPhotos ? (
            <>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhotoIndex}
                  src={photos[currentPhotoIndex]}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </AnimatePresence>
              
              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={prevPhoto}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={nextPhoto}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  
                  {/* Thumbnails */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {photos.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPhotoIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === currentPhotoIndex ? 'bg-primary' : 'bg-background/60'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              
              <Badge className="absolute top-4 left-4 bg-background/80">
                {currentPhotoIndex + 1} / {photos.length}
              </Badge>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car className="h-20 w-20 text-muted-foreground/30" />
            </div>
          )}
          
          <Badge variant="outline" className="absolute top-4 right-4 bg-background/80">
            {getConditionLabel(vehicle.condition)}
          </Badge>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl sm:text-3xl font-bold text-foreground">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-left sm:text-right">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{formatPrice(vehicle.price)}</p>
                {vehicle.negotiable && (
                  <p className="text-sm text-muted-foreground">Price negotiable</p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShareSocial('facebook')} className="gap-2">
                    <Facebook className="h-4 w-4" />
                    Share on Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShareSocial('twitter')} className="gap-2">
                    <Twitter className="h-4 w-4" />
                    Share on Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShareSocial('linkedin')} className="gap-2">
                    <Linkedin className="h-4 w-4" />
                    Share on LinkedIn
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Separator />

          {/* Specifications */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <spec.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{spec.label}</p>
                    <p className="text-sm font-medium text-foreground capitalize">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {vehicle.description && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{vehicle.description}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Dealer Contact */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Contact Dealer</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {vehicle.dealer_email && (
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={() => window.location.href = `mailto:${vehicle.dealer_email}?subject=Inquiry about ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                >
                  <Mail className="h-4 w-4" />
                  {vehicle.dealer_email}
                </Button>
              )}
              {user && onRequestContact && (
                <Button 
                  className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                  onClick={onRequestContact}
                >
                  <Phone className="h-4 w-4" />
                  Request Contact
                </Button>
              )}
              {!user && (
                <Button 
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => window.location.href = '/auth'}
                >
                  <Phone className="h-4 w-4" />
                  Login to Contact
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

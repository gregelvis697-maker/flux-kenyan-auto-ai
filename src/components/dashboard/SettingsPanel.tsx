import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, User, Mail, Shield, MapPin } from 'lucide-react';
import { GeocodingService } from '@/services/geocodingService';
import { DealerLocationMap } from '@/components/maps/DealerLocationMap';
import { DealerLocationsCard } from '@/components/dashboard/DealerLocationsCard';
import { DealerSettingsContact } from '@/components/dealer/DealerSettingsContact';


interface ProfileData {
  full_name: string | null;
  email: string;
  phone_number?: string | null;
  street_address?: string | null;
  city?: string | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
}

export function SettingsPanel() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone_number: '',
    street_address: '',
    city: '',
    location_latitude: null,
    location_longitude: null,
  });

  const isDealer = userRole === 'dealer';

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, street_address, city, location_latitude, location_longitude')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setProfile({
        full_name: data?.full_name || '',
        email: data?.email || user.email || '',
        phone_number: '',
        street_address: data?.street_address || '',
        city: data?.city || '',
        location_latitude: data?.location_latitude ?? null,
        location_longitude: data?.location_longitude ?? null,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile({
        full_name: '',
        email: user.email || '',
        phone_number: '',
        street_address: '',
        city: '',
        location_latitude: null,
        location_longitude: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      if (error) throw error;
      toast({ title: '✅ Settings Saved', description: 'Your profile has been updated successfully.' });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({ title: 'Error', description: error.message || 'Failed to save settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!user) return;
    setGeoError(null);
    const street = (profile.street_address || '').trim();
    const city = (profile.city || '').trim();
    if (!street || !city) {
      setGeoError('Please enter both street address and city.');
      return;
    }

    setGeocoding(true);
    try {
      const full = GeocodingService.formatAddress(street, city);
      const result = await GeocodingService.geocodeAddress(full);

      if (!result.success) {
        await supabase
          .from('profiles')
          .update({
            street_address: street,
            city,
            location_geocode_error: result.error ?? 'Unknown geocoding error',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
        setGeoError(result.error || 'Failed to locate that address.');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          street_address: street,
          city,
          location_latitude: result.latitude,
          location_longitude: result.longitude,
          location_geocoded_at: new Date().toISOString(),
          location_geocode_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile((p) => ({
        ...p,
        street_address: street,
        city,
        location_latitude: result.latitude,
        location_longitude: result.longitude,
      }));

      toast({
        title: '📍 Location saved',
        description: 'Your dealership will now show on the map for buyers.',
      });
    } catch (err: any) {
      console.error('Save location error:', err);
      setGeoError(err.message || 'Failed to save location.');
    } finally {
      setGeocoding(false);
    }
  };

  const getRoleDisplayName = (role: string | null) => {
    switch (role) {
      case 'buyer': return 'Buyer';
      case 'dealer': return 'Dealer';
      case 'importer': return 'Importer';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Account Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile information</p>
      </div>

      <Card className="bg-card/60 backdrop-blur-lg border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Full Name
            </Label>
            <Input
              id="fullName"
              value={profile.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Enter your full name"
              className="h-11"
            />
          </div>

          <div className="space-y-2">

            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email Address
            </Label>
            <Input id="email" value={profile.email} disabled className="h-11 bg-muted/50" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Account Role
            </Label>
            <Input id="role" value={getRoleDisplayName(userRole)} disabled className="h-11 bg-muted/50" />
            <p className="text-xs text-muted-foreground">Role is assigned during registration</p>
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Save Changes</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isDealer && (
        <Card className="bg-card/60 backdrop-blur-lg border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              Dealership Location
            </CardTitle>
            <CardDescription>
              Add your address so buyers can find you on the map on every vehicle listing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={profile.street_address || ''}
                onChange={(e) => {
                  setProfile({ ...profile, street_address: e.target.value });
                  setGeoError(null);
                }}
                placeholder="e.g. Ngong Road, Kilimani"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={profile.city || ''}
                onChange={(e) => {
                  setProfile({ ...profile, city: e.target.value });
                  setGeoError(null);
                }}
                placeholder="e.g. Nairobi"
                className="h-11"
              />
            </div>

            {geoError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                ⚠️ {geoError}
              </div>
            )}

            <div className="rounded-md border border-border/40 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              ℹ️ We use OpenStreetMap to convert your address to map coordinates. This may take a moment.
            </div>

            <Button onClick={handleSaveLocation} disabled={geocoding} className="w-full sm:w-auto">
              {geocoding ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving & geocoding…</>
              ) : (
                <><MapPin className="h-4 w-4 mr-2" />Save Location</>
              )}
            </Button>

            <div className="pt-2">
              <DealerLocationMap
                dealerName={profile.full_name || 'Your dealership'}
                latitude={profile.location_latitude ?? null}
                longitude={profile.location_longitude ?? null}
                address={profile.street_address}
                city={profile.city}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {isDealer && user && <DealerLocationsCard userId={user.id} />}
    </div>
  );
}

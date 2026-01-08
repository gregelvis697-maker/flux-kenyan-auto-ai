import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Car, Settings, ShoppingBag, Search } from 'lucide-react';

const BuyerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container py-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-3xl">Buyer Dashboard</CardTitle>
              <CardDescription className="text-white/90">
                Welcome back! Browse vehicles and manage your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Hello, <span className="font-medium text-foreground">{user?.email}</span>! 
                  Start exploring the marketplace to find your perfect vehicle.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg" className="gap-2">
                    <Link to="/marketplace">
                      <Search className="h-5 w-5" />
                      Browse Marketplace
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Sections */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Saved Vehicles */}
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Heart className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Saved Vehicles</CardTitle>
                    <CardDescription>Your favorite vehicles</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Car className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No saved vehicles yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Browse the marketplace and save vehicles you like
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Marketplace Access */}
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <ShoppingBag className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Marketplace</CardTitle>
                    <CardDescription>Find your next vehicle</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Access our curated marketplace of verified vehicles from trusted dealers.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/marketplace">
                    <Search className="h-4 w-4 mr-2" />
                    Explore Vehicles
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card className="border-border/50 md:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Settings className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <h4 className="font-medium text-sm mb-1">Email</h4>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <h4 className="font-medium text-sm mb-1">Account Type</h4>
                    <p className="text-sm text-muted-foreground">Buyer</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  More account settings coming soon...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuyerDashboard;

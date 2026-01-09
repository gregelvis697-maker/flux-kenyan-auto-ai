import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Search, 
  Car, 
  Settings,
  Package,
  Heart,
  Sparkles,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { DashboardSidebar, MenuItem } from '@/components/dashboard/DashboardSidebar';
import { SettingsPanel } from '@/components/dashboard/SettingsPanel';
import { cn } from '@/lib/utils';

const buyerMenuItems: MenuItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'My Orders', icon: ShoppingCart },
  { id: 'saved-searches', label: 'Saved Searches', icon: Search },
  { id: 'recommendations', label: 'Recommended Vehicles', icon: Car },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface OrderRecord {
  id: string;
  vehicle_id: string;
  vehicle_make: string;
  vehicle_model: string;
  dealer_name: string;
  status: string;
  created_at: string;
}

interface SavedSearch {
  id: string;
  criteria: string;
  created_at: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  photos: string[] | null;
}

export default function BuyerDashboard() {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [metrics, setMetrics] = useState({
    orders: 0,
    savedSearches: 0,
    favorites: 0,
  });
  
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recommendations, setRecommendations] = useState<Vehicle[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      if (userRole !== 'buyer') {
        navigate(`/dashboard/${userRole}`);
        return;
      }
    }
  }, [user, userRole, loading, navigate]);

  useEffect(() => {
    if (user && userRole === 'buyer') {
      fetchData();
    }
  }, [user, userRole]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      // Fetch favorites count
      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Fetch contact requests as "orders"
      const { data: contactRequests, count: ordersCount } = await supabase
        .from('contact_requests')
        .select('*, vehicles(make, model)', { count: 'exact' })
        .eq('buyer_id', user?.id)
        .order('created_at', { ascending: false });

      // Fetch recommended vehicles (popular/recent listings)
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id, make, model, year, price, photos')
        .eq('is_sold', false)
        .order('created_at', { ascending: false })
        .limit(6);

      setMetrics({
        orders: ordersCount || 0,
        savedSearches: 0, // Saved searches not implemented yet
        favorites: favoritesCount || 0,
      });

      // Transform contact requests to order-like format
      const formattedOrders: OrderRecord[] = (contactRequests || []).map((req: any) => ({
        id: req.id,
        vehicle_id: req.vehicle_id,
        vehicle_make: req.vehicles?.make || 'Unknown',
        vehicle_model: req.vehicles?.model || 'Vehicle',
        dealer_name: 'Dealer',
        status: req.read_at ? 'Responded' : 'Pending',
        created_at: req.created_at,
      }));

      setOrders(formattedOrders);
      setRecommendations(vehicles || []);
    } catch (error) {
      console.error('Error fetching buyer data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleDeleteSavedSearch = async (id: string) => {
    // Placeholder for when saved searches are implemented
    setSavedSearches(savedSearches.filter(s => s.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent shadow-[0_0_20px_hsl(var(--primary)/0.5)]"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Welcome Header */}
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Welcome back!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Here's an overview of your activity
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3">
              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Contact Requests
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{metrics.orders}</div>
                  <p className="text-xs text-muted-foreground mt-1">Dealer inquiries sent</p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Saved Vehicles
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{metrics.favorites}</div>
                  <p className="text-xs text-muted-foreground mt-1">Favorited listings</p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Recommendations
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{recommendations.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Vehicles for you</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Recent Contact Requests</CardTitle>
                <CardDescription>Your latest dealer inquiries</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="font-medium text-sm">{order.vehicle_make} {order.vehicle_model}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          order.status === 'Responded' 
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        )}>
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No contact requests yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Browse vehicles and contact dealers to get started
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">My Orders</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Track your vehicle inquiries and contact requests
              </p>
            </div>

            <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card">
              <CardContent className="p-0">
                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                          <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Vehicle</th>
                          <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Dealer</th>
                          <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                          <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                            <td className="p-4 text-sm font-mono">{order.id.slice(0, 8)}...</td>
                            <td className="p-4 text-sm font-medium">{order.vehicle_make} {order.vehicle_model}</td>
                            <td className="p-4 text-sm hidden sm:table-cell">{order.dealer_name}</td>
                            <td className="p-4">
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                order.status === 'Responded' 
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-amber-500/10 text-amber-400"
                              )}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground font-medium">No orders yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Your vehicle inquiries will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'saved-searches':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Saved Searches</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your saved vehicle search preferences
              </p>
            </div>

            <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card">
              <CardContent className="p-6">
                {savedSearches.length > 0 ? (
                  <div className="space-y-3">
                    {savedSearches.map((search) => (
                      <div key={search.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Search className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{search.criteria}</p>
                            <p className="text-xs text-muted-foreground">
                              Saved on {new Date(search.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSavedSearch(search.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground font-medium">No saved searches</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Save your search filters to quickly find vehicles later
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Recommended Vehicles</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Popular vehicles you might be interested in
              </p>
            </div>

            {recommendations.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((vehicle) => (
                  <Card key={vehicle.id} className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group overflow-hidden">
                    <div className="aspect-video bg-muted/30 relative overflow-hidden">
                      {vehicle.photos && vehicle.photos.length > 0 ? (
                        <img
                          src={vehicle.photos[0]}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-lg font-bold text-primary mt-1">
                        ${vehicle.price.toLocaleString()}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground font-medium">No recommendations yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Check back later for personalized vehicle suggestions
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'settings':
        return <SettingsPanel />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        menuItems={buyerMenuItems}
        title="Buyer Dashboard"
        subtitle="Browse and purchase vehicles"
      />

      <main className={cn(
        'transition-all duration-300 pt-20 lg:pt-16',
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      )}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Buyer Dashboard
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Browse vehicles and manage your account
              </p>
            </div>

            {/* Content */}
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

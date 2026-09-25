import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, AlertTriangle, Star, MessageCircle, Tag, Truck, Bell, Settings, ChevronRight, Calendar, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../context/CurrencyContext';

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  customer_name: string;
  items?: Array<{
    product: {
      id: number;
      name: string;
      price: number;
      image: string;
    };
    quantity: number;
  }>;
}

interface Product {
  id: number;
  name: string;
  image: string;
  is_active: boolean;
  stock_quantity?: number;
  low_stock_threshold?: number;
  sku?: string;
}

interface Review {
  rating: number;
}

interface AdminDashboardProps {
  onNavigate?: (view: any) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalCustomers: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    averageOrderValue: 0,
    totalReviews: 0,
    averageRating: 0,
    pendingQuotes: 0,
    newNotifications: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (orders && !ordersError) {
        const totalRevenue = orders.reduce((sum: number, o: Order) => sum + o.total, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const todayRevenue = orders
          .filter((o: Order) => new Date(o.created_at) >= today)
          .reduce((sum: number, o: Order) => sum + o.total, 0);

        const weekRevenue = orders
          .filter((o: Order) => new Date(o.created_at) >= weekAgo)
          .reduce((sum: number, o: Order) => sum + o.total, 0);

        const monthRevenue = orders
          .filter((o: Order) => new Date(o.created_at) >= monthAgo)
          .reduce((sum: number, o: Order) => sum + o.total, 0);

        setStats(prev => ({
          ...prev,
          totalRevenue,
          todayRevenue,
          weekRevenue,
          monthRevenue,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o: Order) => o.status === 'pending').length,
          completedOrders: orders.filter((o: Order) => o.status === 'delivered').length,
          cancelledOrders: orders.filter((o: Order) => o.status === 'cancelled').length,
          averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
        }));

        setRecentOrders(orders.slice(0, 5));
      }

      // Load products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .is('deleted_at', null);

      if (products && !productsError) {
        const activeProducts = products.filter((p: Product) => p.is_active);
        const lowStock = activeProducts.filter((p: Product) =>
          p.stock_quantity !== undefined &&
          p.stock_quantity <= (p.low_stock_threshold || 10)
        );

        setStats(prev => ({
          ...prev,
          activeProducts: activeProducts.length,
          lowStockProducts: lowStock.length
        }));

        setLowStockProducts(lowStock.slice(0, 5));
      }

      // Load customers count
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user');

      if (count !== null) {
        setStats(prev => ({ ...prev, totalCustomers: count }));
      }

      // Load reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('feedback')
        .select('rating');

      if (reviews && !reviewsError && reviews.length > 0) {
        const avgRating = reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviews.length;
        setStats(prev => ({
          ...prev,
          totalReviews: reviews.length,
          averageRating: avgRating
        }));
      }

      // Load pending quotes
      const { count: pendingQuotes } = await supabase
        .from('user_quotes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingQuotes !== null) {
        setStats(prev => ({ ...prev, pendingQuotes }));
      }

      // Load notifications
      const { count: newNotifications } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (newNotifications !== null) {
        setStats(prev => ({ ...prev, newNotifications }));
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto"></div>
          <p className="mt-4 text-stone-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-stone-900">Dashboard</h2>
        <p className="text-stone-600 mt-1">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          color="green"
        />
        <StatCard
          icon={<ShoppingCart className="w-6 h-6" />}
          label="Total Orders"
          value={stats.totalOrders.toString()}
          subtitle={`${stats.pendingOrders} pending`}
          color="blue"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Total Customers"
          value={stats.totalCustomers.toString()}
          color="purple"
        />
        <StatCard
          icon={<Package className="w-6 h-6" />}
          label="Active Products"
          value={stats.activeProducts.toString()}
          subtitle={`${stats.lowStockProducts} low stock`}
          color="orange"
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-stone-900">{formatPrice(stats.todayRevenue)}</p>
            </div>
            <Calendar className="w-8 h-8 text-stone-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600">This Week</p>
              <p className="text-2xl font-bold text-stone-900">{formatPrice(stats.weekRevenue)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-stone-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600">This Month</p>
              <p className="text-2xl font-bold text-stone-900">{formatPrice(stats.monthRevenue)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-stone-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction 
            icon={<Package className="w-6 h-6" />} 
            label="Add Product" 
            color="blue" 
            onClick={() => onNavigate?.('products')}
          />
          <QuickAction 
            icon={<Tag className="w-6 h-6" />} 
            label="Create Coupon" 
            color="green" 
            onClick={() => onNavigate?.('coupons')}
          />
          <QuickAction 
            icon={<MessageCircle className="w-6 h-6" />} 
            label="Review Feedback" 
            color="purple" 
            onClick={() => onNavigate?.('reviews')}
          />
          <QuickAction 
            icon={<Settings className="w-6 h-6" />} 
            label="Store Settings" 
            color="orange" 
            onClick={() => onNavigate?.('settings')}
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  trend?: string;
  color: 'green' | 'blue' | 'purple' | 'orange';
}

function StatCard({ icon, label, value, subtitle, trend, color }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-sm text-green-600 font-medium">{trend}</span>
        )}
      </div>
      <h3 className="text-sm text-stone-600 mb-1">{label}</h3>
      <p className="text-2xl font-bold text-stone-900">{value}</p>
      {subtitle && <p className="text-sm text-stone-500 mt-1">{subtitle}</p>}
    </div>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  onClick?: () => void;
}

function QuickAction({ icon, label, color, onClick }: QuickActionProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
  };

  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${colorClasses[color]}`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

import { useState, useEffect } from 'react';
import { 
  DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown,
  AlertTriangle, Star, MessageCircle, Tag, Truck, Bell, Settings, 
  ChevronRight, Calendar, Filter, Activity, Eye, Clock, CheckCircle2,
  XCircle, ArrowUpRight, ArrowDownRight, RefreshCw, Download, Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';

interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  yesterdayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  newCustomersToday: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  averageOrderValue: number;
  totalReviews: number;
  averageRating: number;
  pendingQuotes: number;
  newNotifications: number;
  fulfillmentRate: number;
}

interface RecentOrder {
  id: string;
  total: number;
  status: string;
  created_at: string;
  customer: { name: string; email: string };
  items_count: number;
}

interface TopProduct {
  id: number;
  name: string;
  image: string;
  category: string;
  sales_count: number;
  revenue: number;
}

interface RecentCustomer {
  id: string;
  name: string;
  email: string;
  created_at: string;
  orders_count: number;
  total_spent: number;
}

interface Alert {
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  action?: string;
  navigateTo?: string;
}

interface AdminDashboardProps {
  onNavigate?: (view: any) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0, todayRevenue: 0, yesterdayRevenue: 0, weekRevenue: 0, monthRevenue: 0,
    totalOrders: 0, pendingOrders: 0, confirmedOrders: 0, processingOrders: 0,
    shippedOrders: 0, completedOrders: 0, cancelledOrders: 0,
    totalCustomers: 0, newCustomersToday: 0,
    activeProducts: 0, lowStockProducts: 0, outOfStockProducts: 0,
    averageOrderValue: 0, totalReviews: 0, averageRating: 0,
    pendingQuotes: 0, newNotifications: 0, fulfillmentRate: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | '3months' | '1year'>('30days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      let startDate = monthAgo;

      if (dateRange === 'today') {
        startDate = today;
      } else if (dateRange === '7days') {
        startDate = weekAgo;
      } else if (dateRange === '3months') {
        startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      } else if (dateRange === '1year') {
        startDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
      }

      const [
        ordersResult,
        productsResult,
        customersResult,
        reviewsResult,
        quotesResult,
        notificationsResult
      ] = await Promise.all([
        supabase
          .from('orders')
          .select('id,total,status,created_at,customer,items,user_id')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false }),

        supabase
          .from('products')
          .select('id,name,image,category,price,is_active,stock_quantity,low_stock_threshold')
          .is('deleted_at', null),

        supabase
          .from('profiles')
          .select('id,name,email,created_at')
          .eq('role', 'user')
          .order('created_at', { ascending: false })
          .limit(5),

        supabase
          .from('feedback')
          .select('rating'),

        supabase
          .from('user_quotes')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),

        supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('is_read', false)
      ]);

      const orders = ordersResult.data || [];
      const products = productsResult.data || [];
      const customers = customersResult.data || [];
      const reviews = reviewsResult.data || [];

      let totalRevenue = 0;
      let todayRevenue = 0;
      let yesterdayRevenue = 0;
      let weekRevenue = 0;
      let pendingOrders = 0;
      let confirmedOrders = 0;
      let processingOrders = 0;
      let shippedOrders = 0;
      let completedOrders = 0;
      let cancelledOrders = 0;

      orders.forEach((order: any) => {
        const total = Number(order.total) || 0;
        const createdAt = new Date(order.created_at);

        totalRevenue += total;

        if (createdAt >= today) {
          todayRevenue += total;
        } else if (createdAt >= yesterday) {
          yesterdayRevenue += total;
        }

        if (createdAt >= weekAgo) {
          weekRevenue += total;
        }

        switch (order.status) {
          case 'pending':
            pendingOrders++;
            break;
          case 'confirmed':
            confirmedOrders++;
            break;
          case 'processing':
            processingOrders++;
            break;
          case 'shipped':
            shippedOrders++;
            break;
          case 'delivered':
            completedOrders++;
            break;
          case 'cancelled':
            cancelledOrders++;
            break;
        }
      });

      const nonCancelledOrders = orders.length - cancelledOrders;

      const fulfillmentRate =
        nonCancelledOrders > 0
          ? Math.round((completedOrders / nonCancelledOrders) * 100)
          : 0;

      setRecentOrders(
        orders.slice(0, 5).map((order: any) => ({
          id: order.id,
          total: Number(order.total) || 0,
          status: order.status,
          created_at: order.created_at,
          customer: order.customer || { name: 'Unknown', email: '' },
          items_count: Array.isArray(order.items) ? order.items.length : 0
        }))
      );

      const activeProducts = products.filter(
        (product: any) => product.is_active
      );

      const lowStock = activeProducts.filter(
        (product: any) =>
          product.stock_quantity !== undefined &&
          product.stock_quantity <= (product.low_stock_threshold || 10) &&
          product.stock_quantity > 0
      );

      const outOfStock = activeProducts.filter(
        (product: any) =>
          product.stock_quantity !== undefined &&
          product.stock_quantity === 0
      );

      setLowStockProducts(
        [...lowStock, ...outOfStock].slice(0, 5)
      );

      const productSales: Record<
        string,
        {
          product: any;
          count: number;
          revenue: number;
        }
      > = {};

      orders.forEach((order: any) => {
        if (!Array.isArray(order.items)) return;

        order.items.forEach((item: any) => {
          const product = item?.product;

          if (!product?.id) return;

          const productId = String(product.id);
          const quantity = Number(item.quantity) || 0;
          const price = Number(product.price) || 0;

          if (!productSales[productId]) {
            productSales[productId] = {
              product,
              count: 0,
              revenue: 0
            };
          }

          productSales[productId].count += quantity;
          productSales[productId].revenue += price * quantity;
        });
      });

      setTopProducts(
        Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
          .map((item) => ({
            id: item.product.id,
            name: item.product.name,
            image: item.product.image,
            category: item.product.category,
            sales_count: item.count,
            revenue: item.revenue
          }))
      );

      const recentCustomers = customers.map((customer: any) => {
        const customerOrders = orders.filter(
          (order: any) => order.user_id === customer.id
        );

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          created_at: customer.created_at,
          orders_count: customerOrders.length,
          total_spent: customerOrders.reduce(
            (sum: number, order: any) =>
              sum + (Number(order.total) || 0),
            0
          )
        };
      });

      setRecentCustomers(recentCustomers);

      const totalReviews = reviews.length;

      const averageRating =
        totalReviews > 0
          ? reviews.reduce(
              (sum: number, review: any) =>
                sum + (Number(review.rating) || 0),
              0
            ) / totalReviews
          : 0;

      const pendingQuotes = quotesResult.count || 0;
      const newNotifications = notificationsResult.count || 0;

      const newCustomersToday = customers.filter(
        (customer: any) =>
          new Date(customer.created_at) >= today
      ).length;

      const newStats: DashboardStats = {
        totalRevenue,
        todayRevenue,
        yesterdayRevenue,
        weekRevenue,
        monthRevenue: totalRevenue,
        totalOrders: orders.length,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        completedOrders,
        cancelledOrders,
        totalCustomers: customers.length,
        newCustomersToday,
        activeProducts: activeProducts.length,
        lowStockProducts: lowStock.length,
        outOfStockProducts: outOfStock.length,
        averageOrderValue:
          orders.length > 0
            ? totalRevenue / orders.length
            : 0,
        totalReviews,
        averageRating,
        pendingQuotes,
        newNotifications,
        fulfillmentRate
      };

      setStats(newStats);

      const newAlerts: Alert[] = [];

      if (pendingOrders > 0) {
        newAlerts.push({
          type: 'warning',
          title: 'Pending Orders',
          message: `${pendingOrders} orders awaiting confirmation`,
          action: 'View Orders',
          navigateTo: 'orders'
        });
      }

      if (lowStock.length > 0) {
        newAlerts.push({
          type: 'error',
          title: 'Low Stock Alert',
          message: `${lowStock.length} products running low on stock`,
          action: 'View Inventory',
          navigateTo: 'products'
        });
      }

      if (pendingQuotes > 0) {
        newAlerts.push({
          type: 'info',
          title: 'Quote Requests',
          message: `${pendingQuotes} quotes awaiting review`,
          action: 'Review Quotes',
          navigateTo: 'quotes'
        });
      }

      setAlerts(newAlerts);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getRevenueTrend = () => {
    if (stats.yesterdayRevenue === 0) return 0;
    return ((stats.todayRevenue - stats.yesterdayRevenue) / stats.yesterdayRevenue) * 100;
  };

  const revenueTrend = getRevenueTrend();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-6 h-6 text-amber-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-stone-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-50">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-stone-900 font-bold">
              {greeting}, {user?.name?.split(' ')[0] || 'Admin'} 👋
            </h1>
            <p className="text-stone-600 mt-1">
              Here's what's happening with your store today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-stone-200 p-1">
              {[
                { value: 'today', label: 'Today' },
                { value: '7days', label: '7 Days' },
                { value: '30days', label: '30 Days' },
                { value: '3months', label: '3 Months' },
                { value: '1year', label: '1 Year' }
              ].map(range => (
                <button
                  key={range.value}
                  onClick={() => setDateRange(range.value as any)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    dateRange === range.value
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white rounded-lg shadow-sm border border-stone-200 hover:bg-stone-50 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 text-stone-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`rounded-xl border-l-4 p-4 shadow-sm ${
                  alert.type === 'warning' ? 'bg-amber-50 border-amber-500' :
                  alert.type === 'error' ? 'bg-red-50 border-red-500' :
                  alert.type === 'success' ? 'bg-green-50 border-green-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`font-semibold text-sm ${
                      alert.type === 'warning' ? 'text-amber-900' :
                      alert.type === 'error' ? 'text-red-900' :
                      alert.type === 'success' ? 'text-green-900' :
                      'text-blue-900'
                    }`}>
                      {alert.title}
                    </h4>
                    <p className={`text-xs mt-1 ${
                      alert.type === 'warning' ? 'text-amber-700' :
                      alert.type === 'error' ? 'text-red-700' :
                      alert.type === 'success' ? 'text-green-700' :
                      'text-blue-700'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                  {alert.action && alert.navigateTo && (
                    <button
                      onClick={() => onNavigate?.(alert.navigateTo)}
                      className="text-xs font-medium text-stone-900 hover:text-stone-700 flex items-center gap-1"
                    >
                      {alert.action}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KPI Cards - Premium Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Revenue - Featured Card */}
          <div className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <DollarSign className="w-6 h-6" />
                </div>
                {revenueTrend !== 0 && (
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    revenueTrend > 0 ? 'bg-white/20' : 'bg-red-500/20'
                  }`}>
                    {revenueTrend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(revenueTrend).toFixed(1)}%
                  </div>
                )}
              </div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Total Revenue</p>
              <p className="text-3xl font-bold mb-2">{formatPrice(stats.totalRevenue)}</p>
              <p className="text-emerald-100 text-xs">
                {dateRange === 'today' ? "Today's earnings" : 
                 dateRange === '7days' ? 'Last 7 days' :
                 dateRange === '30days' ? 'Last 30 days' :
                 dateRange === '3months' ? 'Last 3 months' : 'This year'}
              </p>
            </div>
          </div>

          {/* Total Orders */}
          <KPICardPremium
            icon={<ShoppingCart className="w-6 h-6" />}
            label="Total Orders"
            value={stats.totalOrders.toString()}
            subtitle={`${stats.pendingOrders} pending`}
            color="blue"
            trend={stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(0) + '% completed' : undefined}
          />

          {/* Customers */}
          <KPICardPremium
            icon={<Users className="w-6 h-6" />}
            label="Customers"
            value={stats.totalCustomers.toString()}
            subtitle={`${stats.newCustomersToday} new today`}
            color="purple"
            trend={stats.newCustomersToday > 0 ? `+${stats.newCustomersToday} today` : undefined}
          />

          {/* Products */}
          <KPICardPremium
            icon={<Package className="w-6 h-6" />}
            label="Products"
            value={stats.activeProducts.toString()}
            subtitle={`${stats.lowStockProducts} low stock`}
            color="amber"
            trend={stats.lowStockProducts > 0 ? `${stats.lowStockProducts} need attention` : 'All stocked'}
          />

          {/* Average Order Value */}
          <KPICardPremium
            icon={<TrendingUp className="w-6 h-6" />}
            label="Avg Order Value"
            value={formatPrice(stats.averageOrderValue)}
            color="rose"
            trend={stats.averageOrderValue > 0 ? 'Per order' : undefined}
          />

          {/* Fulfillment Rate */}
          <KPICardPremium
            icon={<CheckCircle2 className="w-6 h-6" />}
            label="Fulfillment Rate"
            value={`${stats.fulfillmentRate}%`}
            color="teal"
            trend={stats.fulfillmentRate >= 90 ? 'Excellent' : stats.fulfillmentRate >= 70 ? 'Good' : 'Needs attention'}
            progress={stats.fulfillmentRate}
          />
        </div>

        {/* Revenue Overview & Order Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Revenue Overview</h3>
                <p className="text-sm text-stone-500 mt-1">
                  {dateRange === 'today' ? "Today's" : 
                   dateRange === '7days' ? 'Last 7 days' :
                   dateRange === '30days' ? 'Last 30 days' :
                   dateRange === '3months' ? 'Last 3 months' : 'Last year'} revenue breakdown
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-stone-900">
                  {dateRange === 'today' ? formatPrice(stats.todayRevenue) :
                   dateRange === '7days' ? formatPrice(stats.weekRevenue) :
                   formatPrice(stats.monthRevenue)}
                </p>
                {revenueTrend !== 0 && (
                  <p className={`text-sm font-medium flex items-center gap-1 justify-end ${
                    revenueTrend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {revenueTrend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(revenueTrend).toFixed(1)}% vs yesterday
                  </p>
                )}
              </div>
            </div>
            
            {/* Simple Bar Chart */}
            <div className="space-y-3">
              {[
                { label: 'Today', value: stats.todayRevenue, max: Math.max(stats.todayRevenue, stats.weekRevenue / 7, stats.monthRevenue / 30) },
                { label: 'This Week', value: stats.weekRevenue, max: Math.max(stats.todayRevenue, stats.weekRevenue, stats.monthRevenue) },
                { label: 'This Month', value: stats.monthRevenue, max: Math.max(stats.todayRevenue, stats.weekRevenue, stats.monthRevenue) }
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-stone-600">{item.label}</span>
                    <span className="text-sm font-semibold text-stone-900">{formatPrice(item.value)}</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                      style={{ width: `${item.max > 0 ? (item.value / item.max) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Donut */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-6">Order Status</h3>
            
            {/* Visual Donut */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90">
                {(() => {
                  const total = stats.totalOrders || 1;
                  const statuses = [
                    { label: 'Pending', value: stats.pendingOrders, color: '#f59e0b' },
                    { label: 'Confirmed', value: stats.confirmedOrders, color: '#3b82f6' },
                    { label: 'Processing', value: stats.processingOrders, color: '#8b5cf6' },
                    { label: 'Shipped', value: stats.shippedOrders, color: '#6366f1' },
                    { label: 'Delivered', value: stats.completedOrders, color: '#10b981' },
                    { label: 'Cancelled', value: stats.cancelledOrders, color: '#ef4444' }
                  ];
                  
                  let currentOffset = 0;
                  const circumference = 2 * Math.PI * 70;
                  
                  return statuses.map((status, idx) => {
                    const percentage = status.value / total;
                    const strokeDasharray = `${percentage * circumference} ${circumference}`;
                    const strokeDashoffset = -currentOffset;
                    currentOffset += percentage * circumference;
                    
                    return (
                      <circle
                        key={idx}
                        cx="96"
                        cy="96"
                        r="70"
                        fill="none"
                        stroke={status.color}
                        strokeWidth="20"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <p className="text-3xl font-bold text-stone-900">{stats.totalOrders}</p>
                <p className="text-xs text-stone-500">Total Orders</p>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2">
              {[
                { label: 'Pending', value: stats.pendingOrders, color: 'bg-amber-500' },
                { label: 'Confirmed', value: stats.confirmedOrders, color: 'bg-blue-500' },
                { label: 'Processing', value: stats.processingOrders, color: 'bg-purple-500' },
                { label: 'Shipped', value: stats.shippedOrders, color: 'bg-indigo-500' },
                { label: 'Delivered', value: stats.completedOrders, color: 'bg-green-500' },
                { label: 'Cancelled', value: stats.cancelledOrders, color: 'bg-red-500' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-stone-600">{item.label}</span>
                  </div>
                  <span className="font-semibold text-stone-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Recent Orders</h3>
                <p className="text-sm text-stone-500 mt-1">Latest customer orders</p>
              </div>
              <button 
                onClick={() => onNavigate?.('orders')}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <EmptyState icon={<ShoppingCart />} message="No orders yet" />
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <ShoppingCart className="w-5 h-5 text-stone-600" />
                        </div>
                        <div>
                          <p className="font-medium text-stone-900 text-sm">#{order.id.slice(-8)}</p>
                          <p className="text-xs text-stone-500">{order.customer.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-stone-900 text-sm">{formatPrice(order.total)}</p>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Top Selling Products</h3>
                <p className="text-sm text-stone-500 mt-1">Best performers this period</p>
              </div>
              <button 
                onClick={() => onNavigate?.('products')}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              {topProducts.length === 0 ? (
                <EmptyState icon={<Package />} message="No sales data yet" />
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                        {product.image.startsWith('') || product.image.startsWith('http') ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">{product.image}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-900 text-sm truncate">{product.name}</p>
                        <p className="text-xs text-stone-500">{product.sales_count} sold</p>
                      </div>
                      <p className="font-semibold text-stone-900 text-sm">{formatPrice(product.revenue)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Customers & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Customers */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Recent Customers</h3>
                <p className="text-sm text-stone-500 mt-1">Latest signups</p>
              </div>
              <button 
                onClick={() => onNavigate?.('customers')}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              {recentCustomers.length === 0 ? (
                <EmptyState icon={<Users />} message="No customers yet" />
              ) : (
                <div className="space-y-3">
                  {recentCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-stone-900 text-sm">{customer.name}</p>
                          <p className="text-xs text-stone-500">{customer.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-stone-900 text-sm">{formatPrice(customer.total_spent)}</p>
                        <p className="text-xs text-stone-500">{customer.orders_count} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <h3 className="text-lg font-semibold text-stone-900">Low Stock Alert</h3>
                  <p className="text-sm text-stone-500 mt-1">Products needing attention</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate?.('products')}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                View Inventory <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              {lowStockProducts.length === 0 ? (
                <EmptyState icon={<CheckCircle2 />} message="All products well stocked" type="success" />
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                          {product.image.startsWith('') || product.image.startsWith('http') ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">{product.image}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-stone-900 text-sm">{product.name}</p>
                          <p className="text-xs text-stone-600">SKU: {product.sku || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          product.stock_quantity === 0 ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {product.stock_quantity || 0}
                        </p>
                        <p className="text-xs text-stone-600">
                          {product.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
              <p className="text-sm text-stone-400 mt-1">Common tasks at your fingertips</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction 
              icon={<Package className="w-6 h-6" />} 
              label="Add Product" 
              onClick={() => onNavigate?.('products')}
              color="blue"
            />
            <QuickAction 
              icon={<Tag className="w-6 h-6" />} 
              label="Create Coupon" 
              onClick={() => onNavigate?.('coupons')}
              color="green"
            />
            <QuickAction 
              icon={<MessageCircle className="w-6 h-6" />} 
              label="Review Feedback" 
              onClick={() => onNavigate?.('reviews')}
              color="purple"
            />
            <QuickAction 
              icon={<Settings className="w-6 h-6" />} 
              label="Store Settings" 
              onClick={() => onNavigate?.('settings')}
              color="amber"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

// KPI Card Component
interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  trend?: number;
  color: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'teal';
}

function KPICard({ icon, label, value, subtitle, trend, color }: KPICardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    teal: 'bg-teal-50 text-teal-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend !== undefined && trend !== 0 && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <h3 className="text-xs text-stone-500 font-medium uppercase tracking-wide">{label}</h3>
      <p className="text-2xl font-bold text-stone-900 mt-1">{value}</p>
      {subtitle && <p className="text-xs text-stone-500 mt-1">{subtitle}</p>}
    </div>
  );
}

// Premium KPI Card Component
interface KPICardPremiumProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  trend?: string;
  color: 'blue' | 'purple' | 'amber' | 'rose' | 'teal';
  progress?: number;
}

function KPICardPremium({ icon, label, value, subtitle, trend, color, progress }: KPICardPremiumProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-100 text-blue-600',
      border: 'border-blue-200',
      accent: 'text-blue-600'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'bg-purple-100 text-purple-600',
      border: 'border-purple-200',
      accent: 'text-purple-600'
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'bg-amber-100 text-amber-600',
      border: 'border-amber-200',
      accent: 'text-amber-600'
    },
    rose: {
      bg: 'bg-rose-50',
      icon: 'bg-rose-100 text-rose-600',
      border: 'border-rose-200',
      accent: 'text-rose-600'
    },
    teal: {
      bg: 'bg-teal-50',
      icon: 'bg-teal-100 text-teal-600',
      border: 'border-teal-200',
      accent: 'text-teal-600'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} rounded-2xl shadow-sm border ${colors.border} p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group`}>
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
      
      <div className="relative z-10">
        {/* Icon and Label */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${colors.icon} shadow-sm`}>
            {icon}
          </div>
          {trend && (
            <span className={`text-xs font-semibold ${colors.accent} px-2 py-1 rounded-full bg-white/50`}>
              {trend}
            </span>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          <p className="text-sm font-medium text-stone-600 mb-1">{label}</p>
          <p className="text-4xl font-bold text-stone-900">{value}</p>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-stone-600 font-medium">{subtitle}</p>
        )}

        {/* Progress Bar (for Fulfillment Rate) */}
        {progress !== undefined && (
          <div className="mt-4">
            <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  progress >= 90 ? 'bg-green-500' : 
                  progress >= 70 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: { [key: string]: { bg: string; text: string } } = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-700' },
    processing: { bg: 'bg-purple-100', text: 'text-purple-700' },
    shipped: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    delivered: { bg: 'bg-green-100', text: 'text-green-700' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700' }
  };

  const config = statusConfig[status] || { bg: 'bg-stone-100', text: 'text-stone-700' };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.text}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Empty State Component
function EmptyState({ icon, message, type = 'default' }: { icon: React.ReactNode; message: string; type?: 'default' | 'success' }) {
  return (
    <div className="text-center py-8">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
        type === 'success' ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-400'
      }`}>
        {icon}
      </div>
      <p className={`text-sm ${type === 'success' ? 'text-green-600' : 'text-stone-500'}`}>{message}</p>
    </div>
  );
}

// Quick Action Component
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  color: 'blue' | 'green' | 'purple' | 'amber';
}

function QuickAction({ icon, label, onClick, color }: QuickActionProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',
    green: 'bg-green-500/10 text-green-400 hover:bg-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
  };

  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-xl flex flex-col items-center gap-3 transition-all ${colorClasses[color]}`}
    >
      {icon}
      <span className="text-sm font-medium text-white">{label}</span>
    </button>
  );
}


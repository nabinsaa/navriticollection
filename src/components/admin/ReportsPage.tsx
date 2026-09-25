import { useState, useEffect } from 'react';
import { Download, FileText, TrendingUp, Users, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../context/CurrencyContext';

export default function ReportsPage() {
  const { formatPrice } = useCurrency();
  const [reportType, setReportType] = useState<'sales' | 'orders' | 'customers' | 'products'>('sales');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    generateReport();
  }, [reportType]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const { data: orders } = await supabase.from('orders').select('*');
      const { data: customers } = await supabase.from('profiles').select('*').eq('role', 'user');
      const { data: products } = await supabase.from('products').select('*').is('deleted_at', null);

      if (!orders || !customers || !products) return;

      const report = {
        sales: {
          totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
          totalOrders: orders.length,
          averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
        },
        orders: orders,
        customers: {
          total: customers.length,
        },
        products: {
          total: products.length,
          active: products.filter((p) => p.is_active).length,
        },
      };

      setReportData(report);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Reports</h2>
          <p className="text-stone-600 mt-1">Generate and export reports</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800">
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => setReportType('sales')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              reportType === 'sales' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <TrendingUp className="w-5 h-5 mx-auto mb-1" />
            Sales
          </button>
          <button
            onClick={() => setReportType('orders')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              reportType === 'orders' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <ShoppingBag className="w-5 h-5 mx-auto mb-1" />
            Orders
          </button>
          <button
            onClick={() => setReportType('customers')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              reportType === 'customers' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Users className="w-5 h-5 mx-auto mb-1" />
            Customers
          </button>
          <button
            onClick={() => setReportType('products')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              reportType === 'products' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <FileText className="w-5 h-5 mx-auto mb-1" />
            Products
          </button>
        </div>
      </div>

      {reportData && (
        <div className="bg-white rounded-lg shadow p-6">
          {reportType === 'sales' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-stone-900">Sales Report</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-stone-50 rounded-lg p-4">
                  <p className="text-sm text-stone-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-stone-900">{formatPrice(reportData.sales.totalRevenue)}</p>
                </div>
                <div className="bg-stone-50 rounded-lg p-4">
                  <p className="text-sm text-stone-600">Total Orders</p>
                  <p className="text-2xl font-bold text-stone-900">{reportData.sales.totalOrders}</p>
                </div>
                <div className="bg-stone-50 rounded-lg p-4">
                  <p className="text-sm text-stone-600">Average Order Value</p>
                  <p className="text-2xl font-bold text-stone-900">{formatPrice(reportData.sales.averageOrderValue)}</p>
                </div>
              </div>
            </div>
          )}

          {reportType === 'customers' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-stone-900">Customers Report</h3>
              <div className="bg-stone-50 rounded-lg p-4">
                <p className="text-sm text-stone-600">Total Customers</p>
                <p className="text-2xl font-bold text-stone-900">{reportData.customers.total}</p>
              </div>
            </div>
          )}

          {reportType === 'products' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-stone-900">Products Report</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-50 rounded-lg p-4">
                  <p className="text-sm text-stone-600">Total Products</p>
                  <p className="text-2xl font-bold text-stone-900">{reportData.products.total}</p>
                </div>
                <div className="bg-stone-50 rounded-lg p-4">
                  <p className="text-sm text-stone-600">Active Products</p>
                  <p className="text-2xl font-bold text-stone-900">{reportData.products.active}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

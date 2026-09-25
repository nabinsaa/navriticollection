import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../context/CurrencyContext';

export default function CouponsPage() {
  const { formatPrice } = useCurrency();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this coupon?')) return;

    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      await loadCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Failed to delete coupon');
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
          <h2 className="text-2xl font-bold text-stone-900">Coupons</h2>
          <p className="text-stone-600 mt-1">{coupons.length} total coupons</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800">
          <Plus className="w-5 h-5" />
          Create Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Tag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-600">No coupons created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <code className="px-3 py-1 bg-stone-100 text-stone-900 rounded font-mono text-lg">
                    {coupon.code}
                  </code>
                  <p className="text-sm text-stone-600 mt-2">
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}% off`
                      : formatPrice(coupon.discount_value)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-stone-600">
                <p>Used: {coupon.used_count} / {coupon.usage_limit || '∞'}</p>
                <p>Status: {coupon.is_active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Truck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../context/CurrencyContext';

export default function ShippingPage() {
  const { formatPrice } = useCurrency();
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_zones')
        .select('*')
        .order('shipping_fee', { ascending: true });

      if (error) throw error;
      setZones(data || []);
    } catch (error) {
      console.error('Error loading zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this shipping zone?')) return;

    try {
      const { error } = await supabase.from('shipping_zones').delete().eq('id', id);
      if (error) throw error;
      await loadZones();
    } catch (error) {
      console.error('Error deleting zone:', error);
      alert('Failed to delete shipping zone');
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
          <h2 className="text-2xl font-bold text-stone-900">Shipping Zones</h2>
          <p className="text-stone-600 mt-1">{zones.length} shipping zones configured</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800">
          <Plus className="w-5 h-5" />
          Add Zone
        </button>
      </div>

      {zones.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Truck className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-600">No shipping zones configured</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Zone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Shipping Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Free Shipping</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Delivery Time</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {zones.map((zone) => (
                <tr key={zone.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-stone-900">{zone.zone_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-stone-900">{formatPrice(zone.shipping_fee)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-stone-900">
                      {zone.free_shipping_threshold > 0 ? formatPrice(zone.free_shipping_threshold) : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-stone-900">{zone.estimated_days}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(zone.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

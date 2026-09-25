import { useState, useEffect } from 'react';
import { Package, ArrowLeft } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { supabase } from '../lib/supabase';

interface OrdersPageProps {
  onBack: () => void;
  onLoginClick: () => void;
}

export default function OrdersPage({ onBack, onLoginClick }: OrdersPageProps) {
  const { orders } = useOrder();
  const { user, isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Package className="w-16 h-16 text-stone-300 mx-auto mb-6" />
          <h2 className="text-2xl font-serif text-stone-900 mb-4">Login Required</h2>
          <p className="text-stone-600 mb-6">
            Please login to view your orders
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onLoginClick}
              className="px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
            >
              Login / Sign Up
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 border border-stone-300 text-stone-700 rounded-full font-medium hover:bg-stone-50 transition-colors"
            >
              Back to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-12 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Shop</span>
        </button>

        <h1 className="text-4xl font-serif text-stone-900 mb-2">My Orders</h1>
        <p className="text-stone-600 mb-8">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </p>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
            <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-stone-900 mb-2">No orders yet</h3>
            <p className="text-stone-600 mb-6">
              Start shopping to see your orders here
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-stone-900">Order #{order.id.slice(-8)}</h3>
                    <p className="text-sm text-stone-600">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-stone-900">{formatPrice(order.total)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex-shrink-0 w-16 h-16 bg-stone-100 rounded-lg flex items-center justify-center text-2xl overflow-hidden">
                      {item.product.image.startsWith('') ? (
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{item.product.image}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                  <div>
                    <p className="text-sm text-stone-600">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </p>
                    <p className="text-sm text-stone-600">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-stone-900">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

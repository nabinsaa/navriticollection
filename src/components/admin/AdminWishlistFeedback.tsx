import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminWishlistFeedbackProps {
  onBack: () => void;
}

export default function AdminWishlistFeedback({ onBack }: AdminWishlistFeedbackProps) {
  const [activeTab, setActiveTab] = useState<'wishlists' | 'feedback'>('wishlists');
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'wishlists') {
        const { data, error } = await supabase
          .from('wishlists')
          .select(`
            id,
            user_id,
            product_id,
            created_at,
            profiles:user_id (email, name),
            products:product_id (name, image)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const items = (data || []).map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          product_id: item.product_id,
          created_at: item.created_at,
          user_email: item.profiles?.email || 'Unknown',
          user_name: item.profiles?.name || 'Unknown',
          product_name: item.products?.name || 'Unknown Product',
          product_image: item.products?.image || ''
        }));

        setWishlists(items);
      } else {
        const { data, error } = await supabase
          .from('feedback')
          .select(`
            id,
            user_id,
            product_id,
            user_name,
            user_email,
            rating,
            comment,
            created_at,
            products:product_id (name, image)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const items = (data || []).map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          product_id: item.product_id,
          user_name: item.user_name,
          user_email: item.user_email,
          rating: item.rating,
          comment: item.comment,
          created_at: item.created_at,
          product_name: item.products?.name,
          product_image: item.products?.image
        }));

        setFeedbacks(items);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWishlist = async (id: string) => {
    if (!confirm('Remove this item from wishlist?')) return;

    try {
      const { error } = await supabase.from('wishlists').delete().eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error deleting wishlist:', error);
      alert('Failed to remove from wishlist');
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Delete this feedback?')) return;

    try {
      const { error } = await supabase.from('feedback').delete().eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Wishlists & Product Feedback</h2>
        <p className="text-stone-600 mt-1">Manage user wishlists and product feedback</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('wishlists')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'wishlists'
              ? 'bg-stone-900 text-white'
              : 'bg-white text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Heart className="w-5 h-5" />
          Wishlists ({wishlists.length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'feedback'
              ? 'bg-stone-900 text-white'
              : 'bg-white text-stone-700 hover:bg-stone-100'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          Feedback ({feedbacks.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
        </div>
      ) : activeTab === 'wishlists' ? (
        wishlists.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Heart className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-600">No wishlists yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-200">
                {wishlists.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-stone-900">{item.user_name}</div>
                      <div className="text-sm text-stone-500">{item.user_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.product_image.startsWith('') || item.product_image.startsWith('http') ? (
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">{item.product_image}</span>
                          )}
                        </div>
                        <div className="text-sm text-stone-900">{item.product_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteWishlist(item.id)}
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
        )
      ) : (
        feedbacks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <MessageCircle className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-600">No feedback yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-stone-900">{feedback.user_name}</h3>
                    <p className="text-sm text-stone-600">{feedback.user_email}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= feedback.rating ? 'text-amber-400' : 'text-stone-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                {feedback.product_name && (
                  <p className="text-sm text-stone-600 mb-2">Product: {feedback.product_name}</p>
                )}
                <p className="text-stone-700 mb-4">{feedback.comment}</p>
                <button
                  onClick={() => handleDeleteFeedback(feedback.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

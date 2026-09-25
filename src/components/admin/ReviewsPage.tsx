import { useState, useEffect } from 'react';
import { Star, Trash2, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ReviewsPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this feedback?')) return;

    try {
      const { error } = await supabase.from('feedback').delete().eq('id', id);
      if (error) throw error;
      await loadFeedbacks();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback');
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
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Reviews & Feedback</h2>
        <p className="text-stone-600 mt-1">{feedbacks.length} total reviews</p>
      </div>

      {feedbacks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MessageSquare className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-600">No reviews yet</p>
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
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= feedback.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-stone-700 mb-4">{feedback.comment}</p>
              <button
                onClick={() => handleDelete(feedback.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

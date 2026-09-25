import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Star, Send } from 'lucide-react';

interface FeedbackItem {
  id: string;
  rating: number;
  comment: string;
  user_name: string;
  created_at: string;
  admin_response?: string;
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to submit feedback');
      return;
    }

    if (!formData.comment.trim()) {
      alert('Please write your feedback');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('feedback').insert([{
        rating: formData.rating,
        comment: formData.comment,
        user_id: user.id,
        user_name: user.name || user.email,
        user_email: user.email,
      }]);

      if (error) throw error;

      setSubmitted(true);
      setFormData({ rating: 5, comment: '' });
      setShowForm(false);
      loadFeedbacks(); // Reload to show new feedback
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-stone-600 font-medium">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4">
            <MessageCircle className="w-4 h-4" />
            <span>Your Voice Matters</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4">
            Customer Feedback
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-6">
            Share your experience and help us improve
          </p>
          {user && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors flex items-center gap-2 mx-auto"
            >
              <Send className="w-5 h-5" />
              Write Feedback
            </button>
          )}
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-900 mb-2">
              Thank You for Your Feedback!
            </h3>
            <p className="text-green-700">
              Your feedback helps us improve our services.
            </p>
          </div>
        )}

        {/* Feedback Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 mb-8">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Share Your Feedback</h2>
            
            <div className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= formData.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Your Feedback *
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows={5}
                  required
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Tell us about your experience..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ rating: 5, comment: '' });
                  }}
                  className="flex-1 px-6 py-3 border border-stone-300 text-stone-700 rounded-full font-medium hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Feedback List */}
        {feedbacks.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-600">No feedback yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif text-stone-900">Recent Feedback</h2>
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {feedback.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">{feedback.user_name}</p>
                      <p className="text-sm text-stone-500">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= feedback.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-stone-700 leading-relaxed mb-4">{feedback.comment}</p>
                {feedback.admin_response && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                    <p className="text-sm font-semibold text-amber-900 mb-1">Admin Response:</p>
                    <p className="text-sm text-amber-800">{feedback.admin_response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

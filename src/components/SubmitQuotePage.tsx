import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Quote, Send } from 'lucide-react';

interface SubmitQuotePageProps {
  onBack: () => void;
}

export default function SubmitQuotePage({ onBack }: SubmitQuotePageProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    text: '',
    author: '',
    category: 'motivation',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    'motivation',
    'life',
    'success',
    'love',
    'wisdom',
    'fashion',
    'inspiration',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to submit a quote');
      return;
    }

    if (!formData.text.trim() || !formData.author.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('user_quotes').insert([{
        text: formData.text,
        author: formData.author,
        category: formData.category,
        user_id: user.id,
        user_name: user.name || user.email,
        status: 'pending',
      }]);

      if (error) throw error;

      setSubmitted(true);
      setFormData({ text: '', author: '', category: 'motivation' });
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('Failed to submit quote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <Quote className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-stone-900 mb-2">Login Required</h2>
          <p className="text-stone-600 mb-6">Please login to submit a quote</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4">
            <Send className="w-4 h-4" />
            <span>Share Your Wisdom</span>
          </div>
          <h1 className="text-4xl font-serif text-stone-900 mb-4">
            Submit a Quote
          </h1>
          <p className="text-lg text-stone-600">
            Share an inspiring quote with our community
          </p>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-900 mb-2">
              Quote Submitted Successfully!
            </h3>
            <p className="text-green-700 mb-4">
              Your quote is pending admin approval and will appear once reviewed.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
            >
              Submit Another Quote
            </button>
          </div>
        )}

        {/* Form */}
        {!submitted && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
            <div className="space-y-6">
              {/* Quote Text */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Quote Text *
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Enter the quote text..."
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Who said this quote?"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onBack}
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
                      Submit Quote
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

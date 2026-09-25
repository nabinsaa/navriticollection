import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Quote } from 'lucide-react';

interface QuoteItem {
  id: string;
  text: string;
  author: string;
  category: string;
  created_at: string;
  user_name: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('user_quotes')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(quotes.map(q => q.category)))];
  
  const filteredQuotes = selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-stone-600 font-medium">Loading quotes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4">
            <Quote className="w-4 h-4" />
            <span>Inspiration Collection</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4">
            Read Quotes
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Discover inspiring quotes from our community
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-700 hover:bg-stone-100'
                }`}
              >
                {category === 'all' ? 'All Quotes' : category}
              </button>
            ))}
          </div>
        )}

        {/* Quotes Grid */}
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-16">
            <Quote className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-600">No quotes available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuotes.map((quote) => (
              <div
                key={quote.id}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                      <Quote className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-stone-800 text-lg leading-relaxed mb-4 italic">
                      "{quote.text}"
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-stone-900">— {quote.author}</p>
                        {quote.user_name && (
                          <p className="text-sm text-stone-500">Shared by {quote.user_name}</p>
                        )}
                      </div>
                      {quote.category && (
                        <span className="px-3 py-1 bg-stone-100 text-stone-700 text-xs rounded-full">
                          {quote.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

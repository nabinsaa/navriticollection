import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function QuoteRequestsPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('user_quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_quotes')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
      await loadQuotes();
    } catch (error) {
      console.error('Error approving quote:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_quotes')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      await loadQuotes();
    } catch (error) {
      console.error('Error rejecting quote:', error);
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
        <h2 className="text-2xl font-bold text-stone-900">Quote Requests</h2>
        <p className="text-stone-600 mt-1">{quotes.length} total requests</p>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MessageCircle className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-600">No quote requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <div key={quote.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-stone-900">{quote.user_name}</h3>
                  <p className="text-sm text-stone-600">Category: {quote.category}</p>
                  <p className="text-xs text-stone-500 mt-1">
                    {new Date(quote.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  quote.status === 'approved' ? 'bg-green-100 text-green-700' :
                  quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {quote.status}
                </span>
              </div>
              <p className="text-stone-700 italic mb-4">"{quote.text}"</p>
              <p className="text-sm text-stone-600 mb-4">— {quote.author}</p>
              
              {quote.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(quote.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(quote.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

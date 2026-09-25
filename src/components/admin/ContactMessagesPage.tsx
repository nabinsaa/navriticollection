import { useState, useEffect } from 'react';
import { Mail, Eye, Trash2, CheckCircle, MessageSquare, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  user_id: string | null;
  is_read: boolean;
  is_replied: boolean;
  admin_reply: string | null;
  created_at: string;
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      await loadMessages();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setSendingReply(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ 
          is_replied: true, 
          admin_reply: replyText,
          is_read: true 
        })
        .eq('id', selectedMessage.id);

      if (error) throw error;
      
      setSelectedMessage(null);
      setReplyText('');
      await loadMessages();
      alert('✅ Reply sent successfully!');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('❌ Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'unread') return !msg.is_read;
    if (filter === 'read') return msg.is_read && !msg.is_replied;
    if (filter === 'replied') return msg.is_replied;
    return true;
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto"></div>
          <p className="mt-4 text-stone-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Contact Messages</h2>
          <p className="text-stone-600 mt-1">
            {messages.length} total messages • {unreadCount} unread
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-stone-400" />
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Unread ({messages.filter(m => !m.is_read).length})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'read'
                ? 'bg-green-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Read ({messages.filter(m => m.is_read && !m.is_replied).length})
          </button>
          <button
            onClick={() => setFilter('replied')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'replied'
                ? 'bg-purple-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Replied ({messages.filter(m => m.is_replied).length})
          </button>
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Mail className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-600">No messages found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                !message.is_read ? 'border-blue-500' : 
                message.is_replied ? 'border-purple-500' : 
                'border-green-500'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-stone-900">{message.name}</h3>
                    {!message.is_read && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        New
                      </span>
                    )}
                    {message.is_replied && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                        Replied
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-600">{message.email}</p>
                  {message.subject && (
                    <p className="text-sm font-medium text-stone-700 mt-2">
                      Subject: {message.subject}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">
                    {new Date(message.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-stone-700 mb-4 line-clamp-2">{message.message}</p>

              {message.admin_reply && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-purple-900 mb-1">Your Reply:</p>
                  <p className="text-sm text-purple-800">{message.admin_reply}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.is_read) {
                      handleMarkAsRead(message.id);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                {!message.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(message.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(message.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-stone-900">Message Details</h3>
                <button
                  onClick={() => {
                    setSelectedMessage(null);
                    setReplyText('');
                  }}
                  className="text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Sender Info */}
              <div className="bg-stone-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-stone-600 mb-1">Name</p>
                    <p className="font-medium text-stone-900">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-600 mb-1">Email</p>
                    <a 
                      href={`mailto:${selectedMessage.email}`}
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  {selectedMessage.subject && (
                    <div className="col-span-2">
                      <p className="text-xs text-stone-600 mb-1">Subject</p>
                      <p className="font-medium text-stone-900">{selectedMessage.subject}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-xs text-stone-600 mb-1">Date</p>
                    <p className="font-medium text-stone-900">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-xs text-stone-600 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message
                </p>
                <div className="bg-stone-50 rounded-lg p-4">
                  <p className="text-stone-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Existing Reply */}
              {selectedMessage.admin_reply && (
                <div>
                  <p className="text-xs text-stone-600 mb-2">Your Previous Reply</p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-stone-900 whitespace-pre-wrap">{selectedMessage.admin_reply}</p>
                  </div>
                </div>
              )}

              {/* Reply Form */}
              <div>
                <p className="text-xs text-stone-600 mb-2">
                  {selectedMessage.admin_reply ? 'Send Another Reply' : 'Reply to this message'}
                </p>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={4}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSendReply}
                  disabled={sendingReply || !replyText.trim()}
                  className="flex-1 px-4 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sendingReply ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Reply
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedMessage(null);
                    setReplyText('');
                  }}
                  className="px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

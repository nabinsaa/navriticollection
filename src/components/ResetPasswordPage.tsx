import { useEffect, useState } from 'react';
import { LockKeyhole, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ResetPasswordPage({ onComplete }: { onComplete: () => void }) {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Supabase's browser client consumes the recovery token from the URL hash
    // and establishes the temporary recovery session automatically.
    const timer = window.setTimeout(() => setIsReady(true), 250);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isReady) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const result = await updatePassword(password);
    if (result.success) {
      setSuccess(result.message || 'Your password has been updated.');
    } else {
      setError(result.message || 'Unable to update your password.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="w-14 h-14 rounded-full bg-stone-900 text-white flex items-center justify-center mx-auto mb-5">
          <LockKeyhole className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-stone-900 text-center mb-2">Set a new password</h1>
        <p className="text-sm text-stone-600 text-center mb-6">Choose a new password for your Navriti account.</p>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2"><AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" /><p className="text-sm text-red-600">{error}</p></div>}
        {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex gap-2"><CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0" /><p className="text-sm text-green-700">{success}</p></div>}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">New password</label>
              <input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="At least 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Confirm new password</label>
              <input type="password" minLength={6} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Repeat your password" />
            </div>
            <button type="submit" disabled={isLoading || !isReady} className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50">{isLoading ? 'Updating...' : 'Update Password'}</button>
          </form>
        )}

        {success && <button onClick={onComplete} className="w-full mt-2 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800">Continue to Navriti</button>}
      </div>
    </div>
  );
}

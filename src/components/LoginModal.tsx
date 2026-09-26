import { useState } from 'react';
import { X, ArrowLeft, MailCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'login' | 'signup' | 'forgot';

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, register, resendConfirmation, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  if (!isOpen) return null;

  const resetMessages = () => {
    setError('');
    setSuccess('');
    setShowResend(false);
  };

  const switchMode = (nextMode: Mode) => {
    resetMessages();
    setMode(nextMode);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    const result = await login(email, password);
    if (result.success) {
      onClose();
      setPassword('');
    } else {
      const message = result.message || 'Invalid email or password.';
      setError(message);
      setShowResend(/confirm|verified|verify|email/i.test(message));
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the Terms and Conditions to create an account');
      return;
    }

    setIsLoading(true);
    const result = await register(name, email, password);
    if (result.success) {
      setName('');
      setPassword('');
      setAcceptTerms(false);

      if (result.requiresConfirmation) {
        setSuccess(result.message || 'Account created. Please check your email to confirm your address before signing in.');
        setShowResend(true);
        setMode('login');
      } else {
        onClose();
        setEmail('');
      }
    } else {
      setError(result.message || 'Failed to create account.');
    }
    setIsLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);
    const result = await sendPasswordReset(email);
    if (result.success) {
      setSuccess(result.message || 'Password reset email sent.');
    } else {
      setError(result.message || 'Unable to send password reset email.');
    }
    setIsLoading(false);
  };

  const handleResend = async () => {
    resetMessages();
    setIsLoading(true);
    const result = await resendConfirmation(email);
    if (result.success) setSuccess(result.message || 'Confirmation email sent.');
    else setError(result.message || 'Unable to resend confirmation email.');
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 transition-colors">
          <X className="w-5 h-5 text-stone-600" />
        </button>

        <div className="p-8 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-stone-900 to-stone-700 rounded-full flex items-center justify-center">
              <span className="text-2xl">👗</span>
            </div>
            <div>
              <h2 className="font-serif text-2xl text-stone-900 font-bold">
                {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join Us' : 'Reset Password'}
              </h2>
              <p className="text-sm text-stone-600">
                {mode === 'login' ? 'Sign in to your account' : mode === 'signup' ? 'Create your account' : 'We will send you a secure reset link'}
              </p>
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="flex gap-2 mb-6 p-1 bg-stone-100 rounded-xl">
              <button onClick={() => switchMode('login')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'}`}>Sign In</button>
              <button onClick={() => switchMode('signup')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'signup' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'}`}>Sign Up</button>
            </div>
          )}

          {mode === 'forgot' ? (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="you@example.com" />
              </div>
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-sm text-red-600">{error}</p></div>}
              {success && <div className="p-3 bg-green-50 border border-green-200 rounded-xl"><p className="text-sm text-green-700">{success}</p></div>}
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-all disabled:opacity-50">{isLoading ? 'Please wait...' : 'Send Reset Link'}</button>
              <button type="button" onClick={() => switchMode('login')} className="w-full flex items-center justify-center gap-2 py-2 text-sm text-stone-600 hover:text-stone-900"><ArrowLeft className="w-4 h-4" /> Back to Sign In</button>
            </form>
          ) : (
            <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Your name" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="you@example.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="••••••••" />
              </div>

              {mode === 'login' && <button type="button" onClick={() => switchMode('forgot')} className="text-sm text-amber-700 hover:underline">Forgot password?</button>}

              {mode === 'signup' && (
                <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <input type="checkbox" id="terms-checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1 w-4 h-4 text-amber-600 border-stone-300 rounded focus:ring-amber-500" required />
                  <label htmlFor="terms-checkbox" className="text-sm text-stone-700 leading-relaxed cursor-pointer">I have read and agree to the <span className="text-amber-600 font-medium hover:underline">Terms and Conditions</span> and <span className="text-amber-600 font-medium hover:underline">Privacy Policy</span></label>
                </div>
              )}

              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-sm text-red-600">{error}</p></div>}
              {success && <div className="p-3 bg-green-50 border border-green-200 rounded-xl"><p className="text-sm text-green-700">{success}</p></div>}

              <button type="submit" disabled={isLoading} className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-50">{isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}</button>

              {showResend && mode === 'login' && (
                <button type="button" onClick={handleResend} disabled={isLoading || !email} className="w-full flex items-center justify-center gap-2 py-2 text-sm text-amber-700 hover:text-amber-900 disabled:opacity-50">
                  <MailCheck className="w-4 h-4" /> Resend confirmation email
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

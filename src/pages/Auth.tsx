import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/SEOHead';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset' | 'verify';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'reset' ? 'reset' : 'login';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (mode !== 'reset') {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate('/');
        }
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset');
      } else if (session && mode !== 'reset') {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, mode]);

  const friendlyError = (raw: string): string => {
    const m = raw.toLowerCase();
    if (m.includes('invalid login credentials') || m.includes('invalid_credentials')) {
      return 'Email or password is incorrect. Please try again.';
    }
    if (m.includes('email not confirmed')) {
      return 'Please verify your email address before signing in.';
    }
    if (m.includes('user already registered')) {
      return 'An account with this email already exists. Try signing in instead.';
    }
    if (m.includes('rate limit') || m.includes('too many')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    return raw;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: 'Welcome back', description: 'Logged in successfully' });

      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        setMode('verify');

      } else if (mode === 'forgot') {
        const { error } = await supabase.functions.invoke('reset-password', {
          body: { email },
        });
        if (error) throw error;
        toast({ title: 'Email sent', description: 'Check your inbox for the reset link' });
        setMode('login');

      } else if (mode === 'reset') {
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast({ title: 'Password updated', description: 'You can now sign in with your new password' });
        setMode('login');
      }
    } catch (error: any) {
      setErrorMsg(friendlyError(error.message || 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Sign In';
      case 'signup': return 'Sign Up';
      case 'forgot': return 'Reset Password';
      case 'reset': return 'New Password';
      case 'verify': return 'Check Your Email';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Welcome back to the community';
      case 'signup': return 'Join the natural wine community';
      case 'forgot': return 'Enter your email to receive a reset link';
      case 'reset': return 'Choose a new password for your account';
      case 'verify': return '';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <SEOHead
        title={`${getTitle()} | POURCULTURE`}
        description={getSubtitle()}
      />

      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="text-sm font-bold tracking-tight mb-12 block">
            POURCULTURE
          </Link>

          {(mode === 'forgot' || mode === 'reset') && (
            <button
              onClick={() => setMode('login')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          )}

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            {getTitle()}
          </h1>
          {getSubtitle() && (
            <p className="text-muted-foreground mb-8">
              {getSubtitle()}
            </p>
          )}

          {/* Email Verification Screen */}
          {mode === 'verify' && (
            <div className="space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-4xl">📧</span>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm">
                  We've sent a verification link to
                </p>
                <p className="font-medium">{email}</p>
                <p className="text-sm text-muted-foreground">
                  Click the link in the email to activate your account. Check your spam folder if you don't see it.
                </p>
              </div>
              <div className="space-y-3 pt-4">
                <Button
                  onClick={() => setMode('login')}
                  className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 text-sm tracking-wider"
                >
                  BACK TO SIGN IN
                </Button>
                <button
                  onClick={async () => {
                    try {
                      await supabase.auth.resend({ type: 'signup', email });
                      toast({ title: 'Email resent', description: 'Check your inbox again' });
                    } catch {
                      toast({ title: 'Error', description: 'Failed to resend email', variant: 'destructive' });
                    }
                  }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Didn't receive it? Resend email
                </button>
              </div>
            </div>
          )}

          {mode !== 'verify' && <form onSubmit={handleSubmit} className="space-y-4">
            {mode !== 'reset' && (
              <div>
                <label className="text-[10px] tracking-wider text-muted-foreground mb-2 block">
                  EMAIL
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-foreground/20 bg-transparent h-12"
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <div>
                <label className="text-[10px] tracking-wider text-muted-foreground mb-2 block">
                  PASSWORD
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-foreground/20 bg-transparent h-12"
                />
              </div>
            )}

            {mode === 'reset' && (
              <>
                <div>
                  <label className="text-[10px] tracking-wider text-muted-foreground mb-2 block">
                    NEW PASSWORD
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="border-foreground/20 bg-transparent h-12"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-wider text-muted-foreground mb-2 block">
                    CONFIRM PASSWORD
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="border-foreground/20 bg-transparent h-12"
                  />
                </div>
              </>
            )}

            {errorMsg && (
              <div
                role="alert"
                className="border-2 border-destructive bg-destructive/10 text-destructive px-3 py-2.5 text-sm font-medium"
              >
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 text-sm tracking-wider"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'login' ? 'SIGN IN'
                : mode === 'signup' ? 'SIGN UP'
                : mode === 'forgot' ? 'SEND RESET LINK'
                : 'UPDATE PASSWORD'}
            </Button>
          </form>}

          {mode !== 'verify' && <div className="mt-6 text-center space-y-2">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => setMode('forgot')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors block w-full"
                >
                  Forgot your password?
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Don't have an account? <span className="font-medium text-foreground">Sign up</span>
                </button>
              </>
            )}
            {mode === 'signup' && (
              <button
                onClick={() => setMode('login')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Already have an account? <span className="font-medium text-foreground">Sign in</span>
              </button>
            )}
          </div>}
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-foreground items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-background text-center px-12"
        >
          <span className="text-8xl mb-8 block">🍷</span>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Natural Wine Community
          </h2>
          <p className="text-background/70 max-w-sm mx-auto">
            Discover venues, connect with winemakers, and explore the world of natural wine.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;

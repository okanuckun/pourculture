import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/SEOHead';
import { motion } from 'framer-motion';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: 'Welcome back',
          description: 'Logged in successfully',
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast({
          title: 'Account created',
          description: 'You can now sign in',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <SEOHead 
        title={isLogin ? 'Sign In | POURCULTURE' : 'Sign Up | POURCULTURE'}
        description={isLogin ? 'Sign in to manage your events and registrations' : 'Create an account to manage events and register for upcoming events'}
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
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isLogin ? 'Welcome back to the community' : 'Join the natural wine community'}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 text-sm tracking-wider"
            >
              {loading ? 'Loading...' : isLogin ? 'SIGN IN' : 'SIGN UP'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span className="font-medium text-foreground">{isLogin ? 'Sign up' : 'Sign in'}</span>
            </button>
          </div>
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

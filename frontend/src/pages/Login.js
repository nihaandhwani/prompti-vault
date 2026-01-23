import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(129, 22, 34, 0.05) 0%, rgba(245, 134, 52, 0.05) 100%)' }}>
      <Card className="w-full max-w-md p-8 shadow-xl" data-testid="login-card">
        <div className="flex flex-col items-center mb-8">
          <img 
            src={settings.logo_url} 
            alt={settings.company_name} 
            className="h-16 w-16 object-contain mb-3"
          />
          <h1 className="text-3xl font-bold text-[#811622]" style={{ fontFamily: 'Manrope' }}>Prompti Vault</h1>
          <p className="text-sm text-[#53435B] mt-1">by {settings.company_name}</p>
          <p className="text-[#53435B] mt-2">Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="mt-2"
              data-testid="email-input"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-2"
              data-testid="password-input"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#811622] hover:bg-[#6b1219]"
            disabled={loading}
            data-testid="login-submit-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#53435B]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#F58634] font-semibold hover:underline" data-testid="register-link">
              Register here
            </Link>
          </p>
          <Link to="/" className="text-sm text-[#811622] font-semibold hover:underline block mt-4" data-testid="public-home-link">
            Browse Public Library
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
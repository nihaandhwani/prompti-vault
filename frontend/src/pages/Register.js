import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { BookOpen } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(email, password, name);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(129, 22, 34, 0.05) 0%, rgba(245, 134, 52, 0.05) 100%)' }}>
      <Card className="w-full max-w-md p-8 shadow-xl" data-testid="register-card">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="https://customer-assets.emergentagent.com/job_prompt-forge-125/artifacts/b9zqkf94_Dhwani%20RIS%20Logo.jfif" 
            alt="Dhwani RIS" 
            className="h-16 w-16 object-contain mb-3"
          />
          <h1 className="text-3xl font-bold text-[#811622]" style={{ fontFamily: 'Manrope' }}>Prompti Vault</h1>
          <p className="text-sm text-[#53435B] mt-1">by Dhwani RIS</p>
          <p className="text-[#53435B] mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="mt-2"
              data-testid="name-input"
            />
          </div>

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
            data-testid="register-submit-button"
          >
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#53435B]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#F58634] font-semibold hover:underline" data-testid="login-link">
              Login here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
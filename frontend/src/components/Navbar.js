import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, BookOpen, User } from 'lucide-react';

const Navbar = ({ isPublic = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="flex items-center justify-between">
          <Link to={isPublic ? "/" : "/dashboard"} className="flex items-center gap-3" data-testid="logo-link">
            <img 
              src="https://customer-assets.emergentagent.com/job_prompt-forge-125/artifacts/b9zqkf94_Dhwani%20RIS%20Logo.jfif" 
              alt="Dhwani RIS" 
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-2xl font-bold" style={{ color: '#811622', fontFamily: 'Manrope' }}>
              Prompti Vault
            </h1>
          </Link>

          <div className="flex items-center gap-4">
            {!isPublic && user && (
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#f7e2d1] rounded-lg" data-testid="user-info">
                  <User size={18} className="text-[#811622]" />
                  <span className="font-medium text-[#811622]">{user.name}</span>
                  <span className="text-xs px-2 py-1 bg-white rounded text-[#811622]">{user.role}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="hover:bg-[#f7e2d1]"
                  data-testid="logout-button"
                >
                  <LogOut size={18} />
                </Button>
              </>
            )}
            {isPublic && (
              <Link to="/login" data-testid="login-link">
                <Button className="bg-[#811622] hover:bg-[#6b1219]">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
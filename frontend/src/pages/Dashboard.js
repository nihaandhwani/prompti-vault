import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FolderOpen, Tags, FileText, Settings, Users } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <Navbar />

      <div className="page-header">
        <div className="container">
          <h1 className="text-4xl font-bold text-[#811622]" style={{ fontFamily: 'Manrope' }} data-testid="dashboard-title">
            Welcome, {user?.name}!
          </h1>
          <p className="text-lg text-[#53435B] mt-2">Manage your prompt library</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/author/prompti" data-testid="my-prompti-link">
            <Card className="p-8 hover:shadow-xl transition-all cursor-pointer group">
              <FileText className="text-[#811622] mb-4 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-xl font-bold text-[#811622] mb-2" style={{ fontFamily: 'Manrope' }}>My Prompti</h3>
              <p className="text-[#53435B]">Create and manage your prompt articles</p>
            </Card>
          </Link>

          {user?.role === 'admin' && (
            <>
              <Link to="/admin/categories" data-testid="categories-link">
                <Card className="p-8 hover:shadow-xl transition-all cursor-pointer group">
                  <FolderOpen className="text-[#F58634] mb-4 group-hover:scale-110 transition-transform" size={40} />
                  <h3 className="text-xl font-bold text-[#811622] mb-2" style={{ fontFamily: 'Manrope' }}>Categories</h3>
                  <p className="text-[#53435B]">Manage prompt categories</p>
                </Card>
              </Link>

              <Link to="/admin/tags" data-testid="tags-link">
                <Card className="p-8 hover:shadow-xl transition-all cursor-pointer group">
                  <Tags className="text-[#F58634] mb-4 group-hover:scale-110 transition-transform" size={40} />
                  <h3 className="text-xl font-bold text-[#811622] mb-2" style={{ fontFamily: 'Manrope' }}>Tags</h3>
                  <p className="text-[#53435B]">Manage prompt tags</p>
                </Card>
              </Link>

              <Link to="/admin/users" data-testid="users-link">
                <Card className="p-8 hover:shadow-xl transition-all cursor-pointer group">
                  <Users className="text-[#F58634] mb-4 group-hover:scale-110 transition-transform" size={40} />
                  <h3 className="text-xl font-bold text-[#811622] mb-2" style={{ fontFamily: 'Manrope' }}>Users</h3>
                  <p className="text-[#53435B]">Manage authors and admins</p>
                </Card>
              </Link>
            </>
          )}

          <Link to="/" data-testid="public-library-link">
            <Card className="p-8 hover:shadow-xl transition-all cursor-pointer group bg-[#f7e2d1]">
              <Settings className="text-[#811622] mb-4 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-xl font-bold text-[#811622] mb-2" style={{ fontFamily: 'Manrope' }}>Prompti Vault</h3>
              <p className="text-[#53435B]">View public library</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
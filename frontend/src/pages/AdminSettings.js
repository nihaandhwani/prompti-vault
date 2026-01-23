import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { Settings, Image, Globe, Mail } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const AdminSettings = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    logo_url: '',
    company_name: '',
    company_website: '',
    contact_email: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings`);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(`${API_URL}/settings`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Settings updated successfully! Please refresh to see changes.');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loader"></div>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <Navbar />

      <div className="page-header">
        <div className="container">
          <div className="flex items-center gap-3">
            <Settings className="text-[#811622]" size={40} />
            <div>
              <h1 className="text-4xl font-bold text-[#811622]" style={{ fontFamily: 'Manrope' }}>
                Application Settings
              </h1>
              <p className="text-lg text-[#53435B] mt-2">Configure branding and links</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Image className="text-[#811622]" size={24} />
                  <h2 className="text-2xl font-bold text-[#811622]" style={{ fontFamily: 'Manrope' }}>
                    Branding
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <Input
                      id="logo_url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      required
                      className="mt-2"
                      data-testid="logo-url-input"
                    />
                    <p className="text-sm text-[#53435B] mt-2">
                      Upload your logo to a hosting service and paste the URL here
                    </p>
                  </div>

                  {formData.logo_url && (
                    <div className="mt-4">
                      <Label>Logo Preview</Label>
                      <div className="mt-2 p-4 bg-white border rounded-lg flex items-center gap-4">
                        <img 
                          src={formData.logo_url} 
                          alt="Logo Preview" 
                          className="h-16 w-16 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            toast.error('Invalid logo URL');
                          }}
                        />
                        <span className="text-sm text-[#53435B]">Logo will appear in navbar and footer</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Your Company Name"
                      required
                      className="mt-2"
                      data-testid="company-name-input"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="text-[#F58634]" size={24} />
                  <h2 className="text-2xl font-bold text-[#811622]" style={{ fontFamily: 'Manrope' }}>
                    Footer Links
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company_website">Company Website</Label>
                    <Input
                      id="company_website"
                      type="url"
                      value={formData.company_website}
                      onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                      placeholder="https://yourcompany.com"
                      required
                      className="mt-2"
                      data-testid="website-input"
                    />
                    <p className="text-sm text-[#53435B] mt-2">
                      This will be used in the "Visit {formData.company_name}" link
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Mail className="text-[#53435B]" size={20} />
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        placeholder="contact@yourcompany.com"
                        required
                        className="flex-1"
                        data-testid="email-input"
                      />
                    </div>
                    <p className="text-sm text-[#53435B] mt-2">
                      This will be used in the "Contact Us" link
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-8">
                <Button
                  type="submit"
                  className="w-full bg-[#811622] hover:bg-[#6b1219]"
                  disabled={saving}
                  data-testid="save-settings-button"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
                <p className="text-sm text-[#53435B] text-center mt-3">
                  Changes will be applied after saving and refreshing the page
                </p>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

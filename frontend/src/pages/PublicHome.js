import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { Search, Star, FolderOpen } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const PublicHome = () => {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    fetchCategories();
    fetchPrompts();
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const response = await axios.get(`${API_URL}/public/prompti`, { params });
      setPrompts(response.data);
    } catch (error) {
      toast.error('Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPrompts();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <Navbar isPublic />

      <div className="page-header">
        <div className="container">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src={settings.logo_url} 
              alt={settings.company_name} 
              className="h-16 w-16 object-contain"
            />
            <div>
              <h1 className="text-5xl font-bold text-[#811622]" style={{ fontFamily: 'Manrope' }} data-testid="public-home-title">
                Prompti Vault
              </h1>
              <p className="text-sm text-[#53435B] mt-1">by {settings.company_name}</p>
            </div>
          </div>
          <p className="text-xl text-[#53435B] mb-8">Discover and explore curated prompts for AI models</p>

          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#53435B]" size={20} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prompts by title or content..."
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
              <Button type="submit" className="bg-[#811622] hover:bg-[#6b1219]" data-testid="search-button">
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="container py-12">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0" data-testid="category-sidebar">
            <h3 className="text-lg font-bold text-[#811622] mb-4" style={{ fontFamily: 'Manrope' }}>
              Categories
            </h3>
            <div className="space-y-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'ghost'}
                className={`w-full justify-start ${selectedCategory === null ? 'bg-[#811622] text-white' : ''}`}
                onClick={() => setSelectedCategory(null)}
                data-testid="category-all"
              >
                <FolderOpen size={18} className="mr-2" />
                All Prompts
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'ghost'}
                  className={`w-full justify-start ${selectedCategory === cat.id ? 'bg-[#811622] text-white' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  data-testid={`category-${cat.id}`}
                >
                  <FolderOpen size={18} className="mr-2" />
                  {cat.name}
                </Button>
              ))}
            </div>
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="loader"></div>
            ) : (
              <div className="space-y-6">
                {prompts.map((prompt) => (
                  <Link key={prompt.id} to={`/prompti/${prompt.id}`} data-testid={`prompti-link-${prompt.id}`}>
                    <Card className="p-6 hover:shadow-xl transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-2xl font-bold text-[#811622]" style={{ fontFamily: 'Manrope' }}>
                          {prompt.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[#F58634]">
                          <Star size={20} fill="#F58634" />
                          <span className="font-semibold text-lg">{prompt.average_rating.toFixed(1)}</span>
                          <span className="text-sm text-[#53435B]">({prompt.rating_count})</span>
                        </div>
                      </div>

                      <p className="text-[#53435B] mb-4 line-clamp-2">{prompt.body}</p>

                      <div className="flex items-center gap-4">
                        <Badge className="bg-[#f7e2d1] text-[#811622] hover:bg-[#F58634] hover:text-white">
                          {prompt.category_name}
                        </Badge>
                        {prompt.tag_names.map((tag, idx) => (
                          <span key={idx} className="tag-badge text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 text-sm text-[#53435B]">
                        By {prompt.author_name}
                      </div>
                    </Card>
                  </Link>
                ))}

                {prompts.length === 0 && (
                  <div className="text-center py-12" data-testid="no-prompts">
                    <p className="text-[#53435B] text-lg">No prompts found. Try a different search or category.</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PublicHome;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Edit, Trash2, Eye, EyeOff, Star } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const AuthorPrompts = () => {
  const { token } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await axios.get(`${API_URL}/prompti`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrompts(response.data);
    } catch (error) {
      toast.error('Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prompti?')) return;

    try {
      await axios.delete(`${API_URL}/prompti/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Prompti deleted successfully');
      fetchPrompts();
    } catch (error) {
      toast.error('Failed to delete prompti');
    }
  };

  const togglePublish = async (prompt) => {
    try {
      await axios.put(
        `${API_URL}/prompti/${prompt.id}`,
        { published: !prompt.published },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(prompt.published ? 'Prompti unpublished' : 'Prompti published');
      fetchPrompts();
    } catch (error) {
      toast.error('Failed to update prompti');
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#811622]" style={{ fontFamily: 'Manrope' }}>My Prompti</h1>
              <p className="text-lg text-[#53435B] mt-2">Manage your prompt articles</p>
            </div>
            <Link to="/author/prompti/create">
              <Button className="bg-[#811622] hover:bg-[#6b1219]" data-testid="create-prompti-button">
                <Plus size={20} className="mr-2" />
                Create Prompti
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="space-y-6">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="p-6" data-testid={`prompti-card-${prompt.id}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-[#811622]" style={{ fontFamily: 'Manrope' }}>
                      {prompt.title}
                    </h3>
                    {prompt.published ? (
                      <Badge className="bg-green-500">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>

                  <p className="text-[#53435B] mb-4 line-clamp-2">{prompt.body}</p>

                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm text-[#811622] font-semibold">
                      Category: {prompt.category_name}
                    </span>
                    <div className="flex gap-2">
                      {prompt.tag_names.map((tag, idx) => (
                        <span key={idx} className="tag-badge text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[#F58634]">
                    <Star size={16} fill="#F58634" />
                    <span className="font-semibold">{prompt.average_rating.toFixed(1)}</span>
                    <span className="text-sm text-[#53435B]">({prompt.rating_count} ratings)</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublish(prompt)}
                    data-testid={`toggle-publish-${prompt.id}`}
                  >
                    {prompt.published ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                  <Link to={`/author/prompti/edit/${prompt.id}`}>
                    <Button variant="outline" size="sm" data-testid={`edit-prompti-${prompt.id}`}>
                      <Edit size={16} />
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(prompt.id)}
                    data-testid={`delete-prompti-${prompt.id}`}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {prompts.length === 0 && (
          <div className="text-center py-12" data-testid="no-prompti">
            <p className="text-[#53435B] text-lg mb-4">No prompti yet. Create your first prompti!</p>
            <Link to="/author/prompti/create">
              <Button className="bg-[#811622] hover:bg-[#6b1219]">
                <Plus size={20} className="mr-2" />
                Create Prompti
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorPrompts;
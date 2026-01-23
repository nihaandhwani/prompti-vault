import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const CreatePrompt = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    category_id: '',
    tag_ids: [],
    published: false
  });

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${API_URL}/tags`);
      setTags(response.data);
    } catch (error) {
      toast.error('Failed to fetch tags');
    }
  };

  const handleTagToggle = (tagId) => {
    setFormData((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/prompti`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Prompti created successfully');
      navigate('/author/prompti');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create prompti');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <Navbar />

      <div className="page-header">
        <div className="container">
          <h1 className="text-4xl font-bold text-[#811622]" style={{ fontFamily: 'Manrope' }}>Create Prompti</h1>
          <p className="text-lg text-[#53435B] mt-2">Create a new prompt article</p>
        </div>
      </div>

      <div className="container py-12">
        <Card className="max-w-3xl mx-auto p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter prompti title"
                required
                className="mt-2"
                data-testid="prompti-title-input"
              />
            </div>

            <div>
              <Label htmlFor="body">Prompt Body</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Enter your prompt content here..."
                required
                rows={10}
                className="mt-2"
                data-testid="prompti-body-input"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger className="mt-2" data-testid="category-select">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-2">
                    <Checkbox
                      id={tag.id}
                      checked={formData.tag_ids.includes(tag.id)}
                      onCheckedChange={() => handleTagToggle(tag.id)}
                      data-testid={`tag-checkbox-${tag.id}`}
                    />
                    <label htmlFor={tag.id} className="text-sm cursor-pointer">
                      {tag.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                data-testid="publish-checkbox"
              />
              <Label htmlFor="published" className="cursor-pointer">
                Publish immediately
              </Label>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 bg-[#811622] hover:bg-[#6b1219]"
                disabled={loading}
                data-testid="create-prompti-submit"
              >
                {loading ? 'Creating...' : 'Create Prompti'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/author/prompti')}
                className="flex-1"
                data-testid="cancel-button"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreatePrompt;
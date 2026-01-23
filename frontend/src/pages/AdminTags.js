import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const AdminTags = () => {
  const { token } = useAuth();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${API_URL}/tags`);
      setTags(response.data);
    } catch (error) {
      toast.error('Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTag) {
        await axios.put(`${API_URL}/tags/${editingTag.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Tag updated successfully');
      } else {
        await axios.post(`${API_URL}/tags`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Tag created successfully');
      }

      setFormData({ name: '' });
      setEditingTag(null);
      setIsCreateOpen(false);
      fetchTags();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name });
    setIsCreateOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) return;

    try {
      await axios.delete(`${API_URL}/tags/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Tag deleted successfully');
      fetchTags();
    } catch (error) {
      toast.error('Failed to delete tag');
    }
  };

  const handleDialogClose = (open) => {
    setIsCreateOpen(open);
    if (!open) {
      setEditingTag(null);
      setFormData({ name: '' });
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
              <h1 className="text-4xl font-bold text-[#811622]" style={{ fontFamily: 'Manrope' }}>Tags</h1>
              <p className="text-lg text-[#53435B] mt-2">Manage prompt tags</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button className="bg-[#811622] hover:bg-[#6b1219]" data-testid="create-tag-button">
                  <Plus size={20} className="mr-2" />
                  Add Tag
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="tag-dialog">
                <DialogHeader>
                  <DialogTitle>{editingTag ? 'Edit Tag' : 'Create Tag'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Tag name"
                      required
                      className="mt-2"
                      data-testid="tag-name-input"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#811622] hover:bg-[#6b1219]" data-testid="tag-submit-button">
                    {editingTag ? 'Update' : 'Create'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="flex flex-wrap gap-4">
          {tags.map((tag) => (
            <Card key={tag.id} className="p-4 flex items-center gap-4" data-testid={`tag-card-${tag.id}`}>
              <span className="tag-badge text-lg">{tag.name}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(tag)}
                  data-testid={`edit-tag-${tag.id}`}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(tag.id)}
                  data-testid={`delete-tag-${tag.id}`}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {tags.length === 0 && (
          <div className="text-center py-12" data-testid="no-tags">
            <p className="text-[#53435B] text-lg">No tags yet. Create your first tag!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTags;
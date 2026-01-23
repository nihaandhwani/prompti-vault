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

const AdminCategories = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await axios.put(`${API_URL}/categories/${editingCategory.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category updated successfully');
      } else {
        await axios.post(`${API_URL}/categories`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category created successfully');
      }

      setFormData({ name: '', description: '' });
      setEditingCategory(null);
      setIsCreateOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description });
    setIsCreateOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await axios.delete(`${API_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleDialogClose = (open) => {
    setIsCreateOpen(open);
    if (!open) {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
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
              <h1 className="text-4xl font-bold text-[#811622]" style={{ fontFamily: 'Manrope' }}>Categories</h1>
              <p className="text-lg text-[#53435B] mt-2">Manage prompt categories</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button className="bg-[#811622] hover:bg-[#6b1219]" data-testid="create-category-button">
                  <Plus size={20} className="mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="category-dialog">
                <DialogHeader>
                  <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Category name"
                      required
                      className="mt-2"
                      data-testid="category-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Category description"
                      className="mt-2"
                      data-testid="category-description-input"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#811622] hover:bg-[#6b1219]" data-testid="category-submit-button">
                    {editingCategory ? 'Update' : 'Create'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="p-6" data-testid={`category-card-${category.id}`}>
              <h3 className="text-xl font-bold text-[#811622] mb-2" style={{ fontFamily: 'Manrope' }}>{category.name}</h3>
              <p className="text-[#53435B] mb-4">{category.description || 'No description'}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(category)}
                  className="flex-1"
                  data-testid={`edit-category-${category.id}`}
                >
                  <Edit size={16} className="mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  className="flex-1"
                  data-testid={`delete-category-${category.id}`}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12" data-testid="no-categories">
            <p className="text-[#53435B] text-lg">No categories yet. Create your first category!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Edit, Trash2, LogOut, MessageSquare, Megaphone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'necklace',
    stock: '10',
    size: '',
    image_url: '',
  });
  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    subtitle: '',
    display_order: '0',
  });

  useEffect(() => {
    checkAuth();
    fetchProducts();
    fetchBanners();
    fetchSuggestions();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/admin');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roles) {
      navigate('/admin');
      toast.error('Unauthorized access');
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch products');
    } else {
      setProducts(data || []);
    }
  };

  const fetchBanners = async () => {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast.error('Failed to fetch banners');
    } else {
      setBanners(data || []);
    }
  };

  const fetchSuggestions = async () => {
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch suggestions');
    } else {
      setSuggestions(data || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
    toast.success('Logged out successfully');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        size: formData.size || null,
        image_url: formData.image_url,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success('Product added successfully!');
      }

      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bannerData = {
        title: bannerFormData.title,
        subtitle: bannerFormData.subtitle || null,
        display_order: parseInt(bannerFormData.display_order),
        is_active: true,
      };

      if (editingBanner) {
        const { error } = await supabase
          .from('banners')
          .update(bannerData)
          .eq('id', editingBanner.id);

        if (error) throw error;
        toast.success('Banner updated successfully!');
      } else {
        const { error } = await supabase
          .from('banners')
          .insert([bannerData]);

        if (error) throw error;
        toast.success('Banner added successfully!');
      }

      setBannerDialogOpen(false);
      resetBannerForm();
      fetchBanners();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save banner');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      size: product.size || '',
      image_url: product.image_url || '',
    });
    setDialogOpen(true);
  };

  const handleEditBanner = (banner: any) => {
    setEditingBanner(banner);
    setBannerFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      display_order: banner.display_order.toString(),
    });
    setBannerDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Banner deleted successfully!');
      fetchBanners();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete banner');
    }
  };

  const handleDeleteSuggestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this suggestion?')) return;

    try {
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Suggestion deleted successfully!');
      fetchSuggestions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete suggestion');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'necklace',
      stock: '10',
      size: '',
      image_url: '',
    });
    setEditingProduct(null);
  };

  const resetBannerForm = () => {
    setBannerFormData({
      title: '',
      subtitle: '',
      display_order: '0',
    });
    setEditingBanner(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard - Harsh Adornments</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Product Management</h2>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="btn-gold">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          required
                        >
                          <option value="necklace">Necklace</option>
                          <option value="earrings">Earrings</option>
                          <option value="bangles">Bangles</option>
                          <option value="rings">Rings</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="size">Size (Optional)</Label>
                        <Input
                          id="size"
                          value={formData.size}
                          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                          placeholder="e.g. Free Size, S, M, L"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="image_url">Image URL</Label>
                      <Input
                        id="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full btn-gold" disabled={loading}>
                      {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
                    {product.size && <p className="text-sm text-muted-foreground">Size: {product.size}</p>}
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary mb-2">
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">Stock: {product.stock}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">No products yet. Add your first product!</p>
              </div>
            )}
          </TabsContent>

          {/* Banners Tab */}
          <TabsContent value="banners">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold">Banner Management</h2>
                <p className="text-muted-foreground mt-2">Manage animated cards shown above the category section</p>
              </div>
              <Dialog open={bannerDialogOpen} onOpenChange={(open) => {
                setBannerDialogOpen(open);
                if (!open) resetBannerForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="btn-gold">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Banner
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleBannerSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="banner-title">Title</Label>
                      <Input
                        id="banner-title"
                        value={bannerFormData.title}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                        placeholder="e.g. Sale of the Day"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="banner-subtitle">Subtitle (Optional)</Label>
                      <Input
                        id="banner-subtitle"
                        value={bannerFormData.subtitle}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })}
                        placeholder="e.g. Up to 50% OFF"
                      />
                    </div>

                    <div>
                      <Label htmlFor="banner-order">Display Order</Label>
                      <Input
                        id="banner-order"
                        type="number"
                        value={bannerFormData.display_order}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, display_order: e.target.value })}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
                    </div>

                    <Button type="submit" className="w-full btn-gold" disabled={loading}>
                      {loading ? 'Saving...' : editingBanner ? 'Update Banner' : 'Add Banner'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => (
                <Card key={banner.id}>
                  <CardHeader>
                    <div className="flex gap-2 items-start mb-2">
                      <Megaphone className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{banner.title}</CardTitle>
                        {banner.subtitle && (
                          <p className="text-sm text-muted-foreground mt-1">{banner.subtitle}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Order: {banner.display_order}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEditBanner(banner)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleDeleteBanner(banner.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {banners.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">No banners yet. Add your first banner!</p>
              </div>
            )}
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Customer Suggestions</h2>
              <p className="text-muted-foreground mt-2">Messages from customers via the contact form</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardHeader>
                    <div className="flex gap-2 items-start mb-2">
                      <MessageSquare className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{suggestion.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{suggestion.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(suggestion.created_at).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4 whitespace-pre-wrap">{suggestion.message}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleDeleteSuggestion(suggestion.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {suggestions.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">No suggestions yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
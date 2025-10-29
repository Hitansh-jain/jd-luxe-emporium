import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Edit, Trash2, LogOut, MessageSquare, Megaphone, Upload, X, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logo from "@/assets/logo.png";

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
  const [uploadingImage, setUploadingImage] = useState(false);
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
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, GIF, WEBP, or SVG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Professional Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border/50 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3 sm:gap-4">
              <img src={logo} alt="Logo" className="h-8 w-auto sm:h-10 object-contain" />
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Admin Portal</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Manage your store</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="gap-2 text-sm sm:text-base min-h-[44px]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <Tabs defaultValue="products" className="w-full space-y-6 sm:space-y-8">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50">
            <TabsTrigger value="products" className="text-sm sm:text-base py-2.5 sm:py-3 min-h-[44px]">
              <ImageIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Products</span>
              <span className="sm:hidden">Items</span>
            </TabsTrigger>
            <TabsTrigger value="banners" className="text-sm sm:text-base py-2.5 sm:py-3 min-h-[44px]">
              <Megaphone className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Banners</span>
              <span className="sm:hidden">Ads</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="text-sm sm:text-base py-2.5 sm:py-3 min-h-[44px]">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Suggestions</span>
              <span className="sm:hidden">Msgs</span>
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Products</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage your inventory and listings</p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="btn-gold w-full sm:w-auto min-h-[44px]">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-base">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-base">Price (₹) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stock" className="text-base">Stock *</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          required
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-base">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="necklace">Necklace</SelectItem>
                            <SelectItem value="earrings">Earrings</SelectItem>
                            <SelectItem value="bangles">Bangles</SelectItem>
                            <SelectItem value="rings">Rings</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="size" className="text-base">Size</Label>
                        <Input
                          id="size"
                          value={formData.size}
                          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                          placeholder="e.g. Free Size, S, M, L"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base">Product Image *</Label>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <label className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="image-upload"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full h-11"
                              onClick={() => document.getElementById('image-upload')?.click()}
                              disabled={uploadingImage}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              {uploadingImage ? 'Uploading...' : 'Upload Image'}
                            </Button>
                          </label>
                          <span className="text-sm text-muted-foreground self-center">or</span>
                          <Input
                            type="url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="Paste image URL"
                            className="flex-1 h-11"
                          />
                        </div>
                        {formData.image_url && (
                          <div className="relative">
                            <img
                              src={formData.image_url}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => setFormData({ ...formData, image_url: '' })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button type="submit" className="w-full btn-gold h-11 text-base" disabled={loading || uploadingImage}>
                      {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-border/50">
                  <CardHeader className="p-4">
                    <div className="relative overflow-hidden rounded-lg mb-3">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardTitle className="text-base sm:text-lg line-clamp-1">{product.name}</CardTitle>
                    <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-muted-foreground">
                      <span className="capitalize">{product.category}</span>
                      {product.size && <span>• Size: {product.size}</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xl sm:text-2xl font-bold text-primary mb-2">
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">Stock: {product.stock}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 min-h-[44px]"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 min-h-[44px]"
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
              <div className="text-center py-20 px-4">
                <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">No products yet</p>
                <p className="text-sm text-muted-foreground mt-2">Add your first product to get started</p>
              </div>
            )}
          </TabsContent>

          {/* Banners Tab */}
          <TabsContent value="banners" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Banners</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage promotional cards on homepage</p>
              </div>
              <Dialog open={bannerDialogOpen} onOpenChange={(open) => {
                setBannerDialogOpen(open);
                if (!open) resetBannerForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="btn-gold w-full sm:w-auto min-h-[44px]">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Banner
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl">
                      {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleBannerSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-base">Title *</Label>
                      <Input
                        id="title"
                        value={bannerFormData.title}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                        required
                        className="h-11"
                        placeholder="e.g. Sale of the Day"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subtitle" className="text-base">Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={bannerFormData.subtitle}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })}
                        className="h-11"
                        placeholder="e.g. Up to 50% Off"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="display_order" className="text-base">Display Order *</Label>
                      <Input
                        id="display_order"
                        type="number"
                        value={bannerFormData.display_order}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, display_order: e.target.value })}
                        required
                        className="h-11"
                        placeholder="0"
                      />
                      <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                    </div>

                    <Button type="submit" className="w-full btn-gold h-11 text-base" disabled={loading}>
                      {loading ? 'Saving...' : editingBanner ? 'Update Banner' : 'Add Banner'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {banners.map((banner) => (
                <Card key={banner.id} className="hover:shadow-xl transition-all duration-300 border-border/50">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base sm:text-lg">{banner.title}</CardTitle>
                    {banner.subtitle && (
                      <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground mb-4">Order: {banner.display_order}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 min-h-[44px]"
                        onClick={() => handleEditBanner(banner)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 min-h-[44px]"
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
              <div className="text-center py-20 px-4">
                <Megaphone className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">No banners yet</p>
                <p className="text-sm text-muted-foreground mt-2">Add your first promotional banner</p>
              </div>
            )}
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Customer Suggestions</h2>
              <p className="text-sm text-muted-foreground mt-1">View and manage customer feedback</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="hover:shadow-lg transition-all duration-300 border-border/50">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg mb-2">{suggestion.name}</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
                          <a href={`mailto:${suggestion.email}`} className="hover:text-primary break-all">
                            {suggestion.email}
                          </a>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-xs sm:text-sm">
                            {new Date(suggestion.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="min-h-[44px] sm:min-h-0"
                        onClick={() => handleDeleteSuggestion(suggestion.id)}
                      >
                        <Trash2 className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap break-words">{suggestion.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {suggestions.length === 0 && (
              <div className="text-center py-20 px-4">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">No suggestions yet</p>
                <p className="text-sm text-muted-foreground mt-2">Customer feedback will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;

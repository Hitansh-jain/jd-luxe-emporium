import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, LogOut, MessageSquare, Megaphone, Upload, X, ImageIcon, Sparkles, ArrowLeft, Mail, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Order status updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

// Replace your handleLogout function with this:

const [loggingOut, setLoggingOut] = useState(false);

const handleLogout = async () => {
  if (loggingOut) return; // Prevent multiple clicks

  setLoggingOut(true);

  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      throw error;
    }

    // Show success message
    toast.success('Logged out successfully');

    // Small delay to ensure session is cleared
    await new Promise(resolve => setTimeout(resolve, 100));

    // Navigate to login page with replace to prevent back navigation
    navigate('/admin/login', { replace: true });
  } catch (error: any) {
    console.error('Logout failed:', error);
    toast.error(error.message || 'Failed to logout');
    setLoggingOut(false);
  }
};

  useEffect(() => {
    checkAdminAuth();
    fetchData();
  }, []);

  const checkAdminAuth = async () => {
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
    }
  };

  const fetchData = async () => {
    // Fetch Products
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (productsData) setProducts(productsData);

    // Fetch Banners
    const { data: bannersData } = await supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true });
    if (bannersData) setBanners(bannersData);

    // Fetch Suggestions
    const { data: suggestionsData } = await supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false });
    if (suggestionsData) setSuggestions(suggestionsData);

    // Fetch Orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (ordersData) setOrders(ordersData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setTimeout(() => {
      const mockUrl = URL.createObjectURL(file);
      setFormData({ ...formData, image_url: mockUrl });
      setUploadingImage(false);
      toast.success('Image uploaded successfully!');
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
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
      fetchData();
    } catch (error) {
      toast.error('Failed to save product');
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
      fetchData();
    } catch (error) {
      toast.error('Failed to save banner');
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
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
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
      fetchData();
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  const handleDeleteSuggestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Message deleted successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete message');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-amber-200/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full"></div>
                <div className="relative h-12 w-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  J
                </div>
              </div>
              <div className="border-l border-amber-300 pl-4">
                <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 bg-clip-text text-transparent">
                  Admin Atelier
                </h1>
                <p className="text-xs tracking-wide text-slate-600 font-light">JEWELRY MANAGEMENT</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="gap-2 border-amber-300 hover:bg-amber-50 hover:border-amber-400 transition-all min-h-[44px]"
              >
                <ArrowLeft className="h-4 w-4 text-amber-700" />
                <span className="hidden sm:inline text-slate-700">Back</span>
              </Button>
             <Button
  variant="outline"
  onClick={handleLogout}
  disabled={loggingOut}
  className="gap-2 border-amber-300 hover:bg-amber-50 hover:border-amber-400 transition-all min-h-[44px]"
>
  <LogOut className="h-4 w-4 text-amber-700" />
  <span className="hidden sm:inline text-slate-700">
    {loggingOut ? 'Logging out...' : 'Logout'}
  </span>
</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Tabs defaultValue="products" className="w-full space-y-8">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1.5 bg-white/60 backdrop-blur-sm border border-amber-200/50 shadow-sm">
            <TabsTrigger value="products" className="text-sm sm:text-base py-3 min-h-[44px] data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-amber-50 data-[state=active]:text-amber-900 data-[state=active]:shadow-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Products</span>
              <span className="sm:hidden">Items</span>
            </TabsTrigger>
            <TabsTrigger value="banners" className="text-sm sm:text-base py-3 min-h-[44px] data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-amber-50 data-[state=active]:text-amber-900 data-[state=active]:shadow-sm font-medium">
              <Megaphone className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Banners</span>
              <span className="sm:hidden">Ads</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="text-sm sm:text-base py-3 min-h-[44px] data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-amber-50 data-[state=active]:text-amber-900 data-[state=active]:shadow-sm font-medium">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Messages</span>
              <span className="sm:hidden">Msgs</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-sm sm:text-base py-3 min-h-[44px] data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-amber-50 data-[state=active]:text-amber-900 data-[state=active]:shadow-sm font-medium">
              <ImageIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Orders</span>
              <span className="sm:hidden">Orders</span>
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50">
              <div>
                <h2 className="text-3xl font-serif font-bold text-slate-800">Collection</h2>
                <p className="text-sm text-slate-600 mt-1 font-light tracking-wide">Curate your exquisite pieces</p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto min-h-[44px] bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg shadow-amber-600/30 hover:shadow-xl hover:shadow-amber-700/40 transition-all font-medium">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-amber-200">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-serif text-slate-800">
                      {editingProduct ? 'Edit Product' : 'New Product'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base font-medium text-slate-700">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-12 border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                        placeholder="Enter product name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-base font-medium text-slate-700">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="resize-none border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                        placeholder="Describe your product..."
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-base font-medium text-slate-700">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                          className="h-12 border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stock" className="text-base font-medium text-slate-700">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          required
                          className="h-12 border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                          placeholder="10"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-base font-medium text-slate-700">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                          <SelectTrigger className="h-12 border-amber-200 focus:border-amber-400 focus:ring-amber-400">
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
                        <Label htmlFor="size" className="text-base font-medium text-slate-700">Size</Label>
                        <Input
                          id="size"
                          value={formData.size}
                          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                          placeholder="Free Size, S, M, L"
                          className="h-12 border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium text-slate-700">Product Image</Label>
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
                              className="w-full h-12 border-amber-200 hover:bg-amber-50 hover:border-amber-400"
                              onClick={() => document.getElementById('image-upload')?.click()}
                              disabled={uploadingImage}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              {uploadingImage ? 'Uploading...' : 'Upload Image'}
                            </Button>
                          </label>
                          <span className="text-sm text-slate-500 self-center font-light">or</span>
                          <Input
                            type="url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="Paste image URL"
                            className="flex-1 h-12 border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                          />
                        </div>
                        {formData.image_url && (
                          <div className="relative rounded-xl overflow-hidden border border-amber-200">
                            <img
                              src={formData.image_url}
                              alt="Preview"
                              className="w-full h-64 object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-3 right-3 shadow-lg"
                              onClick={() => setFormData({ ...formData, image_url: '' })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg shadow-amber-600/30 font-medium"
                      disabled={loading || uploadingImage}
                    >
                      {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border border-amber-200/50 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden aspect-square">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-5">
                    <CardTitle className="text-lg font-serif text-slate-800 line-clamp-1 mb-2">{product.name}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 font-light">
                      <span className="capitalize px-2 py-1 bg-amber-50 rounded-full text-amber-700">{product.category}</span>
                      {product.size && <span>• {product.size}</span>}
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-amber-600 bg-clip-text text-transparent">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 font-light">Stock: {product.stock} units</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 min-h-[44px] border-amber-300 hover:bg-amber-50 hover:border-amber-400 text-amber-700 hover:text-amber-800"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 min-h-[44px] border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700"
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
              <div className="text-center py-20 px-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-amber-200/50">
                <Sparkles className="h-20 w-20 mx-auto text-amber-400 mb-4" />
                <p className="text-2xl font-serif text-slate-700 mb-2">Your collection awaits</p>
                <p className="text-sm text-slate-500 font-light">Add your first exquisite piece</p>
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50">
              <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4">Orders</h2>
              {orders.length === 0 ? (
                <p className="text-slate-600">No orders yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-600">
                        <th className="py-3 pr-4">Date</th>
                        <th className="py-3 pr-4">Customer</th>
                        <th className="py-3 pr-4">Phone</th>
                        <th className="py-3 pr-4">Total (₹)</th>
                        <th className="py-3 pr-4">Items</th>
                        <th className="py-3 pr-4">Address</th>
                        <th className="py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-t border-amber-200/50 align-top">
                          <td className="py-3 pr-4 whitespace-nowrap">{new Date(o.created_at).toLocaleString()}</td>
                          <td className="py-3 pr-4 font-medium">{o.customer_name}</td>
                          <td className="py-3 pr-4">{o.customer_phone}</td>
                          <td className="py-3 pr-4 font-semibold">{(o.total_amount || 0).toLocaleString('en-IN')}</td>
                          <td className="py-3 pr-4">
                            <ul className="list-disc pl-5 space-y-1">
                              {(Array.isArray(o.products) ? o.products : []).map((p: any, idx: number) => (
                                <li key={idx}>{p.name} × {p.quantity} — ₹{p.price}</li>
                              ))}
                            </ul>
                          </td>
                          <td className="py-3 pr-4 max-w-[300px] break-words">{o.customer_address}</td>
                          <td className="py-3">
                            <Select
                              value={o.status || 'pending'}
                              onValueChange={(value) => updateOrderStatus(o.id, value)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="packed">Packed</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Banners Tab */}
          <TabsContent value="banners" className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50">
              <div>
                <h2 className="text-3xl font-serif font-bold text-slate-800">Promotions</h2>
                <p className="text-sm text-slate-600 mt-1 font-light tracking-wide">Showcase your featured collections</p>
              </div>
              <Dialog open={bannerDialogOpen} onOpenChange={(open) => {
                setBannerDialogOpen(open);
                if (!open) resetBannerForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto min-h-[44px] bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg shadow-amber-600/30 hover:shadow-xl hover:shadow-amber-700/40 transition-all font-medium">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Banner
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-amber-200">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-serif text-slate-800">
                      {editingBanner ? 'Edit Banner' : 'New Banner'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleBannerSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-base font-medium text-slate-700">Title</Label>
                      <Input
                        id="title"
                        value={bannerFormData.title}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                        required
                        className="h-12 border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                        placeholder="Sale of the Day"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subtitle" className="text-base font-medium text-slate-700">Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={bannerFormData.subtitle}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })}
                        className="h-12 border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                        placeholder="Up to 50% Off"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="display_order" className="text-base font-medium text-slate-700">Display Order</Label>
                      <Input
                        id="display_order"
                        type="number"
                        value={bannerFormData.display_order}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, display_order: e.target.value })}
                        required
                        className="h-12 border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                        placeholder="0"
                      />
                      <p className="text-xs text-slate-500 font-light">Lower numbers appear first</p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : editingBanner ? 'Update Banner' : 'Add Banner'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => (
                <Card key={banner.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-amber-200/50 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-serif font-bold text-slate-800">{banner.title}</h3>
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                          Order: {banner.display_order}
                        </span>
                      </div>
                      {banner.subtitle && (
                        <p className="text-slate-600 text-sm">{banner.subtitle}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 min-h-[44px] border-amber-300 hover:bg-amber-50 hover:border-amber-400 text-amber-700"
                        onClick={() => handleEditBanner(banner)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 min-h-[44px] border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600"
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
              <div className="text-center py-20 px-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-amber-200/50">
                <Megaphone className="h-20 w-20 mx-auto text-amber-400 mb-4" />
                <p className="text-2xl font-serif text-slate-700 mb-2">No banners yet</p>
                <p className="text-sm text-slate-500 font-light">Create promotional banners for your store</p>
              </div>
            )}
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-slate-800">Customer Messages</h2>
                  <p className="text-sm text-slate-600 mt-1 font-light tracking-wide">
                    Suggestions and feedback from customers
                  </p>
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  {suggestions.length} {suggestions.length === 1 ? 'message' : 'messages'}
                </div>
              </div>

              {suggestions.length === 0 ? (
                <div className="text-center py-16">
                  <MessageSquare className="h-16 w-16 mx-auto text-amber-400 mb-3" />
                  <p className="text-lg text-slate-600 font-medium">No messages yet</p>
                  <p className="text-sm text-slate-500 mt-1">Customer feedback will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="border border-amber-200/50 bg-white/60 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-amber-100 p-2 rounded-full">
                                <User className="h-4 w-4 text-amber-700" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-800">{suggestion.name}</h4>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                  <Mail className="h-3 w-3" />
                                  <a href={`mailto:${suggestion.email}`} className="hover:text-amber-600 transition-colors">
                                    {suggestion.email}
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                              <p className="text-slate-700 whitespace-pre-wrap">{suggestion.message}</p>
                            </div>
                            <div className="text-xs text-slate-400">
                              {new Date(suggestion.created_at).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[44px] min-w-[44px]"
                            onClick={() => handleDeleteSuggestion(suggestion.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
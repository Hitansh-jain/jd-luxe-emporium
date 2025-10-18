import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";

const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  phone: z.string().trim().regex(/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"),
  email: z.string().trim().email("Please enter a valid email").optional().or(z.literal('')),
  fullAddress: z.string().trim().min(5, "Please enter your full address").max(200, "Address is too long"),
  pinCode: z.string().trim().regex(/^[0-9]{6}$/, "Please enter a valid 6-digit PIN code"),
  city: z.string().trim().min(2, "City is required").max(50, "City name is too long"),
  district: z.string().trim().min(2, "District is required").max(50, "District name is too long"),
  state: z.string().trim().min(2, "State is required").max(50, "State name is too long"),
});

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const singleProductId = searchParams.get('product');
  
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    fullAddress: '',
    pinCode: '',
    city: '',
    district: '',
    state: '',
  });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      const currentPath = `/checkout${singleProductId ? `?product=${singleProductId}` : ''}`;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    
    setUser(user);
    
    // Load user profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.full_name || '',
        email: profile.email || user.email || '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
      }));
    }
    
    loadCheckoutData();
  };

  const loadCheckoutData = async () => {
    if (singleProductId) {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', singleProductId)
        .single();
      
      if (product) {
        setProducts([{ ...product, quantity: 1 }]);
      }
    } else {
      const sessionId = getOrCreateSessionId();
      const cartItems = JSON.parse(localStorage.getItem(`cart_${sessionId}`) || '[]');
      if (cartItems.length === 0) {
        navigate('/cart');
        return;
      }
      setProducts(cartItems);
    }
  };

  const getOrCreateSessionId = () => {
    let sessionId = localStorage.getItem('shopping_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('shopping_session_id', sessionId);
    }
    return sessionId;
  };

  const getTotalAmount = () => {
    const subtotal = products.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal >= 2000 ? 0 : 100;
    return subtotal + shipping;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      checkoutSchema.parse(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error('Please fix the errors in the form');
        return;
      }
    }

    setLoading(true);

    try {
      const fullAddress = `${formData.fullAddress}, ${formData.city}, ${formData.district}, ${formData.state}, ${formData.pinCode}`;
      
      const orderDetails = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        customerAddress: fullAddress,
        products: products.map(p => ({
          name: p.name,
          price: p.price,
          quantity: p.quantity
        })),
        totalAmount: getTotalAmount()
      };

      const { error: dbError } = await supabase
        .from('orders')
        .insert({
          customer_name: orderDetails.customerName,
          customer_phone: orderDetails.customerPhone,
          customer_email: orderDetails.customerEmail,
          customer_address: orderDetails.customerAddress,
          products: orderDetails.products,
          total_amount: orderDetails.totalAmount
        });

      if (dbError) throw dbError;

      const { data, error } = await supabase.functions.invoke('send-whatsapp-order', {
        body: { orderDetails }
      });

      if (error) throw error;

      if (!singleProductId) {
        const sessionId = getOrCreateSessionId();
        localStorage.removeItem(`cart_${sessionId}`);
        window.dispatchEvent(new Event('cartUpdated'));
      }

      toast.success('Order placed successfully!');
      
      if (data?.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
      }

      setTimeout(() => navigate('/'), 2000);

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || products.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Customer Details Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      required
                    />
                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="fullAddress">Full Address *</Label>
                    <Input
                      id="fullAddress"
                      name="fullAddress"
                      value={formData.fullAddress}
                      onChange={handleInputChange}
                      placeholder="House/Flat No., Street, Area"
                      required
                    />
                    {errors.fullAddress && <p className="text-sm text-destructive mt-1">{errors.fullAddress}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        required
                      />
                      {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <Label htmlFor="district">District *</Label>
                      <Input
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        placeholder="District"
                        required
                      />
                      {errors.district && <p className="text-sm text-destructive mt-1">{errors.district}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        required
                      />
                      {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
                    </div>

                    <div>
                      <Label htmlFor="pinCode">PIN Code *</Label>
                      <Input
                        id="pinCode"
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleInputChange}
                        placeholder="6-digit PIN"
                        required
                      />
                      {errors.pinCode && <p className="text-sm text-destructive mt-1">{errors.pinCode}</p>}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full btn-gold"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {products.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-border">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-primary font-bold">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}

                <div className="space-y-2 pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{products.reduce((t, i) => t + (i.price * i.quantity), 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{getTotalAmount() - products.reduce((t, i) => t + (i.price * i.quantity), 0) === 0 ? 'FREE' : '₹100'}</span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">₹{getTotalAmount().toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 text-sm text-muted-foreground space-y-1">
                  <p>• Cash on Delivery available</p>
                  <p>• Delivery within 5-7 business days</p>
                  <p>• Order details will be sent via WhatsApp</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
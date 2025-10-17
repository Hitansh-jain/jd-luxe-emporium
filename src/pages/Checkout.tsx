import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";

const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  phone: z.string().trim().regex(/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"),
  email: z.string().trim().email("Please enter a valid email").optional().or(z.literal('')),
  address: z.string().trim().min(10, "Please enter a complete address").max(500, "Address is too long"),
});

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const singleProductId = searchParams.get('product');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCheckoutData();
  }, [singleProductId]);

  const loadCheckoutData = async () => {
    if (singleProductId) {
      // Buy Now - single product
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', singleProductId)
        .single();
      
      if (product) {
        setProducts([{ ...product, quantity: 1 }]);
      }
    } else {
      // Cart checkout
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
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
    
    // Validate form
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
      const orderDetails = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        customerAddress: formData.address,
        products: products.map(p => ({
          name: p.name,
          price: p.price,
          quantity: p.quantity
        })),
        totalAmount: getTotalAmount()
      };

      // Save order to database
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

      // Send WhatsApp notification
      const { data, error } = await supabase.functions.invoke('send-whatsapp-order', {
        body: { orderDetails }
      });

      if (error) throw error;

      // Clear cart if not single product purchase
      if (!singleProductId) {
        const sessionId = getOrCreateSessionId();
        localStorage.removeItem(`cart_${sessionId}`);
        window.dispatchEvent(new Event('cartUpdated'));
      }

      toast.success('Order placed successfully!');
      
      // Open WhatsApp with the message
      if (data?.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
      }

      // Navigate to success page or home
      setTimeout(() => navigate('/'), 2000);

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (products.length === 0) {
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
                    <Label htmlFor="address">Complete Address *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="House/Flat No., Street, Area, City, State, PIN"
                      rows={4}
                      required
                    />
                    {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
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
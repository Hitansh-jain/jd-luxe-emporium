import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    loadCart();
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  const loadCart = () => {
    const sessionId = getOrCreateSessionId();
    const items = JSON.parse(localStorage.getItem(`cart_${sessionId}`) || '[]');
    setCartItems(items);
  };

  const getOrCreateSessionId = () => {
    let sessionId = localStorage.getItem('shopping_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('shopping_session_id', sessionId);
    }
    return sessionId;
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const sessionId = getOrCreateSessionId();
    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedItems);
    localStorage.setItem(`cart_${sessionId}`, JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (itemId: string) => {
    const sessionId = getOrCreateSessionId();
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    
    setCartItems(updatedItems);
    localStorage.setItem(`cart_${sessionId}`, JSON.stringify(updatedItems));
    toast.success('Item removed from cart');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover our stunning collection and add items to your cart
          </p>
          <Link to="/products">
            <Button size="lg" className="btn-gold">
              Explore Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <Link to="/products">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 capitalize">{item.category}</p>
                      <p className="text-xl font-bold text-primary">
                        ₹{item.price.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-bold">Order Summary</h2>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{getTotalPrice().toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{getTotalPrice() >= 2000 ? 'FREE' : '₹100'}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        ₹{(getTotalPrice() + (getTotalPrice() >= 2000 ? 0 : 100)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full btn-gold"
                  size="lg"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
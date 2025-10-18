import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  description?: string;
}

const ProductCard = ({ id, name, price, image_url, category, description }: ProductCardProps) => {
  const addToCart = () => {
    const sessionId = getOrCreateSessionId();
    const cartItems = JSON.parse(localStorage.getItem(`cart_${sessionId}`) || '[]');
    
    const existingItemIndex = cartItems.findIndex((item: any) => item.id === id);
    
    if (existingItemIndex > -1) {
      cartItems[existingItemIndex].quantity += 1;
    } else {
      cartItems.push({ id, name, price, image_url, quantity: 1, category });
    }
    
    localStorage.setItem(`cart_${sessionId}`, JSON.stringify(cartItems));
    toast.success('Added to cart!');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const getOrCreateSessionId = () => {
    let sessionId = localStorage.getItem('shopping_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('shopping_session_id', sessionId);
    }
    return sessionId;
  };

  return (
    <Card className="group overflow-hidden hover:shadow-[0_12px_40px_-10px_hsl(30_20%_15%_/_0.2)] transition-all duration-400">
      <Link to={`/product/${id}`}>
        <div className="relative overflow-hidden bg-secondary/30 aspect-square">
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-background/80 hover:bg-background"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </Link>
      
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{category}</p>
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>
        {description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{description}</p>
        )}
        <p className="text-xl font-bold text-primary mt-2">₹{price.toLocaleString('en-IN')}</p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          onClick={addToCart}
          variant="outline"
          className="flex-1"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
        <Link to={`/checkout?product=${id}`} className="flex-1">
          <Button className="w-full btn-gold">
            Buy Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
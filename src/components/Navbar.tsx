import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, User, LogIn, LogOut, Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadCartCount();
    const handleUpdate = () => loadCartCount();
    window.addEventListener('cartUpdated', handleUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleUpdate);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const loadCartCount = () => {
    const sessionId = getOrCreateSessionId();
    const cartItems = JSON.parse(localStorage.getItem(`cart_${sessionId}`) || '[]');
    setCartCount(cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0));
  };

  const getOrCreateSessionId = () => {
    let sessionId = localStorage.getItem('shopping_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('shopping_session_id', sessionId);
    }
    return sessionId;
  };

  const NavLinks = () => (
    <>
      <Link to="/" className="hover:text-primary transition-colors">Home</Link>
      <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
      <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
<img
  src={logo}
  alt="Harsh Kangan Store logo"
  className="max-h-14 w-auto object-contain md:max-h-16"
/>

            <div className="hidden sm:block">
              <p className="text-xl md:text-2xl font-serif font-bold tracking-wide bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
                Harsh Kangan Store
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLinks />
          </div>

          <div className="flex items-center space-x-4">
            {userRole === 'admin' && (
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/saved')}>
                    <Heart className="h-4 w-4 mr-2" />
                    Saved Products
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/track-order')}>
                    <Package className="h-4 w-4 mr-2" />
                    Track Order
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" className="hidden md:block">
                <Button variant="outline" size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
            
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks />
                  {user ? (
                    <>
                      <Link to="/profile" className="hover:text-primary transition-colors">Profile</Link>
                      <Link to="/saved" className="hover:text-primary transition-colors">Saved Products</Link>
                      <Link to="/track-order" className="hover:text-primary transition-colors">Track Order</Link>
                      <Button variant="outline" className="w-full mt-2" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Link to="/login" className="mt-2">
                      <Button variant="outline" className="w-full">
                        <LogIn className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
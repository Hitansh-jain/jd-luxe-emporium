import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-jewelry.jpg";
import necklace1 from "@/assets/necklace-1.jpg";
import earrings1 from "@/assets/earrings-1.jpg";
import bangles1 from "@/assets/bangles-1.jpg";
import ring1 from "@/assets/ring-1.jpg";

const Index = () => {
  const categories = [
    { name: "Necklaces", image: necklace1, link: "/products?category=necklace" },
    { name: "Earrings", image: earrings1, link: "/products?category=earrings" },
    { name: "Bangles", image: bangles1, link: "/products?category=bangles" },
    { name: "Rings", image: ring1, link: "/products?category=rings" },
  ];

  const features = [
    { icon: Sparkles, title: "Premium Quality", description: "Handcrafted with finest materials" },
    { icon: ShieldCheck, title: "Authenticity Guaranteed", description: "100% genuine artificial jewelry" },
    { icon: Truck, title: "Free Shipping", description: "On orders above ₹2000" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Elegance Redefined
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Discover timeless beauty in our curated collection of exquisite jewelry
          </p>
          <Link to="/products">
            <Button size="lg" className="btn-gold text-lg px-8 py-6">
              Explore Collection
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Shop by Category</h2>
            <p className="text-xl text-muted-foreground">Explore our stunning collections</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link 
                key={index}
                to={category.link}
                className="group relative overflow-hidden rounded-lg aspect-square"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center p-6">
                  <h3 className="text-white text-2xl font-bold">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Experience Luxury at Your Fingertips
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Browse our exclusive collection and find the perfect piece that speaks to your style
          </p>
          <Link to="/products">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-primary mb-4">JD Jewellers</h3>
              <p className="text-muted-foreground">Crafting elegance since inception</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/products" className="hover:text-primary transition-colors">Products</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/products?category=necklace" className="hover:text-primary transition-colors">Necklaces</Link></li>
                <li><Link to="/products?category=earrings" className="hover:text-primary transition-colors">Earrings</Link></li>
                <li><Link to="/products?category=bangles" className="hover:text-primary transition-colors">Bangles</Link></li>
                <li><Link to="/products?category=rings" className="hover:text-primary transition-colors">Rings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Phone: +91 90799 98370</li>
                <li>Email: info@jdjewellers.com</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; 2025 JD Jewellers. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
import Navbar from "@/components/Navbar";
import { Shield, Truck, Heart, Star } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Harsh Adornments</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your trusted destination for premium artificial jewellery at unbeatable prices
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Our Story */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-primary">Our Story</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Welcome to Harsh Adornments, where elegance meets affordability. We specialize in offering 
                high-quality artificial jewellery that looks and feels premium without the premium price tag.
              </p>
              <p>
                Unlike other online retailers, we are not middlemen. Every piece of jewellery you order comes 
                directly from our own shop, ensuring quality control at every step. This direct approach allows 
                us to offer you the best prices without compromising on quality or design.
              </p>
              <p>
                Our collection features beautifully crafted necklaces, earrings, bangles, and rings that are 
                perfect for any occasion – from daily wear to special celebrations. Each piece is carefully 
                selected to ensure it meets our high standards of craftsmanship and design.
              </p>
            </div>
          </section>

          {/* Why Choose Us */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-primary">Why Choose Us</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4 p-6 rounded-lg bg-muted/30">
                <Shield className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Direct from Our Shop</h3>
                  <p className="text-muted-foreground">
                    No third parties involved. Every product is sent directly from our store, 
                    ensuring authenticity and quality.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 rounded-lg bg-muted/30">
                <Star className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Best Prices Guaranteed</h3>
                  <p className="text-muted-foreground">
                    By cutting out middlemen, we offer the most competitive prices on 
                    high-quality artificial jewellery.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 rounded-lg bg-muted/30">
                <Heart className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Premium Quality</h3>
                  <p className="text-muted-foreground">
                    Each piece is handpicked and quality-checked to ensure you receive 
                    only the finest artificial jewellery.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 rounded-lg bg-muted/30">
                <Truck className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
                  <p className="text-muted-foreground">
                    Quick and secure shipping to your doorstep. Free delivery on orders above ₹2000.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Terms and Conditions */}
          <section className="border-t border-border pt-12">
            <h2 className="text-3xl font-bold mb-6 text-primary">Terms and Conditions</h2>
            <div className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Product Information</h3>
                <p>
                  All products sold at Harsh Adornments are artificial jewellery pieces. We do not sell 
                  gold, silver, or any precious metals. Each product description is accurate to the best 
                  of our knowledge, and images are representative of the actual product.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Pricing</h3>
                <p>
                  All prices are listed in Indian Rupees (₹) and are inclusive of taxes. We reserve the 
                  right to modify prices at any time, but changes will not affect orders already placed.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Payment</h3>
                <p>
                  We currently accept Cash on Delivery (COD) for all orders. Payment is collected when 
                  the product is delivered to your address.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Shipping and Delivery</h3>
                <p>
                  We ship across India. Delivery typically takes 5-7 business days from the date of order. 
                  Shipping is free for orders above ₹2000. For orders below ₹2000, a flat shipping charge 
                  of ₹100 applies.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 p-6 rounded-lg border border-amber-200 dark:border-amber-900">
                <h3 className="font-semibold text-lg mb-2 text-foreground">Return Policy</h3>
                <p className="mb-2">
                  <strong>Important:</strong> Returns are not allowed for every product. Return eligibility 
                  will be decided after discussion with our customer service team based on the specific 
                  circumstances of each case.
                </p>
                <p>
                  For any concerns regarding your order, please contact us immediately at 9887198488 or 
                  email us at Hitanshj707@gmail.com. We are committed to resolving any issues promptly.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Customer Responsibility</h3>
                <p>
                  Please ensure that the delivery address and contact information provided are accurate. 
                  We are not responsible for orders delivered to incorrect addresses provided by the customer.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Privacy</h3>
                <p>
                  Your personal information is safe with us. We collect information only to process your 
                  orders and will never share it with third parties without your consent.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Contact Us</h3>
                <p>
                  For any questions or concerns, please reach out to us:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Phone: +91 9887198488</li>
                  <li>Email: Hitanshj707@gmail.com</li>
                  <li>WhatsApp: +91 9887198488</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Harsh Adornments. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
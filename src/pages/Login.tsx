import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, userRole, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🚀 Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (userRole === "admin") {
        toast.error("Admins cannot log in here. Please use admin login.");
        navigate("/admin");
      } else {
        const redirect = searchParams.get("redirect") || "/";
        navigate(redirect);
      }
    }
  }, [user, userRole, authLoading, navigate, searchParams]);

  // ✅ Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // ✅ Fixed login handler (checks role before creating session)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Step 1️⃣ Validate form
      loginSchema.parse(formData);

      // Step 2️⃣ Check role before login (via RPC)
      const { data: roleData, error: roleError } = await supabase.rpc(
        "get_user_role_by_email",
        { p_email: formData.email.trim() }
      );

      if (roleError) {
        console.error("Role pre-check error:", roleError);
        toast.error("Could not verify user role. Please try again.");
        setLoading(false);
        return;
      }

      if (roleData === "admin") {
        toast.error("Access denied.");
        setLoading(false);
        return;
      }

      // Step 3️⃣ Proceed to Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please verify your email before logging in");
        } else {
          toast.error(error.message);
        }
        setLoading(false);
        return;
      }

      const currentUser = data.user;
      if (!currentUser) {
        toast.error("Login failed. Try again.");
        setLoading(false);
        return;
      }

      // ✅ Step 4️⃣ Success → redirect customer
      toast.success("Login successful!");
      const redirect = searchParams.get("redirect") || "/";
      navigate(redirect);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) newErrors[e.path[0] as string] = e.message;
        });
        setErrors(newErrors);
        toast.error("Please fix the errors in the form");
      } else {
        console.error("Unexpected error:", err);
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🕒 Loading state while auth initializes
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // 🧾 Form UI
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-3xl text-center">
              Welcome back to Harsh Kangan
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Login to continue your jewellery shopping
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  disabled={loading}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  disabled={loading}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full btn-gold"
                size="lg"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to={`/signup${
                    searchParams.get("redirect")
                      ? `?redirect=${searchParams.get("redirect")}`
                      : ""
                  }`}
                  className="text-primary hover:underline font-semibold"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;

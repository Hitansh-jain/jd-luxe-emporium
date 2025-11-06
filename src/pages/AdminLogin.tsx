import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import * as OTPAuth from "otpauth";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!authLoading && user && userRole === "admin") {
      navigate("/admin/dashboard");
    }
  }, [user, userRole, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Check role via RPC before login
      const { data: roleData, error: roleError } = await supabase.rpc(
        "get_user_role_by_email",
        { p_email: email.trim() }
      );

      if (roleError) {
        console.error("Role check error:", roleError);
        toast.error("Failed to verify user role. Try again.");
        setLoading(false);
        return;
      }

      if (roleData !== "admin") {
        toast.error("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }

      // Step 2: Proceed to login if user is admin
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const currentUser = data.user;
      if (!currentUser) throw new Error("No user found");

      // Step 3: Check for 2FA
      const { data: existing2FA, error: twofaError } = await supabase
        .from("admin_twofactor")
        .select("secret")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (twofaError) throw twofaError;

      if (existing2FA?.secret) {
        // 2FA exists → show OTP input
        setSecret(existing2FA.secret);
        setShowOtp(true);
        toast.info("Enter your 2FA code from Google Authenticator");
      } else {
        // Create a new secret and redirect to QR page
        const newSecret = new OTPAuth.Secret();
        await supabase.from("admin_twofactor").insert([
          {
            user_id: currentUser.id,
            secret: newSecret.base32,
          },
        ]);

        const totp = new OTPAuth.TOTP({
          issuer: "HarshKanganStore",
          label: email,
          algorithm: "SHA1",
          digits: 6,
          period: 30,
          secret: newSecret,
        });

        const otpAuthUrl = totp.toString();

        // 🔥 CRITICAL FIX: Sign out the user before redirecting to setup
        await supabase.auth.signOut();

        toast.info("Scan this QR in Google Authenticator to enable 2FA");
        navigate(`/admin/setup-2fa?otpauth=${encodeURIComponent(otpAuthUrl)}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret) return;
    setLoading(true);

    try {
      const totp = new OTPAuth.TOTP({
        secret: OTPAuth.Secret.fromBase32(secret),
        digits: 6,
        period: 30,
      });

      const delta = totp.validate({ token: otp, window: 1 });
      if (delta === null) throw new Error("Invalid 2FA code");

      toast.success("2FA verified successfully!");
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">Admin Login</CardTitle>
          <p className="text-muted-foreground">Harsh Kangan Store</p>
        </CardHeader>
        <CardContent>
          {!showOtp ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@harshkangan.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" className="w-full btn-gold" size="lg" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div>
                <Label htmlFor="otp">2FA Code</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                />
              </div>
              <Button type="submit" className="w-full btn-gold" size="lg" disabled={loading}>
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
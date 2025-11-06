import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Setup2FA() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const otpAuth = params.get("otpauth") ? decodeURIComponent(params.get("otpauth")!) : "";
  const [qr, setQr] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const generateQr = async () => {
      if (!otpAuth) {
        toast.error("Invalid 2FA setup link");
        navigate("/admin/login");
        return;
      }

      setLoading(true);
      try {
        const qrUrl = await QRCode.toDataURL(otpAuth);
        setQr(qrUrl);
      } catch {
        toast.error("Failed to generate QR code");
      } finally {
        setLoading(false);
      }
    };

    generateQr();
  }, [otpAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md text-center shadow-lg border border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Set Up 2-Step Verification</CardTitle>
          <p className="text-muted-foreground mt-2">
            Scan this QR code with <strong>Google Authenticator</strong> or <strong>Authy</strong>.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-5 py-6">
          {loading ? (
            <p className="text-muted-foreground">Generating QR code...</p>
          ) : qr ? (
            <>
              <img src={qr} alt="2FA QR Code" className="w-48 h-48 border p-2 rounded-lg shadow-sm" />
              <p className="text-sm text-muted-foreground max-w-sm">
                After scanning, your authenticator app will start generating 6-digit codes.
              </p>

              <Button onClick={() => navigate("/admin")} className="w-full btn-gold">
                Done — Go to Login
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">Invalid setup link.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

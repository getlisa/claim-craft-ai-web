
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail, KeyRound, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface OtpVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

const OtpVerification = ({ email, onVerificationSuccess, onBack }: OtpVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const { verifyOTP, resendOTP } = useAuth();
  
  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }

    setIsVerifying(true);
    try {
      const success = await verifyOTP(email, otp);
      if (success) {
        onVerificationSuccess();
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    
    setIsResending(true);
    try {
      const success = await resendOTP(email);
      if (success) {
        // Start a 60-second countdown to prevent too many resend attempts
        setResendCountdown(60);
        const countdownInterval = setInterval(() => {
          setResendCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="shadow-xl border-gray-100">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a verification code to {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-center mb-4">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          
          <Button 
            onClick={handleVerify} 
            className="w-full" 
            disabled={isVerifying || otp.length !== 6}
          >
            {isVerifying ? (
              <>
                <span className="animate-spin mr-2">↻</span>
                Verifying...
              </>
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4" />
                Verify Email
              </>
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center">
          Didn't receive the code?{" "}
          <Button 
            variant="link" 
            className="p-0 h-auto font-semibold" 
            onClick={handleResendOtp}
            disabled={isResending || resendCountdown > 0}
          >
            {isResending ? "Sending..." : resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend"}
          </Button>
        </div>
        <Button 
          variant="ghost" 
          className="w-full" 
          onClick={onBack}
        >
          Back to Login
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OtpVerification;

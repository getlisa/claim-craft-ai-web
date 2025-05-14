
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import OtpVerification from "@/components/OtpVerification";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegisterSuccess = (email: string) => {
    setVerificationEmail(email);
  };

  const handleVerificationSuccess = () => {
    navigate("/");
  };

  const handleBackToLogin = () => {
    setVerificationEmail(null);
    setActiveTab("login");
  };

  // Show OTP verification if a verification email exists
  if (verificationEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
        <div className="w-full max-w-md">
          <OtpVerification 
            email={verificationEmail} 
            onVerificationSuccess={handleVerificationSuccess}
            onBack={handleBackToLogin}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-gray-100">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Lisa AI Voice Assistant</CardTitle>
            <CardDescription>Login to access your call records</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              
              <TabsContent value="register">
                <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-xs text-center text-gray-500">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;

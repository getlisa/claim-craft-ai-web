
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import LisaLogo from "./LisaLogo";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-lg z-50 flex flex-col p-6 md:hidden animate-fade-in">
      <div className="flex justify-between items-center mb-10">
        <LisaLogo />
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6 text-white" />
        </Button>
      </div>
      
      <div className="flex flex-col space-y-6 items-center mt-10">
        <Link to="/" className="text-white text-xl hover:text-purple-300 transition-colors" onClick={onClose}>
          Home
        </Link>
        <Link to="/" className="text-white text-xl hover:text-purple-300 transition-colors" onClick={onClose}>
          Agents
        </Link>
        <Link to="/" className="text-white text-xl hover:text-purple-300 transition-colors" onClick={onClose}>
          Pricing
        </Link>
        <Link to="/" className="text-white text-xl hover:text-purple-300 transition-colors" onClick={onClose}>
          About
        </Link>
      </div>
      
      <div className="mt-auto space-y-4">
        <Button asChild variant="ghost" className="w-full text-white hover:text-purple-300 transition-colors">
          <Link to="/voice/login" onClick={onClose}>
            Sign In
          </Link>
        </Button>
        <Button asChild className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
          <Link to="/voice/login" onClick={onClose}>
            Get Started
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default MobileMenu;

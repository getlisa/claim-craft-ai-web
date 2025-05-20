
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface AgentCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  colorGradient: string;
}

const AgentCard = ({ title, description, icon, colorGradient }: AgentCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-black/60 to-purple-900/10 backdrop-blur-lg border border-purple-500/20 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 hover:scale-105 transition-all duration-300 h-full">
      <CardContent className="p-8 flex flex-col h-full">
        <div className={`bg-gradient-to-br ${colorGradient} w-14 h-14 rounded-full flex items-center justify-center mb-6 shadow-lg`}>
          {icon}
        </div>
        
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-purple-100/80 mb-6 flex-grow">{description}</p>
        
        <Button asChild variant="ghost" className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 justify-start p-0 group">
          <Link to="/voice/login" className="flex items-center">
            <span className="mr-2 font-medium">Try Now</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-all duration-300" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default AgentCard;

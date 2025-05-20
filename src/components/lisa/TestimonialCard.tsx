
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  name: string;
  title: string;
  avatar: string;
}

const TestimonialCard = ({ quote, name, title, avatar }: TestimonialCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-black/60 to-purple-900/10 backdrop-blur-lg border border-purple-500/20 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 h-full flex flex-col">
      <CardContent className="p-8 flex flex-col h-full">
        {/* Star Rating */}
        <div className="flex mb-6">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          ))}
        </div>
        
        {/* Quote */}
        <p className="text-purple-100/90 mb-6 flex-grow italic">"{quote}"</p>
        
        {/* Author */}
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-purple-500/30">
            <img 
              src={avatar} 
              alt={name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-bold text-white">{name}</h4>
            <p className="text-sm text-purple-300/80">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;


import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { BarChart } from "lucide-react";

const RoiCalculator = () => {
  const [hourlyCost, setHourlyCost] = useState(50);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [monthlySavings, setMonthlySavings] = useState(0);
  const [yearlySavings, setYearlySavings] = useState(0);
  
  // Calculate savings when inputs change
  useEffect(() => {
    const weeklySavings = hourlyCost * hoursPerWeek;
    const monthly = weeklySavings * 4.33; // Average weeks per month
    const yearly = monthly * 12;
    
    setMonthlySavings(monthly);
    setYearlySavings(yearly);
  }, [hourlyCost, hoursPerWeek]);
  
  return (
    <Card className="bg-gradient-to-br from-black/60 to-purple-900/10 backdrop-blur-lg border border-purple-500/20 rounded-xl overflow-hidden max-w-4xl mx-auto">
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Inputs Section */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white">Calculate Your Savings</h3>
            
            {/* Hourly Cost Slider */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-purple-100">Hourly Cost (salary + overhead)</label>
                <span className="font-bold text-white">${hourlyCost}/hr</span>
              </div>
              <Slider
                value={[hourlyCost]}
                min={25}
                max={200}
                step={5}
                onValueChange={(value) => setHourlyCost(value[0])}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-purple-300/70">
                <span>$25</span>
                <span>$200</span>
              </div>
            </div>
            
            {/* Hours Per Week Slider */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-purple-100">Hours spent on manual tasks per week</label>
                <span className="font-bold text-white">{hoursPerWeek} hrs</span>
              </div>
              <Slider
                value={[hoursPerWeek]}
                min={1}
                max={20}
                step={1}
                onValueChange={(value) => setHoursPerWeek(value[0])}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-purple-300/70">
                <span>1 hr</span>
                <span>20 hrs</span>
              </div>
            </div>
          </div>
          
          {/* Results Section */}
          <div className="flex flex-col justify-center">
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-md rounded-xl p-8 border border-purple-500/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Your Estimated Savings</h3>
                <BarChart className="w-6 h-6 text-purple-400" />
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-purple-200/80 mb-1">Monthly Savings</div>
                <div className="text-3xl font-bold text-white">${monthlySavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-purple-200/80 mb-1">Yearly Savings</div>
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                  ${yearlySavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>
              
              <div className="text-sm text-purple-200/70 mt-6">
                Based on automating {hoursPerWeek} hours of $${hourlyCost}/hr work per week
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoiCalculator;


import { useState } from "react";
import { format, parse } from "date-fns";
import { extractAppointmentDetails } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { toast } from "sonner";
import { Check, Clock, Calendar, X, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface AppointmentExtractorProps {
  transcript: string;
  callId: string;
  onAccept: (date: string, time: string, callId: string) => void;
  onReject: (callId: string) => void;
}

const AppointmentExtractor: React.FC<AppointmentExtractorProps> = ({ 
  transcript, 
  callId,
  onAccept,
  onReject
}) => {
  const [loading, setLoading] = useState(false);
  const [extractedDate, setExtractedDate] = useState<string | null>(null);
  const [extractedTime, setExtractedTime] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [suggestedResponse, setSuggestedResponse] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!transcript) {
      toast.error("No transcript available to analyze");
      return;
    }

    setLoading(true);
    
    try {
      const result = await extractAppointmentDetails(transcript);
      
      setExtractedDate(result.appointmentDate);
      setExtractedTime(result.appointmentTime);
      setConfidence(result.confidence);
      setSuggestedResponse(result.suggestedResponse);
      
      if (!result.appointmentDate && !result.appointmentTime) {
        toast.info("No appointment details found in the transcript");
      }
    } catch (error) {
      console.error("Error in appointment extraction:", error);
      toast.error("Failed to extract appointment details");
    } finally {
      setLoading(false);
    }
  };

  const getFormattedDate = () => {
    if (!extractedDate) return null;
    
    try {
      const date = parse(extractedDate, 'yyyy-MM-dd', new Date());
      return format(date, 'MMMM d, yyyy');
    } catch (e) {
      return extractedDate;
    }
  };

  const getFormattedTime = () => {
    if (!extractedTime) return null;
    
    try {
      const time = parse(extractedTime, 'HH:mm', new Date());
      return format(time, 'h:mm a');
    } catch (e) {
      return extractedTime;
    }
  };

  const getConfidenceColor = () => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const handleAccept = () => {
    if (extractedDate && extractedTime) {
      onAccept(extractedDate, extractedTime, callId);
      toast.success("Appointment scheduled successfully");
    } else {
      toast.error("Cannot schedule: missing date or time");
    }
  };

  const handleReject = () => {
    onReject(callId);
    toast.info("Appointment suggestion rejected");
  };

  return (
    <Card className="w-full bg-white border-indigo-100 hover:border-indigo-200 transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Appointment Suggestion
        </CardTitle>
        <CardDescription>
          Extract appointment details from transcript
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!extractedDate && !extractedTime && !loading && (
          <Button 
            onClick={handleExtract} 
            className="w-full"
            disabled={loading}
          >
            <Sparkles className="mr-2 h-4 w-4" /> Extract Appointment Details
          </Button>
        )}
        
        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        )}
        
        {(extractedDate || extractedTime) && !loading && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="mr-1 h-4 w-4" /> Date
                </div>
                <div className="font-semibold">
                  {getFormattedDate() || "Not specified"}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500 flex items-center">
                  <Clock className="mr-1 h-4 w-4" /> Time
                </div>
                <div className="font-semibold">
                  {getFormattedTime() || "Not specified"}
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="text-sm font-medium text-gray-500 mb-1">
                AI Confidence: <span className={getConfidenceColor()}>{confidence}%</span>
              </div>
              
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full",
                    confidence >= 80 ? "bg-green-500" :
                    confidence >= 50 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
            
            {suggestedResponse && (
              <div className="mt-3 bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                <div className="font-medium mb-1">Suggested Response:</div>
                <p className="italic">{suggestedResponse}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {(extractedDate || extractedTime) && !loading && (
        <CardFooter className="flex justify-between gap-2 pt-2">
          <Button 
            variant="outline" 
            className="w-1/2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            onClick={handleReject}
          >
            <X className="mr-2 h-4 w-4" /> Reject
          </Button>
          <Button 
            className="w-1/2 bg-green-600 hover:bg-green-700"
            onClick={handleAccept}
            disabled={!extractedDate || !extractedTime}
          >
            <Check className="mr-2 h-4 w-4" /> Schedule
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default AppointmentExtractor;

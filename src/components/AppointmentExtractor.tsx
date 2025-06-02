import { useState } from "react";
import { format, parse } from "date-fns";
import { extractAppointmentDetails } from "@/lib/openai";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { toast } from "sonner";
import { Clock, Calendar, Sparkles, User, MapPin, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface AppointmentExtractorProps {
  transcript: string;
  callId: string;
  callDate?: Date;
  onExtracted?: (data: any) => void;
  autoExtract?: boolean;
}

const AppointmentExtractor: React.FC<AppointmentExtractorProps> = ({ 
  transcript, 
  callId,
  callDate,
  onExtracted,
  autoExtract = false
}) => {
  const [loading, setLoading] = useState(false);
  const [extractedDate, setExtractedDate] = useState<string | null>(null);
  const [extractedTime, setExtractedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [clientAddress, setClientAddress] = useState<string | null>(null);
  const [clientEmail, setClientEmail] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [suggestedResponse, setSuggestedResponse] = useState<string | null>(null);

  // Auto-extract on component mount if enabled
  if (autoExtract && !loading && !extractedDate && !extractedTime && !clientEmail) {
    handleExtract();
  }

  async function handleExtract() {
    if (!transcript) {
      toast.error("No transcript available to analyze");
      return;
    }

    console.log("🔍 Starting extraction for call:", callId);
    console.log("📝 Transcript preview:", transcript.substring(0, 200) + "...");
    
    setLoading(true);
    
    try {
      const result = await extractAppointmentDetails(transcript, callDate);
      
      console.log("📊 Extraction complete for call:", callId, result);
      
      setExtractedDate(result.appointmentDate);
      setExtractedTime(result.appointmentTime);
      setClientName(result.clientName);
      setClientAddress(result.clientAddress);
      setClientEmail(result.clientEmail);
      setConfidence(result.confidence);
      setSuggestedResponse(result.suggestedResponse);
      
      // Enhanced email logging
      if (result.clientEmail) {
        console.log("✅ EMAIL EXTRACTED AND SET IN STATE:", result.clientEmail);
        console.log("📧 Email state updated successfully");
        toast.success(`Email extracted: ${result.clientEmail}`, {
          description: "Email address found in conversation"
        });
      } else {
        console.log("❌ No email in extraction result");
      }
      
      if (onExtracted) {
        onExtracted(result);
      }
      
      if (!result.appointmentDate && !result.appointmentTime && !result.clientEmail) {
        toast.info("No appointment details or contact information found in the transcript");
      }
    } catch (error) {
      console.error("Error in appointment extraction:", error);
      toast.error("Failed to extract appointment details");
    } finally {
      setLoading(false);
    }
  }

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

  // Add debug logging for render
  console.log("🎨 AppointmentExtractor rendering for call:", callId, {
    clientEmail,
    extractedDate,
    extractedTime,
    clientName,
    loading
  });

  return (
    <Card className="w-full bg-white border-indigo-100 hover:border-indigo-200 transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Appointment Analysis
          {loading && <span className="text-sm text-gray-500">(Extracting...)</span>}
        </CardTitle>
        <CardDescription>
          Detected appointment details and contact information from transcript
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <div className="text-sm text-blue-600 mt-2 font-medium">🔍 Scanning for email addresses...</div>
          </div>
        )}
        
        {!loading && (extractedDate || extractedTime || clientName || clientAddress || clientEmail) && (
          <div className="space-y-3">
            {/* Email at the top for visibility */}
            {clientEmail && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-700 flex items-center mb-1">
                  <Mail className="mr-2 h-4 w-4" /> Email Address Found
                </div>
                <div className="text-lg font-bold text-blue-800">
                  {clientEmail}
                </div>
              </div>
            )}

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

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500 flex items-center">
                  <User className="mr-1 h-4 w-4" /> Client
                </div>
                <div className="font-semibold">
                  {clientName || "Not specified"}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500 flex items-center">
                  <Mail className="mr-1 h-4 w-4" /> Email Status
                  {clientEmail && <span className="ml-1 text-green-600">✓</span>}
                </div>
                <div className={cn(
                  "font-semibold text-sm",
                  clientEmail ? "text-blue-600" : "text-gray-400"
                )}>
                  {clientEmail ? "Found" : "Not found"}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500 flex items-center">
                <MapPin className="mr-1 h-4 w-4" /> Address
              </div>
              <div className="font-semibold text-sm">
                {clientAddress || "Not specified"}
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

        {!loading && !extractedDate && !extractedTime && !clientName && !clientAddress && !clientEmail && (
          <div className="text-center py-4 text-gray-500">
            <Mail className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No appointment or contact details detected</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentExtractor;

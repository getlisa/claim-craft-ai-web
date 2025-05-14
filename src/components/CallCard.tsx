
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Clock, Sparkles, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CallCardProps {
  call: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const CallCard: React.FC<CallCardProps> = ({ call, isExpanded, onToggleExpand }) => {
  const formatDate = (timestamp: string) => {
    if (!timestamp) return "N/A";
    return format(new Date(timestamp), "MMM d, yyyy h:mm a");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDuration = () => {
    if (!call.start_timestamp || !call.end_timestamp) return "N/A";
    
    const start = new Date(call.start_timestamp).getTime();
    const end = new Date(call.end_timestamp).getTime();
    const durationMs = end - start;
    
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-500" />
            <CardTitle className="text-lg font-medium">{call.call_id.substring(0, 12)}...</CardTitle>
            <Badge className={cn("ml-2", getStatusColor(call.call_status))}>
              {call.call_status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{getDuration()}</span>
            <Badge variant="outline" className="ml-2">
              {call.call_type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Started:</span>
            <span className="font-medium">{formatDate(call.start_timestamp)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Ended:</span>
            <span className="font-medium">{formatDate(call.end_timestamp)}</span>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          onClick={onToggleExpand}
          className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-1"
        >
          {isExpanded ? (
            <>
              <span>Hide Details</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Show Details</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </Button>
        
        {isExpanded && (
          <div className="mt-4 space-y-4 border-t pt-4">
            {call.transcript && (
              <div>
                <h4 className="font-medium mb-2 text-gray-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  Transcript
                </h4>
                <div className="bg-gray-50 p-3 rounded-md text-gray-700 max-h-32 overflow-y-auto text-sm">
                  {call.transcript}
                </div>
              </div>
            )}
            
            {call.recording_url && (
              <div>
                <h4 className="font-medium mb-2 text-gray-700">Recording</h4>
                <audio 
                  controls 
                  src={call.recording_url}
                  className="w-full"
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            
            {call.public_log_url && (
              <div className="mt-3">
                <a 
                  href={call.public_log_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  View Complete Log
                </a>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CallCard;

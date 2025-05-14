
import { useState } from "react";
import CallCard from "./CallCard";
import { Skeleton } from "@/components/ui/skeleton";

interface CallListProps {
  calls: any[];
  loading: boolean;
}

const CallList: React.FC<CallListProps> = ({ calls, loading }) => {
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);

  const toggleExpand = (callId: string) => {
    setExpandedCallId(expandedCallId === callId ? null : callId);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 my-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-12 w-full mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <h3 className="text-xl font-medium text-gray-500">No calls found</h3>
        <p className="text-gray-400 mt-2">Click "Fetch Calls" to load your recent conversations</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 my-6">
      {calls.map(call => (
        <CallCard 
          key={call.call_id} 
          call={call} 
          isExpanded={expandedCallId === call.call_id}
          onToggleExpand={() => toggleExpand(call.call_id)}
        />
      ))}
    </div>
  );
};

export default CallList;

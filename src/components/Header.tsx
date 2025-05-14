
import { PhoneCall } from "lucide-react";

const Header = () => {
  return (
    <div className="flex flex-col items-center justify-center mb-8">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-3 rounded-full">
          <PhoneCall className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
          Retell AI - Call History
        </h1>
      </div>
      <p className="text-gray-600 mt-2 text-center">
        View and listen to your recent Retell AI conversations
      </p>
    </div>
  );
};

export default Header;

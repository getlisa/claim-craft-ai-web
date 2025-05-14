
import { Headphones } from "lucide-react";

const Header = () => {
  return (
    <div className="flex flex-col items-center justify-center mb-8">
      <div className="flex items-center gap-3">
        <div className="bg-purple-600 p-3 rounded-full">
          <Headphones className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
          Lisa - Voice Assistant
        </h1>
      </div>
      <p className="text-gray-600 mt-2 text-center">
        View and manage your voice assistant conversations
      </p>
    </div>
  );
};

export default Header;

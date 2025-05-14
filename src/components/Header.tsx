
import { Headphones } from "lucide-react";

const Header = () => {
  return (
    <div className="flex items-center justify-between mb-8 px-2">
      <div className="flex items-center gap-2">
        <div className="bg-purple-600 p-2.5 rounded-full">
          <Headphones className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
};

export default Header;

import { Link } from "react-router";
import { Button } from "../ui/button";

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 max-w-none">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-800">
            📦️ Order Management
          </Link>

          <div className="flex gap-2">
            <Link to="/create-order">
              <Button variant="default">Create Order</Button>
            </Link>
            <Link to="/create-vehicle">
              <Button variant="default">Create Tranpo</Button>
            </Link>
            <Link to="/orders">
              <Button variant="outline">OrderList</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Admin</h2>

      <nav className="flex flex-col gap-2">
        <Link to="/" className="hover:bg-gray-700 p-2 rounded">
          Dashboard
        </Link>
        <Link to="/product" className="hover:bg-gray-700 p-2 rounded">
          Product
        </Link>
        <Link to="/product/search/keyword" className="hover:bg-gray-700 p-2 rounded">
          Keywords
        </Link>
        <Link to="/import" className="hover:bg-gray-700 p-2 rounded">
          Import
        </Link>
        {/* <Link to="/products" className="hover:bg-gray-700 p-2 rounded">
          Products
        </Link>
        <Link to="/settings" className="hover:bg-gray-700 p-2 rounded">
          Settings
        </Link> */}
      </nav>
    </div>
  );
}

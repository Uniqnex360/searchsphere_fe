import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className="flex-[0.2] bg-gray-900 text-white">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-[0.8] h-full overflow-y-auto bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
}

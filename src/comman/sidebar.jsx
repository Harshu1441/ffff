import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserCircle, FileText, Shield } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: "Agents", icon: Shield, path: "/agents" },
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Profile", icon: UserCircle, path: "/logs" },
    { name: "Documents", icon: FileText, path: "/app-management" },
  ];

  return (
    <aside 
      className="fixed left-6 top-1/2 -translate-y-1/2 z-30  bg-opacity-50 
        backdrop-blur-sm shadow-lg w-16 rounded-4xl flex flex-col"
      style={{
        height: '60vh', // Not full height
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-6 px-2">
          {navItems.map((item) => (
            <li key={item.path} className="flex justify-center">
              <Link
                to={item.path}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 
                  ${location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700 shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'}`}
                title={item.name}
              >
                <item.icon 
                  size={20}
                  className={location.pathname === item.path ? "text-blue-500" : "text-gray-500"}
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
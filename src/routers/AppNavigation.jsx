import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard.jsx';
import Logs from '../components/Logs.jsx';
import Sidebar from '../comman/Sidebar.jsx';
import AppManagement from '../components/AppManagement.jsx';
import Agents from '../components/Agents.jsx/Agents';
import Login from "../components/Login.jsx";
import ProtectedRoute from '../components/ProtectedRoute.jsx';

function AppNavigation() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 p-4 lg:ml-36">
                  <Routes>
                    <Route path="/agents" element={<Agents />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/logs" element={<Logs />} />
                    <Route path="/app-management" element={<AppManagement />} />
                    <Route path="/" element={<Navigate to="/agents" replace />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppNavigation;
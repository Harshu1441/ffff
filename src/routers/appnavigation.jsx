import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/dashboard';
import Logs from '../components/logs';
import Sidebar from '../common/sidebar';
import AppManagement from '../components/appmanagement';
import Agents from '../components/agents/agents';
import Login from '../components/login';
import ProtectedRoute from '../components/protectedroute';

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
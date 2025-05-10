import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Plus } from 'lucide-react';
import axios from 'axios';
import base_Api from '../../utils/baseApi';
import { useNavigate } from 'react-router-dom';

import Group from './group';
import Category from './category';
import RuleTable from './domain/ruleTable';
import AddRuleModal from './domain/addRuleModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [agents, setAgents] = useState([]);
  const [groups, setGroups] = useState({});
  const [rules, setRules] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [predefinedRules, setPredefinedRules] = useState({});
  const dropdownRef = useRef(null);
  const [newApplication, setNewApplication] = useState({ applyTo: '' });

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Add dropdown logic here if needed
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${base_Api}list_all_rules`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
         
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Accept all status codes less than 500
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setRules(response.data || {});
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching rules:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Error fetching rules. Please try again.');
      }
      setRules({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${base_Api}agents`, {
          headers: {
            'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
        });
        const formatted = response.data.map((a) => ({
          id: a.agent_id,
          name: a.agent_id,
          status: a.status,
          lastSeen: a.last_seen,
        }));
        setAgents(formatted);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        console.error('Error fetching agents:', err);
      }
    };
    fetchAgents();
  }, [navigate]);

  useEffect(() => {
    if (newApplication.applyTo === 'groups') {
      const token = localStorage.getItem('token');
      axios
        .get(`${base_Api}groups`, {
          headers: {
            'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
        })
        .then((res) => setGroups(res.data))
        .catch((err) => {
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
          }
          console.error('Error fetching groups:', err);
        });
    }
  }, [newApplication.applyTo, navigate]);

  useEffect(() => {
    const fetchPredefinedRules = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${base_Api}get_predefined_rules`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setPredefinedRules(response.data.predefined_rules || {});
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        console.error('Error fetching predefined rules:', err);
      }
    };
    fetchPredefinedRules();
  }, [navigate]);

  return (
    <div className="p-2 sm:p-4 md:p-6 ">
      {/* Header */}
      <header className="bg-white p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 rounded-lg space-y-3 sm:space-y-0">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Domain Dashboard</h1>
        <button className="sm:hidden text-gray-500 hover:text-gray-700">
          <Menu size={24} />
        </button>
      </header>

      <Group agents={agents} groups={groups} />

      <div className="bg-white rounded-lg shadow mt-4 sm:mt-6">
        {error && (
          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm sm:text-base text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-xs sm:text-sm text-red-600 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="p-4 sm:p-8 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="p-3 sm:p-4 border-b border-gray-200 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-0">Rule List</h2>
                
                <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <div className="relative flex-1 sm:flex-none">
                    <input
                      type="text"
                      placeholder="Search applications..."
                      className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                  </div>

                  <div className="w-full sm:w-auto">
                    <Category />
                  </div>

                  <button
                    onClick={() => setShowAddRuleModal(true)}
                    className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
                  >
                    <Plus size={18} />
                    <span>Add Rule</span>
                  </button>
                </div>
              </div>
            </div>

            <AddRuleModal
              isOpen={showAddRuleModal}
              onClose={() => setShowAddRuleModal(false)}
              agents={agents}
              groups={groups}
              predefinedRules={predefinedRules}
              onRuleAdded={fetchRules}
            />


              <RuleTable
                rules={rules}
                searchTerm={searchTerm}
                agents={agents}
                setRules={setRules}
                predefinedRules={predefinedRules}
              />
          
          </>
        )}
      </div>
    </div>
  );
}
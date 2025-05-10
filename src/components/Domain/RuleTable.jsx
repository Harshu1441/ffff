import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import axios from 'axios';

import EditRuleModal from './EditRuleModal.jsx';
import DeleteRuleModal from './DeleteRuleModal.jsx';
import base_Api from '../../../utils/baseApi.jsx';
import Loader from '../../comman/Loader.jsx';


// Helper function to truncate arrays
const truncateArray = (arr, limit = 2) => {
  if (!Array.isArray(arr)) return [];
  if (arr.length <= limit) return arr;
  return [...arr.slice(0, limit), '...'];
};

export default function RuleTable({ searchTerm }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rules, setRules] = useState([]);
  const [error, setError] = useState(null);

  // Fetch rules from API
  useEffect(() => {
    const fetchRules = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${base_Api}list_all_rules`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const formattedRules = response.data.rules.map(rule => ({
          ...rule,
          type: rule.type || "",
          target: rule.target || rule.agents_in_group?.join(', ') || '-',
          domains: Array.isArray(rule.domains) ? rule.domains : [], 
          processes: Array.isArray(rule.processes) ? rule.processes : [],
          priority: rule.priority || ''
        }));
        setRules(formattedRules);
      } catch (error) {
        console.error('Error fetching rules:', error);
        setError('Failed to fetch rules');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRules();
  }, []);

  // Filter rules based on search term
  const filteredRules = rules.filter((rule) => {
    if (!rule) return false;
    const search = searchTerm?.toLowerCase() || '';
    return (
      rule.rule_name?.toLowerCase().includes(search) ||
      rule.target?.toLowerCase().includes(search) ||
      rule.processes?.some(process => process.toLowerCase().includes(search)) ||
      rule.domains?.some(domain => domain.toLowerCase().includes(search))
    );
  });

  const handleEditClick = (rule) => {
    // Format the rule data to ensure all fields are properly set
    const formattedRule = {
      ...rule,
      type: rule.type || "",
      target: rule.target || rule.agents_in_group?.join(', ') || '-',
      domains: Array.isArray(rule.domains) ? rule.domains : [],
      processes: Array.isArray(rule.processes) ? rule.processes : [],
      priority: rule.priority || '',
      mode: rule.mode || 'block',
      // Set agent_name or group_name based on the rule type
      agent_name: rule.type === 'agent' ? rule.target : null,
      group_name: rule.type === 'group' ? rule.target : null,
      predefined_categories: rule.predefined_categories || []
    };
    setRuleToEdit(formattedRule);
    setShowEditModal(true);
  };

  const handleDeleteClick = (rule) => {
    console.log("selected rule1", rule)
    setRuleToDelete(rule);
    setShowDeleteConfirm(true);
  };

  const handleViewClick = (rule) => {
    setSelectedRule(rule);
    setShowViewModal(true);
  };

  const confirmDelete = async () => {
    if (!ruleToDelete?.rule_name) return;
    
    setIsLoading(true);
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${base_Api}delete_rule`, {
        data: { rule_name: ruleToDelete.rule_name },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setRules(prevRules => prevRules.filter(rule => rule.rule_name !== ruleToDelete.rule_name));
    } catch (error) {
      console.error('Error deleting rule:', error);
      setError('Failed to delete rule');
    } finally {
      setIsLoading(false);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setRuleToDelete(null);
    }
  };

  const handleRuleUpdated = (updatedRule) => {
    if (!updatedRule?.rule_name) return;
    setRules(prevRules => prevRules.map(rule => rule.rule_name === updatedRule.rule_name ? updatedRule : rule));
    setShowEditModal(false);
  };

  return (
    <>
      {isLoading && <Loader />}
      {error && <div className="text-center text-red-600 py-4">{error}</div>}
      <div className="w-full bg-white">
        <table className="w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rule Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domains
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Processes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRules.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  No rules found
                </td>
              </tr>
            ) : (
              filteredRules.map((rule, index) => (
                <tr key={`${rule.rule_name}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {rule.rule_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {rule.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {rule.target}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {truncateArray(rule.domains).map((domain, idx) => (
                        <span 
                          key={idx} 
                          className={`bg-gray-100 px-2 py-1 rounded-full text-xs ${
                            domain === '...' ? 'bg-gray-200 cursor-pointer hover:bg-gray-300' : ''
                          }`}
                          onClick={domain === '...' ? () => handleViewClick(rule) : undefined}
                          title={domain === '...' ? `${rule.domains.length - 2} more items` : domain}
                        >
                          {domain}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {rule.priority}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {truncateArray(rule.processes).map((process, idx) => (
                        <span 
                          key={idx} 
                          className={`bg-gray-100 px-2 py-1 rounded-full text-xs ${
                            process === '...' ? 'bg-gray-200 cursor-pointer hover:bg-gray-300' : ''
                          }`}
                          onClick={process === '...' ? () => handleViewClick(rule) : undefined}
                          title={process === '...' ? `${rule.processes.length - 2} more items` : process}
                        >
                          {process}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      rule.mode === 'block' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {rule.mode || 'block'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewClick(rule)}
                        className="text-blue-600 hover:text-blue-900"
                        aria-label="View rule"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditClick(rule)}
                        className="text-indigo-600 hover:text-indigo-900"
                        aria-label="Edit rule"
                        disabled={isDeleting}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(rule)}
                        className="text-red-600 hover:text-red-900"
                        aria-label="Delete rule"
                        disabled={isDeleting}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showViewModal && selectedRule && (
  <div className="fixed inset-0 backdrop-blur-sm bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-300 p-6 md:p-8">
  <div className="bg-white rounded-xl shadow-2xl w-full max-w-md md:max-w-3xl transform transition-all duration-300 scale-100 ease-out overflow-hidden m-4">
    {/* Header */}
    <div className="flex justify-between items-center p-5 md:p-6 border-b border-gray-200">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
        <Eye size={20} className="mr-3 text-blue-600 flex-shrink-0" />
        <span className="truncate">Rule Details</span>
      </h2>
      <button
        onClick={() => setShowViewModal(false)}
        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-3"
        aria-label="Close modal"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    {/* Content */}
    <div className="p-5 md:p-6 space-y-5 max-h-96 md:max-h-screen overflow-y-auto">
      {/* Three columns in one row - Summary section */}
      <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-100 shadow-sm lg:w-1/3">
          <span className="font-semibold text-gray-700 text-sm block mb-2">Rule Name:</span>
          <p className="text-gray-900 font-medium px-1">{selectedRule.rule_name || '-'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-100 shadow-sm lg:w-1/3">
          <span className="font-semibold text-gray-700 text-sm block mb-2">Target Type:</span>
          <p className="text-gray-900 px-1">{selectedRule.type || '-'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-100 shadow-sm lg:w-1/3">
          <span className="font-semibold text-gray-700 text-sm block mb-2">Target:</span>
          <p className="text-gray-900 break-all px-1">{selectedRule.target || '-'}</p>
        </div>
      </div>
      
      {/* Three columns in one row - Status section */}
      <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-100 shadow-sm lg:w-1/3">
          <span className="font-semibold text-gray-700 text-sm block mb-2">Mode:</span>
          <span className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full ${
            selectedRule.mode === 'block' 
              ? 'bg-red-100 text-red-800 border border-red-200' 
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
            {selectedRule.mode === 'block' && (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            )}
            {selectedRule.mode !== 'block' && (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {selectedRule.mode || 'block'}
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-100 shadow-sm lg:w-1/3">
          <span className="font-semibold text-gray-700 text-sm block mb-2">Created:</span>
          <p className="text-gray-900 px-1">{selectedRule.created_at || 'Not specified'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-100 shadow-sm lg:w-1/3">
          <span className="font-semibold text-gray-700 text-sm block mb-2">Last Updated:</span>
          <p className="text-gray-900 px-1">{selectedRule.updated_at || 'Not specified'}</p>
        </div>
      </div>
      
      {/* List sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-700 text-sm">Domains:</span>
            <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full ml-3">
              {selectedRule.domains.length} items
            </span>
          </div>
          <div className="text-gray-900 max-h-40 overflow-y-auto scrollbar-thin pr-1 rounded bg-white border border-gray-200 mt-2">
            {selectedRule.domains.length > 0 ? (
              selectedRule.domains.map((domain, idx) => (
                <div key={idx} className="py-2 px-3 border-b border-gray-200 last:border-0 hover:bg-blue-50 transition-colors duration-150">
                  {domain.trim()}
                </div>
              ))
            ) : (
              <div className="py-2 px-3 text-gray-500 italic">No domains specified</div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-700 text-sm">Processes:</span>
            <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full ml-3">
              {selectedRule.processes.length} items
            </span>
          </div>
          <div className="text-gray-900 max-h-40 overflow-y-auto scrollbar-thin pr-1 rounded bg-white border border-gray-200 mt-2">
            {selectedRule.processes.length > 0 ? (
              selectedRule.processes.map((process, idx) => (
                <div key={idx} className="py-2 px-3 border-b border-gray-200 last:border-0 hover:bg-blue-50 transition-colors duration-150">
                  {process.trim()}
                </div>
              ))
            ) : (
              <div className="py-2 px-3 text-gray-500 italic">No processes specified</div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-700 text-sm">OS Types</span>
            <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full ml-3">
              {selectedRule.target ? selectedRule.target.length : 0} items
            </span>
          </div>
          <div className="text-gray-900 max-h-40 overflow-y-auto scrollbar-thin pr-1 rounded bg-white border border-gray-200 mt-2">
            {selectedRule.tags && selectedRule.tags.length > 0 ? (
              selectedRule.tags.map((tag, idx) => (
                <div key={idx} className="py-2 px-3 border-b border-gray-200 last:border-0 hover:bg-blue-50 transition-colors duration-150">
                  {tag.trim()}
                </div>
              ))
            ) : (
              <div className="py-2 px-3 text-gray-500 italic">No tags specified</div>
            )}
          </div>
        </div>
      </div>
    </div>
    
    {/* Footer */}
    <div className="p-5 md:p-6 border-t border-gray-200 bg-gray-50 mt-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowViewModal(false)}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Close
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>
      )}

      {showDeleteConfirm && ruleToDelete && (
        <DeleteRuleModal 
        type = {ruleToDelete.type}
          ruleToDelete={ruleToDelete}
          setShowDeleteConfirm={setShowDeleteConfirm}
          confirmDelete={confirmDelete}
          isDeleting={isDeleting}
        />
      )}

      {showEditModal && ruleToEdit && (
        <EditRuleModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onRuleUpdated={handleRuleUpdated}
          rule={ruleToEdit}
        />
      )}
    </>
  );
}
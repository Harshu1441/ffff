import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import EditAppRuleModal from './editAppRuleModal';
import DeleteAppRuleModal from './deleteAppRuleModal';
import AddAppRuleModal from './addAppRuleModal';
import SuccessModal from '../../eventmodal/successmodal';
import axios from 'axios';
import base_Api from '../../../utils/baseapi2';
import ErrorModal from '../../eventmodal/errormodal';

export default function AppRuleTable({ searchTerm }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [errorModalConfig, setErrorModalConfig] = useState({
    show: false,
    message: '',
    subMessage: ''
  });
  const [successModalConfig, setSuccessModalConfig] = useState({
    show: false,
    message: ''
  });

  // Fetch rules from API
  const fetchRules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`${base_Api}app_list_all_rules`,{
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setRules(response.data.rules);
    } catch (error) {
      console.error('Error fetching rules:', error);
      setErrorModalConfig({
        show: true,
        message: 'Failed to Fetch Rules',
        subMessage: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleUpdateRule = async (rule) => {
    try {
      const token = localStorage.getItem('token');
      const payload = rule.type === 'agent' 
        ? {
            rule_name: rule.rule_name,
            agent_name: rule.target,
            processes: rule.processes,
            mode: rule.mode
          }
        : {
            rule_name: rule.rule_name,
            group_name: rule.target,
            mode: rule.mode
          };

      const response = await axios.put(`${base_Api}update_app_rule`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setSuccessModalConfig({
          show: true,
          message: 'Rule Updated Successfully'
        });
        await fetchRules();
      }
    } catch (error) {
      console.error('Error updating rule:', error);
      setErrorModalConfig({
        show: true,
        message: 'Failed to Update Rule',
        subMessage: error.response?.data?.message || error.message
      });
    }
  };

  const handleRuleAdded = async (newRule) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${base_Api}add_app_rule`, newRule, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setSuccessModalConfig({
          show: true,
          message: 'Rule Added Successfully'
        });
        await fetchRules();
      }
    } catch (error) {
      setErrorModalConfig({
        show: true,
        message: 'Failed to Add Rule',
        subMessage: error.response?.data?.message || error.message
      });
    }
  };

  const filteredRules = rules.filter((rule) => {
    if (!rule) return false;
    const search = searchTerm?.toLowerCase() || '';
    return (
      rule.rule_name?.toLowerCase().includes(search) ||
      rule.processes?.some(process => process.toLowerCase().includes(search)) ||
      rule.target?.toLowerCase().includes(search)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRules.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEditClick = (rule) => {
    setRuleToEdit(rule);
    setShowEditModal(true);
  };

  const handleDeleteClick = (rule) => {
    setRuleToDelete({
      rule_name: rule.rule_name,
      agent_name: rule.type === 'agent' ? rule.target : undefined,
      target: rule.target,
      type: rule.type,
      id: rule.id
    });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!ruleToDelete?.id) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${base_Api}delete_app_rule/${ruleToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setSuccessModalConfig({
          show: true,
          message: 'Rule Deleted Successfully'
        });
        await fetchRules();
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      setErrorModalConfig({
        show: true,
        message: 'Failed to Delete Rule',
        subMessage: error.response?.data?.message || error.message
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setRuleToDelete(null);
    }
  };

  const handleRuleUpdated = (updatedRule) => {
    if (!updatedRule?.id) return;
    handleUpdateRule(updatedRule);
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 flex justify-center">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm sm:text-base text-red-700">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-xs sm:text-sm text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
      
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rule
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mode
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No rules found
                  </td>
                </tr>
              ) : (
                currentItems.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {rule.rule_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{rule.rule_name}</div>
                          <div className="text-sm text-gray-500">ID: {rule.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{rule.type}</div>
                      <div className="text-xs text-gray-500">Type</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{rule.target}</div>
                      <div className="text-xs text-gray-500">Target</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {rule.processes.map((process, index) => (
                          <span 
                            key={index}
                            className="bg-gray-100 px-2 py-1 rounded-full text-xs"
                          >
                            {process}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        rule.mode === 'block' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {rule.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-3 justify-end">
                        <button
                          onClick={() => handleEditClick(rule)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded-full transition-colors"
                          disabled={isDeleting}
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(rule)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded-full transition-colors"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        
         
        </div>
      </div>

      {showDeleteConfirm && ruleToDelete && (
        <DeleteAppRuleModal 
          ruleToDelete={ruleToDelete}
          setShowDeleteConfirm={setShowDeleteConfirm}
          confirmDelete={confirmDelete}
          isDeleting={isDeleting}
        />
      )}

      {showEditModal && ruleToEdit && (
        <EditAppRuleModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          rule={ruleToEdit}
          onUpdate={handleRuleUpdated}
        />
      )}

      {showAddRuleModal && (
        <AddAppRuleModal
          isOpen={showAddRuleModal}
          onClose={() => setShowAddRuleModal(false)}
          onAdd={handleRuleAdded}
        />
      )}

      {errorModalConfig.show && (
        <ErrorModal
          isOpen={errorModalConfig.show}
          onClose={() => setErrorModalConfig({ ...errorModalConfig, show: false })}
          message={errorModalConfig.message}
          subMessage={errorModalConfig.subMessage}
        />
      )}

      {successModalConfig.show && (
        <SuccessModal
          isOpen={successModalConfig.show}
          onClose={() => setSuccessModalConfig({ ...successModalConfig, show: false })}
          message={successModalConfig.message}
        />
      )}
    </>
  );
}
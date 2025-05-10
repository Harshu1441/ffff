import React, { useState } from 'react';
import AppGroup from "./appBlock/appGroup";
import AppRuleTable from './appBlock/appRuleTable';
import AddAppRuleModal from './appBlock/addAppRuleModal';
import AppCategory from './appBlock/appCategory';
import { Plus, Search } from 'lucide-react';

const AppManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRuleAdded = (newRule) => {
    // Handle the new rule addition here
    console.log('New rule added:', newRule);
  };

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <AppGroup />
      
      <div className="bg-white rounded-lg shadow mt-4 sm:mt-6">
        <div className="p-3 sm:p-4 border-b border-gray-200 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-0">Application List</h2>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>

              <div className="w-full sm:w-auto">
                <AppCategory />
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
              >
                <Plus size={18} />
                <span>Add Rule</span>
              </button>
            </div>
          </div>
        </div>

        <AppRuleTable searchTerm={searchTerm} />
      </div>

      <AddAppRuleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onRuleAdded={handleRuleAdded}
      />
    </div>
  );
};

export default AppManagement;

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const AppCategory = () => {
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [predefinedRules, setPredefinedRules] = useState({
    'Social Media': ['facebook.com', 'twitter.com', 'instagram.com'],
    'Streaming': ['netflix.com', 'youtube.com', 'spotify.com'],
    'Gaming': ['steam.com', 'epicgames.com', 'origin.com']
  });
  const [newCategory, setNewCategory] = useState({
    name: '',
    domains: ['']
  });

  const handleAddDomainInput = () => {
    setNewCategory({
      ...newCategory,
      domains: [...newCategory.domains, '']
    });
  };

  const handleRemoveDomainInput = (index) => {
    setNewCategory({
      ...newCategory,
      domains: newCategory.domains.filter((_, i) => i !== index)
    });
  };

  const handleDomainChange = (index, value) => {
    const newDomains = [...newCategory.domains];
    newDomains[index] = value;
    setNewCategory({
      ...newCategory,
      domains: newDomains
    });
  };

  const handleCreateCategory = async () => {
    try {
      // Simulating API call with dummy data
      const newRules = {
        ...predefinedRules,
        [newCategory.name]: newCategory.domains.filter(domain => domain.trim() !== '')
      };
      setPredefinedRules(newRules);
      setShowCreateCategoryModal(false);
      setNewCategory({ name: '', domains: [''] });
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category. Please try again.');
    }
  };

  return (
    <div>
      <button 
        onClick={() => setShowCreateCategoryModal(true)}
        className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <Plus size={18} />
        <span>Create Category</span>
      </button>

      {/* Create Category Modal */}
      {showCreateCategoryModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create New Category</h3>
              <button 
                onClick={() => {
                  setShowCreateCategoryModal(false);
                  setNewCategory({ name: '', domains: [''] });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domains
                </label>
                {newCategory.domains.map((domain, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter domain (e.g., example.com)"
                      value={domain}
                      onChange={(e) => handleDomainChange(index, e.target.value)}
                    />
                    {newCategory.domains.length > 1 && (
                      <button
                        onClick={() => handleRemoveDomainInput(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddDomainInput}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add another domain
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowCreateCategoryModal(false);
                  setNewCategory({ name: '', domains: [''] });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!newCategory.name || newCategory.domains.every(domain => !domain.trim())}
                className={`px-4 py-2 rounded-md ${
                  !newCategory.name || newCategory.domains.every(domain => !domain.trim())
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppCategory;
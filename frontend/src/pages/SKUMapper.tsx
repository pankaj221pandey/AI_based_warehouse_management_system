import React, { useState, useEffect } from 'react';
import { getSKUMappings, createSKUMapping } from '../services/api';

interface SKUMapping {
  id: string;
  sku: string;
  msku: string;
  marketplace?: string;
}

const SKUMapper: React.FC = () => {
  const [mappings, setMappings] = useState<SKUMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMapping, setNewMapping] = useState({
    sku: '',
    msku: '',
    marketplace: ''
  });

  useEffect(() => {
    loadMappings();
  }, []);

  const loadMappings = async () => {
    try {
      const data = await getSKUMappings();
      setMappings(data);
    } catch (error) {
      console.error('Error loading mappings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSKUMapping(newMapping.sku, newMapping.msku, newMapping.marketplace);
      setNewMapping({ sku: '', msku: '', marketplace: '' });
      loadMappings();
    } catch (error) {
      console.error('Error creating mapping:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">SKU Mapper</h1>
        <p className="mt-2 text-gray-600">Map your SKUs to Master SKUs (MSKUs)</p>
      </div>

      {/* Add New Mapping Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Mapping</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                SKU
              </label>
              <input
                type="text"
                id="sku"
                value={newMapping.sku}
                onChange={(e) => setNewMapping({ ...newMapping, sku: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="msku" className="block text-sm font-medium text-gray-700">
                MSKU
              </label>
              <input
                type="text"
                id="msku"
                value={newMapping.msku}
                onChange={(e) => setNewMapping({ ...newMapping, msku: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="marketplace" className="block text-sm font-medium text-gray-700">
                Marketplace
              </label>
              <select
                id="marketplace"
                value={newMapping.marketplace}
                onChange={(e) => setNewMapping({ ...newMapping, marketplace: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select marketplace</option>
                <option value="Amazon">Amazon</option>
                <option value="eBay">eBay</option>
                <option value="Shopify">Shopify</option>
                <option value="WooCommerce">WooCommerce</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add Mapping
          </button>
        </form>
      </div>

      {/* Existing Mappings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Mappings</h3>
        {mappings.length === 0 ? (
          <p className="text-gray-500">No mappings found. Add your first mapping above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MSKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marketplace
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mappings.map((mapping) => (
                  <tr key={mapping.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {mapping.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mapping.msku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mapping.marketplace || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SKUMapper; 
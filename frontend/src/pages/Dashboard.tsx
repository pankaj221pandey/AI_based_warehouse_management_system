import React from 'react';
import { useQuery } from 'react-query';
import { 
  CurrencyDollarIcon, 
  CubeIcon, 
  ShoppingCartIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMetrics } from '../services/api';

const Dashboard: React.FC = () => {
  const { data: metrics, isLoading, error } = useQuery('metrics', getMetrics);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">Error loading dashboard data</div>
      </div>
    );
  }

  const metricCards = [
    {
      name: 'Total Products',
      value: metrics?.total_products || 0,
      icon: CubeIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Orders',
      value: metrics?.total_orders || 0,
      icon: ShoppingCartIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Sales',
      value: metrics?.total_sales || 0,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Revenue',
      value: `$${(metrics?.total_revenue || 0).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
    },
  ];

  const chartData = [
    { name: 'Product A', revenue: 1000, quantity: 50 },
    { name: 'Product B', revenue: 800, quantity: 30 },
    { name: 'Product C', revenue: 600, quantity: 25 },
    { name: 'Product D', revenue: 400, quantity: 20 },
    { name: 'Product E', revenue: 300, quantity: 15 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of your warehouse management system</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => (
          <div
            key={card.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <card.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {card.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Product</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CubeIcon className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  New product added
                </p>
                <p className="text-sm text-gray-500">
                  Product "ABC123" was added to inventory
                </p>
              </div>
              <div className="text-sm text-gray-500">
                2 hours ago
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingCartIcon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Order processed
                </p>
                <p className="text-sm text-gray-500">
                  Order #12345 was completed
                </p>
              </div>
              <div className="text-sm text-gray-500">
                4 hours ago
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <CurrencyDollarIcon className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Revenue milestone
                </p>
                <p className="text-sm text-gray-500">
                  Monthly revenue target achieved
                </p>
              </div>
              <div className="text-sm text-gray-500">
                1 day ago
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
            Upload Data
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            Map SKUs
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
            AI Query
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
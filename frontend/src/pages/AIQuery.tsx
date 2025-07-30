import React, { useState } from 'react';
import { submitAIQuery } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AIQuery: React.FC = () => {
  const [query, setQuery] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await submitAIQuery({
        query: query.trim(),
        chart_type: chartType,
        openai_key: openaiKey
      });
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!result?.chart_data) return null;

    const { chart_data } = result;
    const data = chart_data.labels.map((label: string, index: number) => ({
      name: label,
      value: chart_data.datasets[0].data[index]
    }));

    if (chart_data.type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chart_data.type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#3B82F6" />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Data Query</h1>
        <p className="mt-2 text-gray-600">Ask questions about your data in natural language</p>
      </div>

      {/* Query Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ask a Question</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OpenAI API Key Input */}
          <div>
            <label htmlFor="openai-key" className="block text-sm font-medium text-gray-700">
              OpenAI API Key
            </label>
            <div className="mt-1 relative">
              <input
                id="openai-key"
                type={showKey ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="Enter your OpenAI API key"
                className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showKey ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Your API key is stored locally and not shared
            </p>
          </div>

          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700">
              Your Question
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What are my top 5 products by revenue?"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="chartType" className="block text-sm font-medium text-gray-700">
                Chart Type
              </label>
              <select
                id="chartType"
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="none">No Chart</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Ask Question'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 bg-red-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Query and SQL */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Query Results</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Your Question</h4>
                <p className="text-sm text-gray-900 mt-1">{result.query}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Generated SQL</h4>
                <pre className="mt-1 text-sm bg-gray-50 p-3 rounded-md overflow-x-auto">
                  {result.sql}
                </pre>
              </div>
            </div>
          </div>

          {/* Chart */}
          {result.chart_data && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Visualization</h3>
              {renderChart()}
            </div>
          )}

          {/* Data Table */}
          {result.result?.data && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Data Results</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {result.result.columns.map((column: string) => (
                        <th
                          key={column}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.result.data.map((row: any[], index: number) => (
                      <tr key={index}>
                        {row.map((cell: any, cellIndex: number) => (
                          <td
                            key={cellIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Example Questions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Example Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <button
              onClick={() => setQuery('What are my top 5 products by revenue?')}
              className="text-left text-sm text-indigo-600 hover:text-indigo-900 block"
            >
              What are my top 5 products by revenue?
            </button>
            <button
              onClick={() => setQuery('Show me total sales by marketplace')}
              className="text-left text-sm text-indigo-600 hover:text-indigo-900 block"
            >
              Show me total sales by marketplace
            </button>
            <button
              onClick={() => setQuery('What is the average order value?')}
              className="text-left text-sm text-indigo-600 hover:text-indigo-900 block"
            >
              What is the average order value?
            </button>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => setQuery('Which products have the highest profit margin?')}
              className="text-left text-sm text-indigo-600 hover:text-indigo-900 block"
            >
              Which products have the highest profit margin?
            </button>
            <button
              onClick={() => setQuery('Show me sales trends over time')}
              className="text-left text-sm text-indigo-600 hover:text-indigo-900 block"
            >
              Show me sales trends over time
            </button>
            <button
              onClick={() => setQuery('What is my total revenue this month?')}
              className="text-left text-sm text-indigo-600 hover:text-indigo-900 block"
            >
              What is my total revenue this month?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIQuery; 
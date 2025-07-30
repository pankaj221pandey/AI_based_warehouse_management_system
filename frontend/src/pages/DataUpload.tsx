import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, DocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { uploadSalesData } from '../services/api';

const DataUpload: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      const result = await uploadSalesData(file);
      setUploadResult(result);
      setUploadStatus('success');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.detail || 'Upload failed');
      setUploadStatus('error');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Upload</h1>
        <p className="mt-2 text-gray-600">Upload your sales data or SKU mapping CSV files for processing</p>
      </div>

      {/* Upload Area */}
      <div className="bg-white p-8 rounded-lg shadow">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop the file here' : 'Drag and drop a file here'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              or click to select a file
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports CSV, XLS, and XLSX files for sales data or SKU mappings
            </p>
          </div>
        </div>
      </div>

      {/* Upload Status */}
      {uploadStatus !== 'idle' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Status</h3>
          
          {uploadStatus === 'uploading' && (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
              <span className="text-gray-700">Processing your file...</span>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-green-600">
                <CheckIcon className="h-6 w-6" />
                <span className="font-medium">Upload successful!</span>
              </div>
              
              {uploadResult && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Upload Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Rows processed:</span>
                      <span className="ml-2 font-medium">{uploadResult.rows_processed}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-2 font-medium text-green-600">Success</span>
                    </div>
                  </div>
                  
                  {uploadResult.sample_data && uploadResult.sample_data.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2">Sample Data</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {Object.keys(uploadResult.sample_data[0]).map((key) => (
                                <th
                                  key={key}
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {uploadResult.sample_data.map((row: any, index: number) => (
                              <tr key={index}>
                                {Object.values(row).map((value: any, cellIndex: number) => (
                                  <td
                                    key={cellIndex}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                  >
                                    {value}
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
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex items-center space-x-3 text-red-600">
              <div className="h-6 w-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">!</span>
              </div>
              <span className="font-medium">Upload failed: {errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">File Requirements</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-3">
            <DocumentIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Supported Formats</p>
              <p>CSV, XLS, and XLSX files are supported</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <DocumentIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Required Columns</p>
              <p>Your file should include columns for SKU, product name, quantity, and revenue</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <DocumentIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Data Processing</p>
              <p>Uploaded data will be automatically cleaned and mapped to your existing SKU mappings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataUpload; 
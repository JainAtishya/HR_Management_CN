'use client';

import { useState, useEffect } from 'react';
import { warningsAPI } from '@/lib/api';

interface Warning {
  _id: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  category: string;
  status: 'Active' | 'Resolved';
  member: {
    _id: string;
    name: string;
    email: string;
    studentId: string;
  };
  issuedBy: {
    name: string;
    email: string;
  };
  issuedDate: string;
  resolvedDate?: string;
}

export default function WarningsPage() {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWarnings();
  }, []);

  const fetchWarnings = async () => {
    try {
      setLoading(true);
      // Demo data for warnings
      const demoWarnings: Warning[] = [
        {
          _id: '1',
          title: 'Attendance Issue',
          description: 'Missed 3 consecutive meetings without prior notice',
          severity: 'Medium',
          category: 'Attendance',
          status: 'Active',
          member: {
            _id: '1',
            name: 'Alice Johnson',
            email: 'alice.johnson@example.com',
            studentId: 'CS2021005'
          },
          issuedBy: {
            name: 'Admin User',
            email: 'admin@codingninjasclub.com'
          },
          issuedDate: '2024-10-01',
        },
        {
          _id: '2',
          title: 'Code of Conduct Violation',
          description: 'Inappropriate behavior during team meeting',
          severity: 'High',
          category: 'Behavior',
          status: 'Resolved',
          member: {
            _id: '2',
            name: 'Bob Wilson',
            email: 'bob.wilson@example.com',
            studentId: 'IT2021006'
          },
          issuedBy: {
            name: 'HR Manager',
            email: 'hr@codingninjasclub.com'
          },
          issuedDate: '2024-09-28',
          resolvedDate: '2024-10-02'
        },
        {
          _id: '3',
          title: 'Project Deadline Miss',
          description: 'Failed to submit project deliverables on time',
          severity: 'Low',
          category: 'Performance',
          status: 'Active',
          member: {
            _id: '3',
            name: 'Carol Smith',
            email: 'carol.smith@example.com',
            studentId: 'ECE2021007'
          },
          issuedBy: {
            name: 'Admin User',
            email: 'admin@codingninjasclub.com'
          },
          issuedDate: '2024-09-30',
        }
      ];
      
      setWarnings(demoWarnings);
    } catch (error) {
      console.error('Error fetching warnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWarnings = warnings.filter(warning => {
    const matchesSearch = warning.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warning.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warning.member.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === '' || warning.severity === selectedSeverity;
    const matchesStatus = selectedStatus === '' || warning.status === selectedStatus;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (severity: string) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    switch (severity) {
      case 'High':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Low':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    if (status === 'Active') {
      return `${baseClasses} bg-red-100 text-red-800`;
    } else {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warnings</h1>
          <p className="text-gray-600">Manage member warnings and disciplinary actions</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium">
          Issue Warning
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search warnings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSeverity('');
                setSelectedStatus('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Warnings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warning
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issued Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWarnings.map((warning) => (
                <tr key={warning._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{warning.title}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{warning.description}</div>
                      <div className="text-xs text-gray-400 mt-1">Category: {warning.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{warning.member.name}</div>
                      <div className="text-sm text-gray-500">{warning.member.studentId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getSeverityBadge(warning.severity)}>
                      {warning.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(warning.status)}>
                      {warning.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{new Date(warning.issuedDate).toLocaleDateString()}</div>
                      {warning.resolvedDate && (
                        <div className="text-xs text-green-600">
                          Resolved: {new Date(warning.resolvedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-orange-600 hover:text-orange-900 mr-4">View</button>
                    {warning.status === 'Active' && (
                      <button className="text-green-600 hover:text-green-900">Resolve</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredWarnings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No warnings found matching your criteria.</div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{warnings.length}</div>
          <div className="text-sm text-gray-600">Total Warnings</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {warnings.filter(w => w.status === 'Active').length}
          </div>
          <div className="text-sm text-gray-600">Active Warnings</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            {warnings.filter(w => w.severity === 'High').length}
          </div>
          <div className="text-sm text-gray-600">High Severity</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {warnings.filter(w => w.status === 'Resolved').length}
          </div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
      </div>
    </div>
  );
}
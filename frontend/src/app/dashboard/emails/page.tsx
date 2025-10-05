'use client';

import { useState, useEffect } from 'react';
import { emailsAPI } from '@/lib/api';

interface Email {
  _id: string;
  subject: string;
  body: string;
  recipient: {
    name: string;
    email: string;
    studentId?: string;
  };
  sender: {
    name: string;
    email: string;
  };
  type: 'Warning' | 'Welcome' | 'Reminder' | 'Update' | 'General';
  status: 'Sent' | 'Failed' | 'Pending';
  sentDate: string;
  openedDate?: string;
  templateUsed?: string;
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      // Demo data for emails
      const demoEmails: Email[] = [
        {
          _id: '1',
          subject: 'Warning: Attendance Issue',
          body: 'This is to inform you about your recent attendance issues...',
          recipient: {
            name: 'Alice Johnson',
            email: 'alice.johnson@example.com',
            studentId: 'CS2021005'
          },
          sender: {
            name: 'Admin User',
            email: 'admin@codingninjasclub.com'
          },
          type: 'Warning',
          status: 'Sent',
          sentDate: '2024-10-01T10:30:00Z',
          openedDate: '2024-10-01T14:25:00Z',
          templateUsed: 'warning-template'
        },
        {
          _id: '2',
          subject: 'Welcome to Coding Ninjas Club!',
          body: 'Welcome to our amazing community of developers...',
          recipient: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            studentId: 'CS2024001'
          },
          sender: {
            name: 'HR Manager',
            email: 'hr@codingninjasclub.com'
          },
          type: 'Welcome',
          status: 'Sent',
          sentDate: '2024-09-30T09:15:00Z',
          openedDate: '2024-09-30T11:45:00Z',
          templateUsed: 'welcome-template'
        },
        {
          _id: '3',
          subject: 'Meeting Reminder',
          body: 'Don\'t forget about tomorrow\'s team meeting...',
          recipient: {
            name: 'Bob Wilson',
            email: 'bob.wilson@example.com',
            studentId: 'IT2021006'
          },
          sender: {
            name: 'Admin User',
            email: 'admin@codingninjasclub.com'
          },
          type: 'Reminder',
          status: 'Sent',
          sentDate: '2024-09-29T16:00:00Z',
          templateUsed: 'reminder-template'
        },
        {
          _id: '4',
          subject: 'Project Update Required',
          body: 'Please update your project status in the system...',
          recipient: {
            name: 'Carol Smith',
            email: 'carol.smith@example.com',
            studentId: 'ECE2021007'
          },
          sender: {
            name: 'HR Manager',
            email: 'hr@codingninjasclub.com'
          },
          type: 'Update',
          status: 'Failed',
          sentDate: '2024-09-28T13:20:00Z'
        }
      ];
      
      setEmails(demoEmails);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.recipient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '' || email.type === selectedType;
    const matchesStatus = selectedStatus === '' || email.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeBadge = (type: string) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    switch (type) {
      case 'Warning':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Welcome':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Reminder':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Update':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    switch (status) {
      case 'Sent':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
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
          <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
          <p className="text-gray-600">Send and manage club member communications</p>
        </div>
        <button 
          onClick={() => setShowCompose(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          Compose Email
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{emails.length}</div>
          <div className="text-sm text-gray-600">Total Emails</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {emails.filter(e => e.status === 'Sent').length}
          </div>
          <div className="text-sm text-gray-600">Successfully Sent</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            {emails.filter(e => e.openedDate).length}
          </div>
          <div className="text-sm text-gray-600">Opened</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {emails.filter(e => e.status === 'Failed').length}
          </div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Types</option>
              <option value="Warning">Warning</option>
              <option value="Welcome">Welcome</option>
              <option value="Reminder">Reminder</option>
              <option value="Update">Update</option>
              <option value="General">General</option>
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
              <option value="Sent">Sent</option>
              <option value="Failed">Failed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('');
                setSelectedStatus('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Emails Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmails.map((email) => (
                <tr key={email._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{email.subject}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{email.body}</div>
                      {email.templateUsed && (
                        <div className="text-xs text-gray-400 mt-1">Template: {email.templateUsed}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{email.recipient.name}</div>
                      <div className="text-sm text-gray-500">{email.recipient.email}</div>
                      {email.recipient.studentId && (
                        <div className="text-xs text-gray-400">{email.recipient.studentId}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getTypeBadge(email.type)}>
                      {email.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className={getStatusBadge(email.status)}>
                        {email.status}
                      </span>
                      {email.openedDate && (
                        <div className="text-xs text-green-600 mt-1">
                          Opened: {new Date(email.openedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{new Date(email.sentDate).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(email.sentDate).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-orange-600 hover:text-orange-900 mr-4">View</button>
                    {email.status === 'Failed' && (
                      <button className="text-blue-600 hover:text-blue-900">Resend</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredEmails.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No emails found matching your criteria.</div>
          </div>
        )}
      </div>

      {/* Compose Email Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Compose Email</h2>
              <button
                onClick={() => setShowCompose(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <input
                  type="email"
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="Email subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="General">General</option>
                  <option value="Warning">Warning</option>
                  <option value="Welcome">Welcome</option>
                  <option value="Reminder">Reminder</option>
                  <option value="Update">Update</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  rows={8}
                  placeholder="Email content..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
                >
                  Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
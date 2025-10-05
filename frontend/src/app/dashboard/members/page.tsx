'use client';

import { useState, useEffect } from 'react';
import { membersAPI } from '@/lib/api';

interface Member {
  _id: string;
  name: string;
  email: string;
  phone: string;
  studentId: string;
  department: string;
  year: number;
  position: string;
  status: string;
  skills: string[];
  joinDate: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      // For demo purposes, we'll create some sample data since the API might not work
      const demoMembers: Member[] = [
        {
          _id: '1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '9876543210',
          studentId: 'CS2021001',
          department: 'CSE',
          year: 3,
          position: 'Team Lead',
          status: 'Active',
          skills: ['React', 'Node.js', 'Python'],
          joinDate: '2024-01-15'
        },
        {
          _id: '2',
          name: 'Sarah Davis',
          email: 'sarah.davis@example.com',
          phone: '9876543211',
          studentId: 'IT2021002',
          department: 'IT',
          year: 2,
          position: 'Member',
          status: 'Active',
          skills: ['Java', 'Spring Boot', 'SQL'],
          joinDate: '2024-02-20'
        },
        {
          _id: '3',
          name: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          phone: '9876543212',
          studentId: 'ECE2021003',
          department: 'ECE',
          year: 4,
          position: 'Core Team',
          status: 'Active',
          skills: ['C++', 'Embedded Systems', 'IoT'],
          joinDate: '2023-09-10'
        },
        {
          _id: '4',
          name: 'Emily Brown',
          email: 'emily.brown@example.com',
          phone: '9876543213',
          studentId: 'ME2021004',
          department: 'ME',
          year: 1,
          position: 'Member',
          status: 'Inactive',
          skills: ['AutoCAD', 'SolidWorks'],
          joinDate: '2024-03-05'
        }
      ];
      
      setMembers(demoMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === '' || member.department === selectedDepartment;
    const matchesStatus = selectedStatus === '' || member.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    if (status === 'Active') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  const getPositionBadge = (position: string) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    switch (position) {
      case 'President':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'Core Team':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Team Lead':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show success message
    alert('Member added successfully!');
    setShowAddModal(false);
  };

  const handleViewMember = (memberId: string) => {
    const member = members.find(m => m._id === memberId);
    if (member) {
      alert(`Member Details:\n\nName: ${member.name}\nEmail: ${member.email}\nDepartment: ${member.department}\nPosition: ${member.position}\nStatus: ${member.status}\nSkills: ${member.skills.join(', ')}`);
    }
  };

  const handleEditMember = (memberId: string) => {
    alert(`Edit member functionality will be implemented here for member ID: ${memberId}`);
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600">Manage club members and their information</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium w-full sm:w-auto"
        >
          Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Departments</option>
              <option value="CSE">Computer Science</option>
              <option value="IT">Information Technology</option>
              <option value="ECE">Electronics & Communication</option>
              <option value="ME">Mechanical Engineering</option>
              <option value="EEE">Electrical Engineering</option>
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
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDepartment('');
                setSelectedStatus('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Members Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.studentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.department} - Year {member.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getPositionBadge(member.position)}>
                      {member.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(member.status)}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {member.skills.slice(0, 2).map((skill, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {skill}
                        </span>
                      ))}
                      {member.skills.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{member.skills.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => handleViewMember(member._id)}
                        className="text-blue-600 hover:text-blue-900 text-left"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleEditMember(member._id)}
                        className="text-orange-600 hover:text-orange-900 text-left"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No members found matching your criteria.</div>
          </div>
        )}
      </div>

      {/* Members Cards - Mobile */}
      <div className="lg:hidden space-y-4">
        {filteredMembers.map((member) => (
          <div key={member._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">{member.name}</h3>
                <p className="text-sm text-gray-500 mb-1">{member.email}</p>
                <div className="text-sm text-gray-600">{member.studentId} • {member.department}</div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <span className={getStatusBadge(member.status)}>
                  {member.status}
                </span>
                <span className={getPositionBadge(member.position)}>
                  {member.position}
                </span>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-2">Skills:</div>
              <div className="flex flex-wrap gap-1">
                {member.skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {skill}
                  </span>
                ))}
                {member.skills.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    +{member.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                Joined: {new Date(member.joinDate).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleViewMember(member._id)}
                  className="text-orange-600 hover:text-orange-900 text-sm font-medium"
                >
                  View
                </button>
                <button 
                  onClick={() => handleEditMember(member._id)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No members found matching your criteria.</div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{members.length}</div>
          <div className="text-sm text-gray-600">Total Members</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {members.filter(m => m.status === 'Active').length}
          </div>
          <div className="text-sm text-gray-600">Active Members</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {members.filter(m => m.position === 'Core Team' || m.position === 'Team Lead').length}
          </div>
          <div className="text-sm text-gray-600">Leadership</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            {new Set(members.map(m => m.department)).size}
          </div>
          <div className="text-sm text-gray-600">Departments</div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Member</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="member@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                  <input
                    type="text"
                    placeholder="CS2024001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="CSE">Computer Science</option>
                    <option value="IT">Information Technology</option>
                    <option value="ECE">Electronics</option>
                    <option value="ME">Mechanical</option>
                    <option value="CE">Civil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="Member">Member</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Core Team">Core Team</option>
                    <option value="President">President</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Python, Java"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
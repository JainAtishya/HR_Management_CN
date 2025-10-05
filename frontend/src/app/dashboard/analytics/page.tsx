'use client';

import { useState, useEffect } from 'react';
import { analyticsAPI } from '@/lib/api';

interface AnalyticsData {
  overview: {
    totalMembers: number;
    activeMembers: number;
    totalWarnings: number;
    emailsSent: number;
  };
  membersByDepartment: Array<{
    department: string;
    count: number;
  }>;
  warningsTrend: Array<{
    month: string;
    warnings: number;
  }>;
  emailStats: {
    sent: number;
    opened: number;
    failed: number;
  };
  memberGrowth: Array<{
    month: string;
    members: number;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('last6months');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Demo analytics data
      const demoAnalytics: AnalyticsData = {
        overview: {
          totalMembers: 156,
          activeMembers: 142,
          totalWarnings: 23,
          emailsSent: 89
        },
        membersByDepartment: [
          { department: 'Computer Science', count: 45 },
          { department: 'Information Technology', count: 38 },
          { department: 'Electronics', count: 29 },
          { department: 'Mechanical', count: 25 },
          { department: 'Civil', count: 19 }
        ],
        warningsTrend: [
          { month: 'May', warnings: 8 },
          { month: 'Jun', warnings: 6 },
          { month: 'Jul', warnings: 12 },
          { month: 'Aug', warnings: 9 },
          { month: 'Sep', warnings: 15 },
          { month: 'Oct', warnings: 7 }
        ],
        emailStats: {
          sent: 89,
          opened: 67,
          failed: 3
        },
        memberGrowth: [
          { month: 'May', members: 125 },
          { month: 'Jun', members: 132 },
          { month: 'Jul', members: 138 },
          { month: 'Aug', members: 145 },
          { month: 'Sep', members: 151 },
          { month: 'Oct', members: 156 }
        ]
      };
      
      setAnalytics(demoAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights and statistics</p>
        </div>
        <div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="last30days">Last 30 Days</option>
            <option value="last3months">Last 3 Months</option>
            <option value="last6months">Last 6 Months</option>
            <option value="lastyear">Last Year</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{analytics.overview.totalMembers}</div>
              <div className="text-sm text-gray-600">Total Members</div>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-green-600 text-sm">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{analytics.overview.activeMembers}</div>
              <div className="text-sm text-gray-600">Active Members</div>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-green-600 text-sm">91% activity rate</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{analytics.overview.totalWarnings}</div>
              <div className="text-sm text-gray-600">Total Warnings</div>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-red-600 text-sm">-23% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{analytics.overview.emailsSent}</div>
              <div className="text-sm text-gray-600">Emails Sent</div>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-green-600 text-sm">75% open rate</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Growth Trend</h3>
          <div className="h-64">
            <div className="flex items-end justify-between h-48 space-x-2">
              {analytics.memberGrowth.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-blue-500 w-full rounded-t"
                    style={{
                      height: `${(data.members / Math.max(...analytics.memberGrowth.map(d => d.members))) * 100}%`,
                      minHeight: '20px'
                    }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-2">{data.month}</div>
                  <div className="text-xs font-medium text-gray-900">{data.members}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warnings Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Warnings Trend</h3>
          <div className="h-64">
            <div className="flex items-end justify-between h-48 space-x-2">
              {analytics.warningsTrend.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-red-500 w-full rounded-t"
                    style={{
                      height: `${(data.warnings / Math.max(...analytics.warningsTrend.map(d => d.warnings))) * 100}%`,
                      minHeight: '20px'
                    }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-2">{data.month}</div>
                  <div className="text-xs font-medium text-gray-900">{data.warnings}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Members by Department & Email Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members by Department */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Members by Department</h3>
          <div className="space-y-4">
            {analytics.membersByDepartment.map((dept, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">{dept.department}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: `${(dept.count / Math.max(...analytics.membersByDepartment.map(d => d.count))) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-sm font-medium text-gray-700 w-8">{dept.count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Performance</h3>
          <div className="space-y-6">
            <div className="text-center">
              <div className="relative inline-block">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(analytics.emailStats.opened / analytics.emailStats.sent) * 351.86} 351.86`}
                    className="text-green-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round((analytics.emailStats.opened / analytics.emailStats.sent) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Open Rate</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">{analytics.emailStats.sent}</div>
                <div className="text-xs text-gray-600">Sent</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{analytics.emailStats.opened}</div>
                <div className="text-xs text-gray-600">Opened</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{analytics.emailStats.failed}</div>
                <div className="text-xs text-gray-600">Failed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="text-sm text-gray-900">New member John Doe joined Computer Science department</div>
            <div className="text-xs text-gray-500">2 hours ago</div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="text-sm text-gray-900">Warning issued to Alice Johnson for attendance</div>
            <div className="text-xs text-gray-500">4 hours ago</div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="text-sm text-gray-900">Bulk email sent to all active members</div>
            <div className="text-xs text-gray-500">1 day ago</div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="text-sm text-gray-900">Warning resolved for Bob Wilson</div>
            <div className="text-xs text-gray-500">2 days ago</div>
          </div>
        </div>
      </div>
    </div>
  );
}
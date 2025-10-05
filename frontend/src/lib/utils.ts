// Authentication utilities
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('hr_token') !== null;
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hr_token');
};

export const getUser = (): any | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('hr_user');
  return user ? JSON.parse(user) : null;
};

export const setAuth = (token: string, user: any): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('hr_token', token);
  localStorage.setItem('hr_user', JSON.stringify(user));
};

export const clearAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('hr_token');
  localStorage.removeItem('hr_user');
};

// Date utilities
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 7) {
    return formatDate(date);
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

// Text utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const validateStudentId = (studentId: string): boolean => {
  return studentId.length >= 3 && studentId.length <= 20;
};

// Status utilities
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    Active: 'text-green-800 bg-green-100',
    Inactive: 'text-gray-800 bg-gray-100',
    Suspended: 'text-red-800 bg-red-100',
    Resolved: 'text-green-800 bg-green-100',
    Pending: 'text-yellow-800 bg-yellow-100',
    Failed: 'text-red-800 bg-red-100',
    Sent: 'text-green-800 bg-green-100',
    Low: 'text-blue-800 bg-blue-100',
    Medium: 'text-yellow-800 bg-yellow-100',
    High: 'text-orange-800 bg-orange-100',
    Critical: 'text-red-800 bg-red-100',
  };
  return statusColors[status] || 'text-gray-800 bg-gray-100';
};

export const getSeverityColor = (severity: string): string => {
  const severityColors: Record<string, string> = {
    Low: 'text-blue-700 bg-blue-100 border-blue-200',
    Medium: 'text-yellow-700 bg-yellow-100 border-yellow-200',
    High: 'text-orange-700 bg-orange-100 border-orange-200',
    Critical: 'text-red-700 bg-red-100 border-red-200',
  };
  return severityColors[severity] || 'text-gray-700 bg-gray-100 border-gray-200';
};

// Chart utilities
export const generateChartColors = (count: number): string[] => {
  const colors = [
    '#ff6b35', '#1e3a8a', '#1e293b', '#10b981', '#f59e0b',
    '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Search and filter utilities
export const filterBySearch = (items: any[], searchTerm: string, searchFields: string[]): any[] => {
  if (!searchTerm) return items;
  
  const search = searchTerm.toLowerCase();
  return items.filter(item =>
    searchFields.some(field => {
      const value = getNestedValue(item, field);
      return value && value.toString().toLowerCase().includes(search);
    })
  );
};

export const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Sorting utilities
export const sortByField = (items: any[], field: string, direction: 'asc' | 'desc'): any[] => {
  return [...items].sort((a, b) => {
    const aVal = getNestedValue(a, field);
    const bVal = getNestedValue(b, field);
    
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    let comparison = 0;
    if (aVal > bVal) comparison = 1;
    if (aVal < bVal) comparison = -1;
    
    return direction === 'desc' ? -comparison : comparison;
  });
};

// Export utilities
export const downloadFile = (data: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Toast notification utility (for integration with toast library)
export const showToast = {
  success: (message: string) => {
    // Integration point for toast library
    console.log('SUCCESS:', message);
  },
  error: (message: string) => {
    console.log('ERROR:', message);
  },
  info: (message: string) => {
    console.log('INFO:', message);
  },
  warning: (message: string) => {
    console.log('WARNING:', message);
  },
};
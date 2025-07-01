import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Shield, UserCheck, Clock } from 'lucide-react';
import api from '../utils/api';

interface Stats {
  totalUsers: number;
  totalRoles: number;
  activeUsers: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRoles: 0,
    activeUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.permissions?.includes('manage_users')) {
          const [usersResponse, rolesResponse] = await Promise.all([
            api.get('/users'),
            api.get('/roles')
          ]);
          
          const users = usersResponse.data;
          const roles = rolesResponse.data;
          
          setStats({
            totalUsers: users.length,
            totalRoles: roles.length,
            activeUsers: users.filter((u: any) => u.isActive).length
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'developer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'designer':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'tester':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-blue-100">
              You're logged in as {' '}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user?.role || '')}`}>
                {user?.role}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">
              Last login: {new Date().toLocaleDateString()}
            </p>
            <p className="text-blue-100 text-sm">
              <Clock className="inline h-4 w-4 mr-1" />
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {user?.permissions?.includes('manage_users') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRoles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Overview */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Permissions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {user?.permissions?.map((permission) => (
            <div
              key={permission}
              className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 text-center"
            >
              <p className="text-sm font-medium text-blue-800 capitalize">
                {permission.replace('_', ' ')}
              </p>
            </div>
          )) || (
            <p className="text-gray-500 col-span-full">No permissions assigned</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {user?.permissions?.includes('manage_users') && (
            <a
              href="/users"
              className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 transform hover:scale-105"
            >
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-blue-900">Manage Users</h3>
                <p className="text-sm text-blue-600">Add, edit, or remove users</p>
              </div>
            </a>
          )}

          {user?.permissions?.includes('manage_roles') && (
            <a
              href="/roles"
              className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200 transform hover:scale-105"
            >
              <Shield className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-medium text-purple-900">Manage Roles</h3>
                <p className="text-sm text-purple-600">Create and configure roles</p>
              </div>
            </a>
          )}

          <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
            <UserCheck className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h3 className="font-medium text-green-900">Profile Settings</h3>
              <p className="text-sm text-green-600">Update your profile</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
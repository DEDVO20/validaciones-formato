import { getAuthToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface Stats {
  totalUsers: number;
  totalFormats: number;
  totalCompletions: number;
  totalValidations: number;
  completionsByStatus: Array<{ 
    estado: string; 
    name: string;
    count: number;
    percentage: number;
  }>;
  validationsByStatus: Array<{ estado: string; count: number }>;
  formatsByStatus: Array<{ estado: string; count: number }>;
  recentActivity: Array<{
    type: string;
    createdAt: string;
  }>;
  monthlyStats: Array<{ month: string; completions: number; validations: number }>;
}

export interface UserStats {
  userCompletions: number;
  userValidations: number;
  userFormats: number;
  userCompletionsByStatus: Array<{ estado: string; count: number }>;
}

export const getStats = async (): Promise<Stats> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener estadísticas');
  }

  return response.json();
};

export const getUserStats = async (): Promise<UserStats> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/stats/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener estadísticas del usuario');
  }

  return response.json();
};
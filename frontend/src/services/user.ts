import { getAuthToken } from './auth';

export interface User {
  id: number;
  nombre: string;
  email: string;
  password?: string;
  rol: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserData {
  nombre?: string;
  email: string;
  password?: string;
  currentPassword?: string;
  updatedAt?: string;
}

// Función para obtener un usuario por ID
export async function getUser(id: number): Promise<User> {
  try {
    const token = getAuthToken();
    const response = await fetch(`/api/users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al obtener usuario' }));
      throw new Error(errorData.message || 'Error al obtener usuario');
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de red al obtener usuario');
  }
}

// Función para actualizar un usuario
export async function updateUser(id: number, userData: UpdateUserData): Promise<User> {
  try {
    const token = getAuthToken();
    // Mapear 'nombre' del frontend a 'name' para el backend
    const backendData = {
      ...userData,
      name: userData.nombre
    };
    // Eliminar 'nombre' ya que el backend espera 'name'
    delete backendData.nombre;
    
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(backendData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al actualizar usuario' }));
      throw new Error(errorData.message || 'Error al actualizar usuario');
    }

    const updatedUser = await response.json();
    // Mapear 'name' del backend a 'nombre' para el frontend
    return {
      ...updatedUser,
      nombre: updatedUser.name || updatedUser.nombre
    };
  } catch (error) {
    console.error('Error updating user:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de red al actualizar usuario');
  }
}

// Función para obtener el perfil del usuario logueado
export async function getCurrentUser(): Promise<User> {
  try {
    const token = getAuthToken();
    const response = await fetch('/api/users/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al obtener perfil' }));
      throw new Error(errorData.message || 'Error al obtener perfil');
    }

    const data = await response.json();
    // Mapear 'name' del backend a 'nombre' para el frontend
    return {
      ...data.user,
      nombre: data.user.name
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de red al obtener perfil');
  }
}

// Función para obtener todos los usuarios
export async function getUsers(): Promise<User[]> {
  try {
    const token = getAuthToken();
    const response = await fetch('/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al obtener usuarios' }));
      throw new Error(errorData.message || 'Error al obtener usuarios');
    }

    const users = await response.json();
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de red al obtener usuarios');
  }
}

// Función para crear un nuevo usuario
export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  try {
    const token = getAuthToken();
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al crear usuario' }));
      throw new Error(errorData.message || 'Error al crear usuario');
    }

    const newUser = await response.json();
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de red al crear usuario');
  }
}

// Función para eliminar un usuario
export async function deleteUser(id: number): Promise<void> {
  try {
    const token = getAuthToken();
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al eliminar usuario' }));
      throw new Error(errorData.message || 'Error al eliminar usuario');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de red al eliminar usuario');
  }
}
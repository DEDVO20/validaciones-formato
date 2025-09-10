export interface LoginData {
  email: string;
  password: string;
}

export async function login(data: LoginData) {
  try {
    const response = await fetch("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Login failed" }));
      throw new Error(errorData.message || "Login failed");
    }

    const result = await response.json();
    console.log('Login result:', result); // Debug log
    
    // Guardar token en localStorage si existe
    if (result.token) {
      localStorage.setItem("authToken", result.token);
      console.log('Token saved to localStorage:', result.token); // Debug log
    }
    
    return result;
  } catch (error) {
    console.error('Login error:', error); // Debug log
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error occurred");
  }
}
export async function logout() {
  try {
    const response = await fetch("/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAuthToken()}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Logout failed" }));
      throw new Error(errorData.message || "Logout failed");
    }

    // Limpiar token del localStorage
    localStorage.removeItem("authToken");
    
    const result = await response.json();
    return result;
  } catch (error) {
    // Limpiar token incluso si hay error
    localStorage.removeItem("authToken");
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error occurred");
  }
}

// Función para obtener el token de autenticación
export function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

// Función para verificar si el usuario está autenticado
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return token !== null && token !== "";
}

// Función para limpiar la sesión
export function clearSession(): void {
  localStorage.removeItem("authToken");
}
import React, { createContext, useState, useContext, useCallback, useEffect} from "react";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    logout: () => void;
    fetchUser: (authToken: string) => Promise<void>;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    hasRole: (roles: string[]) => boolean;
}
const AuthContext = createContext<AuthContextType >(
    {
        token: null,
        user: null,
        logout: () => {},
        fetchUser: async () => {},
        setUser: () => {},
        setToken: () => {},
        hasRole: () => false,
    }
);

export const useAuth = () => useContext(AuthContext);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const fetchUser = useCallback(async (authToken?: string) => {
        
        if (!authToken) return;

        try {
            const res = await fetch (`${import.meta.env.VITE_API_URL}/users/me`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if(!res.ok) {
                throw new Error("Failed to fetch user");
            }
            const userData = await res.json();

            setUser(userData.user);
        } catch (error) {
            console.error(error);
            logout();
        }
    }, []);

    // Inicializar token desde localStorage al cargar
    useEffect(() => {
        const savedToken = localStorage.getItem("authToken");
        if (savedToken) {
            setToken(savedToken);
            fetchUser(savedToken);
        }
    }, [fetchUser]);

    function logout() {
        setToken(null);
        setUser(null);
        localStorage.removeItem("authToken");
    }

    const handleSetToken = useCallback((newToken: string | null) => {
        console.log('Setting new token:', newToken); // Debug log
        setToken(newToken);
        if (newToken) {
            localStorage.setItem("authToken", newToken);
            console.log('Token saved to localStorage via handleSetToken:', newToken); // Debug log
        } else {
            localStorage.removeItem("authToken");
            console.log('Token removed from localStorage'); // Debug log
        }
    }, []);

    const hasRole = useCallback((roles: string[]) => {
        return user ? roles.includes(user.role) : false;
    }, [user]);

    const value = React.useMemo(() => ({
        token,
        user,
        logout,
        fetchUser,
        setUser,
        setToken: handleSetToken,
        hasRole
    }), [token, user, logout, fetchUser, handleSetToken, hasRole]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

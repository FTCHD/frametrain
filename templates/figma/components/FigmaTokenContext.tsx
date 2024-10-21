import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Define the shape of the context
interface FigmaTokenContextType {
    figmaAccessToken: string | null;
    loading: boolean;
}

// Create the context with default values
const FigmaTokenContext = createContext<FigmaTokenContextType | undefined>(undefined);

// Context provider component
export const FigmaTokenProvider = ({ children }: { children: ReactNode }) => {
    const [figmaAccessToken, setFigmaAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await fetch('/api/auth/figma/status');
                const data = await response.json();

                if (data.accessToken) {
                    setFigmaAccessToken(data.accessToken);
                } else {
                    setFigmaAccessToken(null);
                }
            } catch (error) {
                console.error('Error checking Figma connection status:', error);
                setFigmaAccessToken(null);
            } finally {
                setLoading(false);
            }
        };

        fetchToken();
    }, []); // Run once on mount

    return (
        <FigmaTokenContext.Provider value={{ figmaAccessToken, loading }}>
            {children}
        </FigmaTokenContext.Provider>
    );
};


// Hook to use the FigmaTokenContext
export const useFigmaToken = () => {
    const context = useContext(FigmaTokenContext);
    if (context === undefined) {
        throw new Error('useFigmaToken must be used within a FigmaTokenProvider');
    }
    return context;
};

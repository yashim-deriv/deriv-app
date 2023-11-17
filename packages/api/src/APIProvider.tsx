import React, { PropsWithChildren, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
// @ts-expect-error `@deriv/deriv-api` is not in TypeScript, Hence we ignore the TS error.
import DerivAPIBasic from '@deriv/deriv-api/dist/DerivAPIBasic';
import { getAppId, useWS } from '@deriv/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import APIContext from './APIContext';
import { Environment, getAppLanguage, getWebsocketEndpointURL } from './utils/websocket-utils';
import { getActiveLoginIDFromLocalStorage } from '@deriv/utils';

declare global {
    interface Window {
        ReactQueryClient?: QueryClient;
        DerivAPI?: Record<string, DerivAPIBasic>;
        WSConnections?: Record<string, WebSocket>;
    }
}

type TStandaloneContext = {
    environment: Environment;
    handleSwitchAccount: (loginid: string, invalidate: () => Promise<void>) => void;
};

const StandaloneAPIContext = createContext<TStandaloneContext | null>(null);

export const useStandaloneContext = () => {
    const context = useContext(StandaloneAPIContext);
    if (!context) {
        throw new Error('useStandaloneAPIContext() must be used within StandaloneAPIProvider');
    }
    return context;
};

// This is a temporary workaround to share a single `QueryClient` instance between all the packages.
// Later once we have each package separated we won't need this anymore and can remove this.
export const getSharedQueryClientContext = (): QueryClient => {
    if (!window.ReactQueryClient) {
        window.ReactQueryClient = new QueryClient();
    }

    return window.ReactQueryClient;
};

const getWebSocketInstance = (wss_url: string) => {
    if (!window.WSConnections) {
        window.WSConnections = {};
    }
    if (window.WSConnections[wss_url] instanceof WebSocket) {
        return window.WSConnections[wss_url];
    }

    const WebsocketInstance = new WebSocket(wss_url);
    window.WSConnections[wss_url] = WebsocketInstance;
    return WebsocketInstance;
};

const initializeDerivAPI = () => {
    const websocketEndpoint = getWebsocketEndpointURL();
    const appId = getAppId();
    const appLanguage = getAppLanguage();
    const wss_url = `wss://${websocketEndpoint}/websockets/v3?app_id=${appId}&l=${appLanguage}&brand=EN`;
    if (!window.DerivAPI) {
        window.DerivAPI = {};
    }
    const websocket = getWebSocketInstance(wss_url);
    const existingDerivAPI = window.DerivAPI[wss_url];
    if (!existingDerivAPI) {
        window.DerivAPI[wss_url] = new DerivAPIBasic({ connection: websocket });
    }
    return window.DerivAPI?.[wss_url];
};

const queryClient = getSharedQueryClientContext();

const getEnvironmentByLoginid = (loginid: string) => (loginid && /^(VR)/.test(loginid) ? 'demo' : 'real');

type TAPIProviderProps = {
    /** If set to true, the APIProvider will instantiate it's own socket connection. */
    standalone?: boolean;
};

const APIProvider = ({ children, standalone = false }: PropsWithChildren<TAPIProviderProps>) => {
    const WS = useWS();
    const derivAPIRef = useRef<DerivAPIBasic>(standalone ? initializeDerivAPI() : WS);
    // Use the new API instance if the `standalone` prop is set to true,
    // else use the legacy socket connection.
    const activeLoginid = getActiveLoginIDFromLocalStorage();
    const [environment, setEnvironment] = useState<Environment>(getEnvironmentByLoginid(activeLoginid || ''));

    const handleSwitchAccount = useCallback(
        (loginid: string, invalidate: () => Promise<void>) => {
            const currentActiveLoginid = getActiveLoginIDFromLocalStorage();
            if (loginid !== currentActiveLoginid) {
                localStorage.setItem('active_loginid', loginid);
                const currentEnvironment = getEnvironmentByLoginid(loginid);
                if (currentEnvironment !== environment) {
                    setEnvironment(environment);
                    derivAPIRef.current = initializeDerivAPI();
                }
                invalidate();
            }
        },
        [environment]
    );

    useEffect(() => {
        let interval_id: NodeJS.Timer;

        if (standalone) {
            interval_id = setInterval(() => derivAPIRef.current?.send({ ping: 1 }), 10000);
        }

        return () => clearInterval(interval_id);
    }, [derivAPIRef, standalone]);

    return (
        <APIContext.Provider value={derivAPIRef.current}>
            <StandaloneAPIContext.Provider value={{ environment, handleSwitchAccount }}>
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </StandaloneAPIContext.Provider>
        </APIContext.Provider>
    );
};

export default APIProvider;

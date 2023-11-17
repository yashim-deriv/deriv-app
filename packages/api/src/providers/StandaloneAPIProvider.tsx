import React, { PropsWithChildren, createContext, useCallback, useContext, useRef, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// @ts-expect-error Deriv API is not typed
import DerivAPIBasic from '@deriv/deriv-api/dist/DerivAPIBasic';
import { Environment, getAppId, getAppLanguage, getWebsocketEndpointURL } from '../utils/websocket-utils';
import { getSharedQueryClientContext } from '../APIProvider';

declare global {
    interface Window {
        ReactQueryClient?: QueryClient;
        DerivAPI?: Record<string, DerivAPIBasic>;
        WebsocketInstance?: Record<string, WebSocket>;
    }
}

type TStandaloneContext = {
    derivAPI: DerivAPIBasic;
    activeLoginid: string;
    switchAccount: (loginid: string) => void;
};

const StandaloneAPIContext = createContext<TStandaloneContext | null>(null);

const getWebSocketInstance = (wss_url: string) => {
    if (!window.WebsocketInstance) {
        window.WebsocketInstance = {};
    }
    if (window.WebsocketInstance[wss_url] instanceof WebSocket) {
        return window.WebsocketInstance[wss_url];
    }

    const WebsocketInstance = new WebSocket(wss_url);
    window.WebsocketInstance[wss_url] = WebsocketInstance;
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
    return window.DerivAPI[wss_url];
};

const getEnvironmentByLoginid = (loginid: string) => (loginid && /^(VR)/.test(loginid) ? 'demo' : 'real');

const StandaloneAPIProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const derivAPIRef = useRef<DerivAPIBasic>(initializeDerivAPI());
    const [activeLoginid, setActiveLoginid] = useLocalStorage('active_loginid', '');
    const [environment, setEnvironment] = useState<Environment>(getEnvironmentByLoginid(activeLoginid));

    const switchAccount = useCallback(
        (loginid: string) => {
            if (loginid !== activeLoginid) {
                setActiveLoginid(loginid);
                const currentEnvironment = getEnvironmentByLoginid(loginid);
                if (currentEnvironment !== environment) {
                    setEnvironment(environment);
                    derivAPIRef.current = initializeDerivAPI();
                }
            }
        },
        [activeLoginid, environment, setActiveLoginid]
    );

    return (
        <StandaloneAPIContext.Provider value={{ derivAPI: derivAPIRef.current, activeLoginid, switchAccount }}>
            <QueryClientProvider client={getSharedQueryClientContext()}>{children}</QueryClientProvider>
        </StandaloneAPIContext.Provider>
    );
};

export const useStandaloneContext = () => {
    const context = useContext(StandaloneAPIContext);
    if (!context) {
        throw new Error('useStandaloneAPIContext() must be used within StandaloneAPIProvider');
    }
    return context;
};

export default StandaloneAPIProvider;

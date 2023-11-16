import React, { ReactNode, createContext, useRef } from 'react';
// @ts-expect-error Deriv API is not typed
import DerivAPIBasic from '@deriv/deriv-api/dist/DerivAPIBasic';

type TStandaloneContext = {
    WS: DerivAPIBasic;
};

const StandaloneContext = createContext<TStandaloneContext | null>(null);

type TStandaloneAPIProvider = {
    children: ReactNode;
};

const StandaloneAPIProvider = ({ children }: TStandaloneAPIProvider) => {
    const wsRef = useRef<DerivAPIBasic>();

    return <StandaloneContext.Provider value={{ WS: wsRef }}>{children}</StandaloneContext.Provider>;
};

export default StandaloneAPIProvider;

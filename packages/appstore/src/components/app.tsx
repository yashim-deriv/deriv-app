import classNames from 'classnames';
import * as React from 'react';
import { setWebsocket, routes } from '@deriv/shared';
import { StoreProvider, observer } from '@deriv/stores';
import CashierStoreProvider from '@deriv/cashier/src/cashier-providers';
import CFDStoreProvider from '@deriv/cfd/src/cfd-providers';
import Routes from 'Components/routes/routes';
import { useStores, initContext } from 'Stores';
import { TRootStore } from 'Types';
import './app.scss';

type TAppProps = {
    passthrough: {
        root_store: TRootStore;
        WS: Record<string, any>;
    };
};

const App = ({ passthrough: { WS, root_store } }: TAppProps) => {
    initContext(root_store, WS);
    setWebsocket(WS);
    const { ui }: TRootStore = useStores();

    return (
        <CashierStoreProvider store={root_store as any}>
            <CFDStoreProvider store={root_store as any}>
                <StoreProvider store={root_store as any}>
                    <main
                        className={classNames('dashboard', {
                            'theme--light': !ui.is_dark_mode_on,
                            'theme--dark': ui.is_dark_mode_on,
                            'dashboard-onboarding': window.location.pathname === routes.onboarding,
                        })}
                    >
                        <div className='dw-dashboard'>
                            <Routes />
                        </div>
                    </main>
                </StoreProvider>
            </CFDStoreProvider>
        </CashierStoreProvider>
    );
};

export default observer(App);

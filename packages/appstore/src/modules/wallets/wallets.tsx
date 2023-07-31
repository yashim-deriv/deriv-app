import React, { useEffect } from 'react';
import { Loading, ThemedScrollbars } from '@deriv/components';
import { useActiveWallet, useWalletsList } from '@deriv/hooks';
import { observer, useStore } from '@deriv/stores';
import AddMoreWallets from 'Components/add-more-wallets';
import ModalManager from 'Components/modals/modal-manager';
import DesktopWalletsList from './desktop-wallets-list';
import MobileWalletsCarousel from './mobile-wallets-carousel';
import './wallets.scss';

const Wallets = observer(() => {
    const { client, ui } = useStore();
    const { switchAccount, is_authorize } = client;
    const { is_mobile } = ui;
    const { data } = useWalletsList();
    const active_wallet = useActiveWallet();

    useEffect(() => {
        if (!active_wallet && data && data?.length) {
            switchAccount(data[0].loginid);
        }
    }, [active_wallet, data, switchAccount]);

    return (
        <ThemedScrollbars className={'wallets-module'}>
            {!is_authorize && <Loading />}
            {is_authorize && (
                <div className={'wallets-module__content'}>
                    {is_mobile ? <MobileWalletsCarousel /> : <DesktopWalletsList />}
                    <AddMoreWallets />
                </div>
            )}
            <ModalManager />
        </ThemedScrollbars>
    );
});

export default Wallets;

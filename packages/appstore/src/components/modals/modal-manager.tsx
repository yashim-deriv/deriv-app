import React from 'react';
import { observer } from 'mobx-react-lite';
import { ResetTradingPasswordModal } from '@deriv/account';
import { TTradingPlatformAvailableAccount } from './account-type-modal/types';
import MT5AccountTypeModal from './account-type-modal';
import RegulatorsCompareModal from './regulators-compare-modal';
import { useStores } from 'Stores';
import CFDServerErrorDialog from '@deriv/cfd/src/Containers/cfd-server-error-dialog';
import JurisdictionModal from '@deriv/cfd/src/Containers/jurisdiction-modal/jurisdiction-modal';
import CFDPasswordModal from '@deriv/cfd/src/Containers/cfd-password-modal';
import CFDDbviOnBoarding from '@deriv/cfd/src/Containers/cfd-dbvi-onboarding';
import CFDResetPasswordModal from '@deriv/cfd/src/Containers/cfd-reset-password-modal';
import CFDTopUpDemoModal from '@deriv/cfd/src/Containers/cfd-top-up-demo-modal';
import MT5TradeModal from '@deriv/cfd/src/Containers/mt5-trade-modal';
import CFDPasswordManagerModal from '@deriv/cfd/src/Containers/cfd-password-manager-modal';
import CompareAccountsModal from '@deriv/cfd/src/Containers/compare-accounts-modal';
import { TOpenAccountTransferMeta } from 'Types';
import { DetailsOfEachMT5Loginid } from '@deriv/api-types';
import FailedVerificationModal from './failed-veriification-modal';
import AccountTransferModal from 'Components/account-transfer-modal';
import RealWalletsUpgrade from './real-wallets-upgrade/real-wallets-upgrade';
import WalletsMigrationFailed from './wallets-migration-failed';
import WalletModal from './wallet-modal';

type TCurrentList = DetailsOfEachMT5Loginid & {
    enabled: number;
};

const ModalManager = () => {
    const store = useStores();
    const { common, client, modules, traders_hub, ui } = store;
    const {
        is_logged_in,
        is_eu,
        is_eu_country,
        is_populating_mt5_account_list,
        has_active_real_account,
        real_account_creation_unlock_date,
        verification_code,
    } = client;
    const { platform } = common;
    const {
        current_list,
        enableCFDPasswordModal,
        is_mt5_trade_modal_visible,
        setAccountType,
        toggleMT5TradeModal,
        getRealSyntheticAccountsExistingData,
        getRealFinancialAccountsExistingData,
        getRealSwapfreeAccountsExistingData,
    } = modules.cfd;
    const {
        enableApp,
        disableApp,
        setShouldShowCooldownModal,
        is_reset_trading_password_modal_visible,
        setResetTradingPasswordModalOpen,
    } = ui;
    const { is_demo, is_account_transfer_modal_open, toggleAccountTransferModal } = traders_hub;

    const [password_manager, setPasswordManager] = React.useState<{
        is_visible: boolean;
        selected_login: string;
        selected_account: string;
        selected_account_type: string;
        selected_account_group: '' | 'demo' | 'real';
        selected_server: string;
    }>({
        is_visible: false,
        selected_login: '',
        selected_account: '',
        selected_account_type: '',
        selected_account_group: '',
        selected_server: '',
    });

    const togglePasswordManagerModal = (
        login?: string,
        title?: string,
        group?: 'demo' | 'real' | '',
        type?: string,
        server?: string
    ) => {
        setPasswordManager(prev_state => ({
            is_visible: !prev_state.is_visible,
            selected_login: typeof login === 'string' ? login : '',
            selected_account: typeof title === 'string' ? title : '',
            selected_account_group: group || '',
            selected_account_type: type || '',
            selected_server: server || '',
        }));
    };

    const openRealPasswordModal = (account_type: TOpenAccountTransferMeta) => {
        setAccountType(account_type);
        enableCFDPasswordModal();
    };

    const existing_accounts_data = (acc_type: TTradingPlatformAvailableAccount['market_type'] | 'synthetic') => {
        const current_list_keys = Object.keys(current_list);
        const should_be_enabled = (list_item: TCurrentList) =>
            platform === 'dxtrade' ? list_item.enabled === 1 : true;
        const acc = current_list_keys.some(
            key => key.startsWith(`${platform}.real.${acc_type}`) && should_be_enabled(current_list[key])
        )
            ? Object.keys(current_list)
                  .filter(key => key.startsWith(`${platform}.real.${acc_type}`))
                  .reduce((_acc, cur) => {
                      _acc.push(current_list[cur]);
                      return _acc;
                  }, [] as DetailsOfEachMT5Loginid[])
            : undefined;
        return acc;
    };
    const trading_platform_dxtrade_password_reset = verification_code?.trading_platform_dxtrade_password_reset;
    const trading_platform_mt5_password_reset = verification_code?.trading_platform_mt5_password_reset;

    getRealSyntheticAccountsExistingData(existing_accounts_data('synthetic'));
    getRealFinancialAccountsExistingData(existing_accounts_data('financial'));
    getRealSwapfreeAccountsExistingData(existing_accounts_data('all'));

    return (
        <React.Fragment>
            <JurisdictionModal openPasswordModal={openRealPasswordModal} />
            <CFDPasswordModal platform={platform} />
            <CFDDbviOnBoarding />
            <CFDResetPasswordModal platform={platform} />
            <CFDServerErrorDialog />
            <CFDTopUpDemoModal platform={platform} />
            <MT5TradeModal
                is_open={is_mt5_trade_modal_visible}
                onPasswordManager={togglePasswordManagerModal}
                toggleModal={toggleMT5TradeModal}
                is_eu_user={(is_logged_in && is_eu) || (!is_logged_in && is_eu_country)}
                is_demo={is_demo}
            />
            <CFDPasswordManagerModal
                is_visible={password_manager.is_visible}
                selected_login={password_manager.selected_login}
                selected_account_group={password_manager.selected_account_group}
                selected_account_type={password_manager.selected_account_type}
                selected_server={password_manager.selected_server}
                platform={platform}
                toggleModal={togglePasswordManagerModal}
            />
            <ResetTradingPasswordModal
                context={store}
                platform={trading_platform_dxtrade_password_reset ? 'dxtrade' : 'mt5'}
                enableApp={enableApp}
                disableApp={disableApp}
                toggleResetTradingPasswordModal={setResetTradingPasswordModalOpen}
                is_visible={is_reset_trading_password_modal_visible}
                is_loading={is_populating_mt5_account_list}
                verification_code={trading_platform_dxtrade_password_reset || trading_platform_mt5_password_reset}
            />
            <MT5AccountTypeModal />
            <RegulatorsCompareModal />
            <CompareAccountsModal
                platform={platform}
                is_demo_tab={is_demo}
                openPasswordModal={openRealPasswordModal}
                is_real_enabled={has_active_real_account || !is_demo}
                real_account_creation_unlock_date={real_account_creation_unlock_date}
                setShouldShowCooldownModal={setShouldShowCooldownModal}
                has_unmerged_account={false}
            />
            <AccountTransferModal
                is_modal_open={is_account_transfer_modal_open}
                toggleModal={toggleAccountTransferModal}
            />
            <FailedVerificationModal />
            <RealWalletsUpgrade />
            <WalletsMigrationFailed />
            <WalletModal />
        </React.Fragment>
    );
};

export default observer(ModalManager);

import React from 'react';
import { Loading } from '@deriv/components';
import { useCashierLocked, useDepositLocked, useIsSystemMaintenance } from '@deriv/hooks';
import { useStore, observer } from '@deriv/stores';
import { Virtual } from '../../components/cashier-container';
import CashierLocked from '../../components/cashier-locked';
import CryptoTransactionsHistory from '../../components/crypto-transactions-history';
import Error from '../../components/error';
import FundsProtection from '../../components/funds-protection';
import USDTSideNote from '../../components/usdt-side-note';
import RecentTransaction from '../../components/recent-transaction';
import CryptoDeposit from './crypto-deposit';
import DepositLocked from './deposit-locked';
import SideNote from '../../components/side-note';
import { useCashierStore } from '../../stores/useCashierStores';
import { CashierOnboardingModule } from '../../modules';
import { CashierOnboardingSideNotes } from '../../modules/cashier-onboarding/components';
import { DepositFiatModule } from '../../modules/deposit-fiat';

type TDeposit = {
    setSideNotes: (notes: object | null) => void;
};

const Deposit = observer(({ setSideNotes }: TDeposit) => {
    const { client, traders_hub } = useStore();
    const {
        can_change_fiat_currency,
        currency,
        current_currency_type,
        is_switching,
        is_virtual,
        landing_company_shortcode,
    } = client;
    const { iframe, deposit, transaction_history, general_store } = useCashierStore();
    const { iframe_height, iframe_url } = iframe;
    const { container, error, onMountDeposit: onMount } = deposit;
    const { is_low_risk_cr_eu_real } = traders_hub;
    const {
        crypto_transactions,
        is_crypto_transactions_visible,
        onMount: recentTransactionOnMount,
    } = transaction_history;
    const {
        cashier_route_tab_index: tab_index,
        is_cashier_onboarding,
        is_crypto,
        is_deposit,
        is_loading,
        setActiveTab,
        setIsDeposit,
    } = general_store;
    const is_cashier_locked = useCashierLocked();
    const is_system_maintenance = useIsSystemMaintenance();
    const is_deposit_locked = useDepositLocked();

    const is_fiat_currency_banner_visible_for_MF_clients =
        landing_company_shortcode === 'maltainvest' && !is_crypto && !can_change_fiat_currency && !!iframe_height;

    React.useEffect(() => {
        if (!is_crypto_transactions_visible) {
            recentTransactionOnMount();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [is_switching]);

    React.useEffect(() => {
        setActiveTab(container);
        onMount();
        return () => {
            setIsDeposit(false);
            error.setErrorMessage({ code: '', message: '' });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setActiveTab, onMount, container, error.setErrorMessage]);

    React.useEffect(() => {
        if (typeof setSideNotes === 'function') {
            if (is_switching || is_deposit) setSideNotes(null);
            if (is_crypto && is_deposit && !is_switching) {
                const side_notes = [
                    <RecentTransaction key={2} />,
                    ...(/^(UST)$/i.test(currency) ? [<USDTSideNote type='usdt' key={1} />] : []),
                    ...(/^(eUSDT)$/i.test(currency) ? [<USDTSideNote type='eusdt' key={1} />] : []),
                ];

                setSideNotes([
                    ...side_notes.map((side_note, index) => (
                        <SideNote has_title={false} key={index}>
                            {side_note}
                        </SideNote>
                    )),
                ]);
            }
        }

        return () => {
            setSideNotes?.([]);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currency, tab_index, crypto_transactions, crypto_transactions?.length, is_cashier_onboarding, iframe_height]);

    if (!is_cashier_onboarding && (is_switching || (is_loading && !iframe_url)) && !is_crypto_transactions_visible) {
        return <Loading is_fullscreen />;
    }
    if (is_virtual) {
        return <Virtual />;
    }
    if (is_system_maintenance) {
        if (is_cashier_locked || (is_deposit_locked && current_currency_type === 'crypto')) {
            return <CashierLocked />;
        }
    }
    if (error.is_ask_uk_funds_protection) {
        return <FundsProtection />;
    }
    if (is_cashier_locked) {
        return <CashierLocked />;
    }
    if (is_deposit_locked) {
        return <DepositLocked />;
    }
    if (is_crypto_transactions_visible) {
        return <CryptoTransactionsHistory />;
    }

    if (is_deposit || is_low_risk_cr_eu_real) {
        if (error.message) {
            return <Error error={error} />;
        }
        if (is_crypto) {
            return <CryptoDeposit />;
        }

        return (
            <>
                {is_fiat_currency_banner_visible_for_MF_clients && (
                    <CashierOnboardingSideNotes setSideNotes={setSideNotes} />
                )}
                <DepositFiatModule />
            </>
        );
    }
    return <CashierOnboardingModule setSideNotes={setSideNotes} />;
});

export default Deposit;

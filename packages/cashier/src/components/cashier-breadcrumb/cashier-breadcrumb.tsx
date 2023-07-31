import React from 'react';
import { localize } from '@deriv/translations';
import { Breadcrumb } from '@deriv/ui';
import { useCashierStore } from '../../stores/useCashierStores';
import './cashier-breadcrumb.scss';

const CashierBreadcrumb = () => {
    const { general_store } = useCashierStore();
    const { is_crypto, is_deposit, setIsDeposit } = general_store;
    const is_crypto_deposit = is_deposit && is_crypto;

    const crypto_deposit_crumbs: React.ComponentProps<typeof Breadcrumb>['items'] = [
        { value: 0, text: localize('Cashier') },
        { value: 1, text: localize('Deposit cryptocurrencies') },
    ];

    const fiat_deposit_crumbs: React.ComponentProps<typeof Breadcrumb>['items'] = [
        { value: 0, text: localize('Cashier') },
        { value: 1, text: localize('Deposit via bank wire, credit card, and e-wallet') },
    ];

    const onBreadcrumbHandler: React.ComponentProps<typeof Breadcrumb>['handleOnClick'] = item => {
        switch (item.value) {
            case 0:
                setIsDeposit(false);
                break;
            default:
        }
    };

    // TODO: improve Breadcrumb component in deriv-ui project that it can accept custom classnames
    return (
        <div className='cashier-breadcrumb'>
            <Breadcrumb
                items={is_crypto_deposit ? crypto_deposit_crumbs : fiat_deposit_crumbs}
                handleOnClick={onBreadcrumbHandler}
            />
        </div>
    );
};

export default CashierBreadcrumb;

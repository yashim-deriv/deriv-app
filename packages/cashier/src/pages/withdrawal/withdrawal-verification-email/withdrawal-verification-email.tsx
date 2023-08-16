import React from 'react';
import { MobileWrapper } from '@deriv/components';
import { useVerifyEmail } from '@deriv/hooks';
import { localize, Localize } from '@deriv/translations';
import { isCryptocurrency } from '@deriv/shared';
import { useStore, observer } from '@deriv/stores';
import RecentTransaction from '../../../components/recent-transaction';
import EmailVerificationEmptyState from '../../../components/email-verification-empty-state';
import EmptyState from '../../../components/empty-state';
import Error from '../../../components/error';
import { useCashierStore } from '../../../stores/useCashierStores';
import ErrorStore from '../../../stores/error-store';

const WithdrawalVerificationEmail = observer(() => {
    const verify = useVerifyEmail('payment_withdraw');
    const { client } = useStore();
    const { transaction_history } = useCashierStore();

    React.useEffect(() => {
        transaction_history.onMount();
    }, [transaction_history]);

    if (verify.error) return <Error error={verify.error as ErrorStore} />;

    if (verify.has_been_sent) return <EmailVerificationEmptyState type={'payment_withdraw'} />;

    return (
        <>
            <EmptyState
                icon='IcWithdrawRequestVerification'
                title={localize('Please help us verify your withdrawal request.')}
                description={
                    <>
                        <Localize i18n_default_text="Click the button below and we'll send you an email with a link. Click that link to verify your withdrawal request." />
                        <br />
                        <br />
                        <Localize i18n_default_text='This is to protect your account from unauthorised withdrawals.' />
                    </>
                }
                action={{
                    label: localize('Send email'),
                    onClick: () => verify.send(),
                }}
            />
            <MobileWrapper>{isCryptocurrency(client.currency) && <RecentTransaction />}</MobileWrapper>
        </>
    );
});

export default WithdrawalVerificationEmail;

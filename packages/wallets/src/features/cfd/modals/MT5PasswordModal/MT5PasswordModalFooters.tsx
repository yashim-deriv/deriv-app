import React, { ComponentProps } from 'react';
import { useHistory } from 'react-router-dom';
import { Localize } from '@deriv-com/translations';
import { WalletButton, WalletButtonGroup } from '../../../../components';
import { useModal } from '../../../../components/ModalProvider';
import useDevice from '../../../../hooks/useDevice';

type TProps = {
    disabled: ComponentProps<typeof WalletButton>['disabled'];
    isDemo?: boolean;
    isLoading: ComponentProps<typeof WalletButton>['isLoading'];
    onPrimaryClick: ComponentProps<typeof WalletButton>['onClick'];
    onSecondaryClick: ComponentProps<typeof WalletButton>['onClick'];
};

export const SuccessModalFooter = ({ isDemo }: Pick<TProps, 'isDemo'>) => {
    const history = useHistory();
    const { hide } = useModal();
    const { isMobile } = useDevice();

    const handleOnClickReal = () => {
        hide();
        history.push('/wallet/account-transfer');
    };

    if (isDemo) {
        return (
            <div className='wallets-success-btn'>
                <WalletButton isFullWidth onClick={hide} size={isMobile ? 'lg' : 'md'}>
                    <Localize i18n_default_text='OK' />
                </WalletButton>
            </div>
        );
    }

    return (
        <WalletButtonGroup isFlex isFullWidth>
            <WalletButton onClick={hide} size={isMobile ? 'lg' : 'md'} variant='outlined'>
                <Localize i18n_default_text='Maybe later' />
            </WalletButton>
            <WalletButton onClick={() => handleOnClickReal()} size={isMobile ? 'lg' : 'md'}>
                <Localize i18n_default_text='Transfer funds' />
            </WalletButton>
        </WalletButtonGroup>
    );
};

export const MT5PasswordModalFooter = ({
    disabled,
    isLoading,
    onPrimaryClick,
    onSecondaryClick,
}: Exclude<TProps, 'isDemo'>) => {
    const { isMobile } = useDevice();

    return (
        <WalletButtonGroup isFullWidth>
            <WalletButton isFullWidth onClick={onSecondaryClick} size={isMobile ? 'lg' : 'md'} variant='outlined'>
                <Localize i18n_default_text='Forgot password?' />
            </WalletButton>
            <WalletButton
                disabled={disabled}
                isFullWidth
                isLoading={isLoading}
                onClick={onPrimaryClick}
                size={isMobile ? 'lg' : 'md'}
            >
                <Localize i18n_default_text='Add account' />
            </WalletButton>
        </WalletButtonGroup>
    );
};

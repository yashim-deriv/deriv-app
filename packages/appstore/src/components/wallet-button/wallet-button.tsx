import React from 'react';
import { Icon, Text } from '@deriv/components';
import { getWalletHeaderButtons } from 'Constants/utils';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';
import './wallet-button.scss';

type TProps = {
    readonly button: ReturnType<typeof getWalletHeaderButtons>[number];
    is_desktop_wallet?: boolean;
    is_disabled?: boolean;
    is_open?: boolean;
};

const WalletButton = ({ button, is_desktop_wallet, is_disabled, is_open }: TProps) => {
    return is_desktop_wallet ? (
        <div
            key={button.name}
            className={classNames('wallet-button__desktop-item', {
                'wallet-button__desktop-item-disabled': is_disabled,
            })}
            onClick={button.action}
        >
            <Icon icon={button.icon} custom_color={is_disabled ? 'var(--general-disabled)' : 'var(--text-prominent)'} />
            <CSSTransition
                appear
                in={is_open}
                timeout={240}
                classNames='wallet-button__desktop-item-transition'
                unmountOnExit
            >
                <Text
                    weight='bold'
                    color={is_disabled ? 'disabled' : 'prominent'}
                    size='xs'
                    className='wallet-button__desktop-item-text'
                >
                    {button.text}
                </Text>
            </CSSTransition>
        </div>
    ) : (
        <div className='wallet-button__mobile-item' onClick={button.action}>
            <div className='wallet-button__mobile-item-icon'>
                <Icon icon={button.icon} />
            </div>
            <Text size='xxxxs' className='wallet-button__mobile-item-text'>
                {button.text}
            </Text>
        </div>
    );
};

export default WalletButton;

import React from 'react';
import classNames from 'classnames';
import { localize } from '@deriv/translations';
import Badge from '../badge';
import Button from '../button';
import Icon from '../icon';
import Text from '../text';
import { isMobile } from '@deriv/shared';
import { WalletIcon } from '../wallet-icon';
import './wallet-card.scss';

type TWalletCardProps = {
    // TODO: This type should be updated when the response is ready
    wallet: {
        balance: string;
        currency: string;
        icon: string;
        icon_type: 'fiat' | 'crypto' | 'app' | 'demo';
        jurisdiction_title: string;
        name: string;
        gradient_class: string;
    };
    size?: 'small' | 'medium' | 'large';
    state?: 'active' | 'add' | 'added' | 'default' | 'disabled' | 'faded';
};

const WalletCard: React.FC<React.PropsWithChildren<TWalletCardProps>> = ({
    wallet,
    size = 'medium',
    state = 'default',
}) => {
    const IconComponent = () => {
        let icon_size: React.ComponentProps<typeof WalletIcon>['size'] = 'large';
        if (size === 'small') icon_size = 'medium';
        if (size === 'medium') icon_size = isMobile() && wallet.icon_type === 'crypto' ? 'medium' : 'large';
        return <WalletIcon type={wallet.icon_type} icon={wallet.icon} size={icon_size} />;
    };

    return (
        <div className={`wallet-card wallet-card--${size} wallet-card--${state}`}>
            <div
                className={`wallet-card__container wallet-card__container--${state} wallet-card__container--${size} ${wallet.gradient_class}`}
            >
                {size !== 'small' && <div className='wallet-card__shine' />}
                <div
                    className={classNames('wallet-card__container-fade', {
                        [`wallet-card__container-fade--${state}`]: state,
                    })}
                />
                {size === 'small' && <IconComponent />}
                {size !== 'small' && (
                    <div className={`wallet-card__content wallet-card__content--${size}`}>
                        <div className='wallet-card__top-wrapper'>
                            <IconComponent />
                            {wallet.jurisdiction_title === 'virtual' ? (
                                <Badge label={localize('Demo')} type='contained' background_color='blue' />
                            ) : (
                                <Badge
                                    custom_color='var(--text-prominent)'
                                    label={wallet.jurisdiction_title.toUpperCase()}
                                    type='bordered'
                                />
                            )}
                        </div>

                        <div className='wallet-card__bottom-wrapper'>
                            {state !== 'add' && state !== 'added' ? (
                                <React.Fragment>
                                    <Text color='prominent' size={isMobile() ? 'xxxxs' : 'xxxs'}>
                                        {wallet.name}
                                    </Text>
                                    <Text color='prominent' weight='bold' size={isMobile() ? 'xxs' : 'xs'}>
                                        {wallet.balance} {wallet.currency}
                                    </Text>
                                </React.Fragment>
                            ) : (
                                <Button
                                    className={`wallet-card__wallet-button wallet-card__wallet-button--${state}`}
                                    classNameSpan='wallet-card__wallet-button-text'
                                    icon={
                                        <Icon
                                            className='wallet-card__wallet-button-icon'
                                            custom_color='$color-black-1'
                                            icon={state === 'added' ? 'IcCheckmarkBold' : 'IcAddBold'}
                                            size={12}
                                        />
                                    }
                                    text={state === 'added' ? localize('Added') : localize('Add')}
                                    is_disabled={state === 'added'}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
            {state === 'active' && (
                <div className={`wallet-card__active-icon wallet-card__active-icon--${size}`}>
                    <Icon
                        color='brand'
                        data_testid='ic-checkmark-circle'
                        icon='IcCheckmarkCircle'
                        size={size === 'small' ? 16 : 32}
                    />
                </div>
            )}
        </div>
    );
};
export default WalletCard;

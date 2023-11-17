import React, { useState } from 'react';
import { SentEmailContent, WalletButton, WalletsActionScreen, WalletText } from '../../../../components';
import { useModal } from '../../../../components/ModalProvider';
import MT5PasswordIcon from '../../../../public/images/ic-mt5-password.svg';

const MT5ChangePasswordScreens = () => {
    type TChangePasswordScreenIndex = 'confirmationScreen' | 'emailVerification' | 'introScreen';

    const [activeScreen, setActiveScreen] = useState<TChangePasswordScreenIndex>('introScreen');
    const handleClick = (nextScreen: TChangePasswordScreenIndex) => setActiveScreen(nextScreen);

    const { hide } = useModal();

    const ChangePasswordScreens = {
        confirmationScreen: {
            bodyText: (
                <WalletText align='center' color='error' size='sm'>
                    This will change the password to all of your Deriv MT5 accounts.
                </WalletText>
            ),
            button: (
                <div className='wallets-change-password__btn'>
                    <WalletButton onClick={() => hide()} size='lg' text='Cancel' variant='outlined' />
                    <WalletButton onClick={() => handleClick('emailVerification')} size='lg' text='Confirm' />
                </div>
            ),
            headingText: 'Confirm to change your Deriv MT5 password',
            icon: <MT5PasswordIcon />,
        },
        introScreen: {
            bodyText: 'Use this password to log in to your Deriv MT5 accounts on the desktop, web, and mobile apps.',
            button: <WalletButton onClick={() => handleClick('confirmationScreen')} size='lg' text='Change password' />,
            headingText: 'Deriv MT5 password',
            icon: <MT5PasswordIcon />,
        },
    };

    if (activeScreen === 'emailVerification')
        return (
            <div className='wallets-change-password__sent-email-wrapper'>
                <SentEmailContent />
            </div>
        );

    return (
        <WalletsActionScreen
            description={ChangePasswordScreens[activeScreen].bodyText}
            descriptionSize='sm'
            icon={ChangePasswordScreens[activeScreen].icon}
            renderButtons={() => ChangePasswordScreens[activeScreen].button}
            title={ChangePasswordScreens[activeScreen].headingText}
        />
    );
};

export default MT5ChangePasswordScreens;

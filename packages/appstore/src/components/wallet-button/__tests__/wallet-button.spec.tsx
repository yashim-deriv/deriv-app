import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mockStore, StoreProvider } from '@deriv/stores';
import WalletButton from '..';
import { TWalletAccount } from 'Types';

const mockedRootStore = mockStore({});

describe('<WalletButton />', () => {
    const button = {
        name: 'Transfer',
        text: 'Transfer',
        icon: 'IcAccountTransfer',
        action: () => {
            return true;
        },
    };

    it('Should render right text', () => {
        render(
            <StoreProvider store={mockedRootStore}>
                <WalletButton button={button} />
            </StoreProvider>
        );
        const button_text = screen.queryByText('Transfer');

        expect(button_text).toBeInTheDocument();
    });

    it('Should render desktop class', () => {
        const { container } = render(
            <StoreProvider store={mockedRootStore}>
                <WalletButton button={button} is_desktop_wallet={true} />
            </StoreProvider>
        );

        expect(container.childNodes[0]).toHaveClass('wallet-button__desktop-item');
        expect(container.childNodes[0]).not.toHaveClass('wallet-button__mobile-item');
    });

    it('Should render mobile class', () => {
        const { container } = render(
            <StoreProvider store={mockedRootStore}>
                <WalletButton button={button} />
            </StoreProvider>
        );

        expect(container.childNodes[0]).not.toHaveClass('wallet-button__desktop-item');
        expect(container.childNodes[0]).toHaveClass('wallet-button__mobile-item');
    });

    it('Should add disabled class', () => {
        const { container } = render(
            <StoreProvider store={mockedRootStore}>
                <WalletButton button={button} is_desktop_wallet={true} is_disabled={true} />
            </StoreProvider>
        );

        expect(container.childNodes[0]).not.toHaveClass('wallet-button__mobile-item');
        expect(container.childNodes[0]).toHaveClass('wallet-button__desktop-item');
        expect(container.childNodes[0]).toHaveClass('wallet-button__desktop-item-disabled');
    });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mockStore, StoreProvider } from '@deriv/stores';
import WalletCardsCarousel from '..';
import { APIProvider } from '@deriv/api';

jest.mock('@deriv/api', () => ({
    ...jest.requireActual('@deriv/api'),
    useFetch: jest.fn((name: string) => {
        if (name === 'authorize') {
            return {
                data: {
                    authorize: {
                        account_list: [
                            {
                                account_category: 'wallet',
                                currency: 'USD',
                                is_virtual: 0,
                                loginid: 'CRW10001',
                            },
                            {
                                account_category: 'trading',
                                currency: 'USD',
                                is_virtual: 0,
                                loginid: 'CRW10002',
                            },
                            {
                                account_category: 'wallet',
                                currency: 'UST',
                                is_virtual: 0,
                                loginid: 'CRW10003',
                            },
                            {
                                account_category: 'wallet',
                                currency: 'BTC',
                                is_virtual: 1,
                                loginid: 'VRW10001',
                            },
                            {
                                account_category: 'wallet',
                                currency: 'AUD',
                                is_virtual: 0,
                                loginid: 'CRW10004',
                            },
                            {
                                account_category: 'wallet',
                                currency: 'ETH',
                                is_virtual: 0,
                                loginid: 'CRW10005',
                            },
                        ],
                    },
                },
            };
        } else if (name === 'balance') {
            return {
                data: {
                    balance: {
                        accounts: {
                            CRW909900: {
                                balance: 0,
                            },
                        },
                    },
                },
            };
        } else if (name === 'website_status') {
            return {
                data: {
                    website_status: {
                        currencies_config: {
                            AUD: { type: 'fiat' },
                            BTC: { type: 'crypto' },
                            ETH: { type: 'crypto' },
                            UST: { type: 'crypto' },
                            USD: { type: 'fiat' },
                        },
                    },
                },
            };
        }

        return undefined;
    }),
}));

jest.mock('./../cards-slider-swiper', () => jest.fn(() => <div>slider</div>));

describe('<WalletCardsCarousel />', () => {
    it('Should render slider', () => {
        const mock = mockStore({ client: { accounts: { CRW909900: { token: '12345' } }, loginid: 'CRW909900' } });

        const wrapper = ({ children }: { children: JSX.Element }) => (
            <APIProvider>
                <StoreProvider store={mock}>{children}</StoreProvider>
            </APIProvider>
        );

        render(<WalletCardsCarousel />, { wrapper });
        const slider = screen.queryByText('slider');

        expect(slider).toBeInTheDocument();
    });

    it('Should render buttons for REAL', () => {
        const mock = mockStore({ client: { accounts: { CRW909900: { token: '12345' } }, loginid: 'CRW909900' } });

        const wrapper = ({ children }: { children: JSX.Element }) => (
            <APIProvider>
                <StoreProvider store={mock}>{children}</StoreProvider>
            </APIProvider>
        );

        render(<WalletCardsCarousel />, { wrapper });

        const btn1 = screen.queryByText(/Deposit/i);
        const btn2 = screen.queryByText(/Withdraw/i);
        const btn3 = screen.queryByText(/Transfer/i);
        const btn4 = screen.queryByText(/Transactions/i);

        expect(btn1).toBeInTheDocument();
        expect(btn2).toBeInTheDocument();
        expect(btn3).toBeInTheDocument();
        expect(btn4).toBeInTheDocument();
    });

    it('Should render buttons for DEMO', () => {
        const mock = mockStore({ client: { accounts: { VRW10001: { token: '12345' } }, loginid: 'VRW10001' } });

        const wrapper = ({ children }: { children: JSX.Element }) => (
            <APIProvider>
                <StoreProvider store={mock}>{children}</StoreProvider>
            </APIProvider>
        );

        render(<WalletCardsCarousel />, { wrapper });

        const btn1 = screen.queryByText(/Transfer/i);
        const btn2 = screen.queryByText(/Transactions/i);
        const btn3 = screen.queryByText(/Reset balance/i);

        expect(btn1).toBeInTheDocument();
        expect(btn2).toBeInTheDocument();
        expect(btn3).toBeInTheDocument();
    });
});

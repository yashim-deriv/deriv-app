import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import RecentTransaction from '../recent-transaction';
import { BrowserHistory, createBrowserHistory } from 'history';
import { Router } from 'react-router';
import CashierProviders from '../../../cashier-providers';
import { mockStore } from '@deriv/stores';

describe('<RecentTransaction />', () => {
    let history: BrowserHistory, mockRootStore: ReturnType<typeof mockStore>;
    beforeEach(() => {
        history = createBrowserHistory();
        mockRootStore = mockStore({
            client: {
                currency: 'BTC',
            },
            modules: {
                cashier: {
                    transaction_history: {
                        crypto_transactions: [
                            {
                                address_hash: 'tb1ql7w62elx9ucw4pj5lgw4l028hmuw80sndtntxt',
                                address_url:
                                    'https://www.blockchain.com/btc-testnet/address/tb1ql7w62elx9ucw4pj5lgw4l028hmuw80sndtntxt',
                                amount: 0.01,
                                id: '262',
                                is_valid_to_cancel: 1,
                                status_code: 'LOCKED',
                                status_message:
                                    "We're reviewing your withdrawal request. You may still cancel this transaction if you wish. Once we start processing, you won't be able to cancel.",
                                submit_date: 1644408421,
                                transaction_type: 'withdrawal',
                            },
                        ],
                        onMount: jest.fn(),
                        setIsCryptoTransactionsVisible: jest.fn(),
                    },
                },
            },
        });
    });

    const renderRecentTransaction = () => {
        return render(
            <CashierProviders store={mockRootStore}>
                <Router history={history}>
                    <RecentTransaction />
                </Router>
            </CashierProviders>
        );
    };

    it('should show proper messages', () => {
        renderRecentTransaction();

        expect(screen.getByText('Recent transactions')).toBeInTheDocument();
        expect(screen.getByText('Withdrawal BTC')).toBeInTheDocument();
        expect(screen.getByText('In review')).toBeInTheDocument();
        expect(screen.getByText('0.01 BTC on Feb 9, 2022')).toBeInTheDocument();
        expect(screen.getByText('Address:')).toBeInTheDocument();
        expect(screen.getByText('tb1q....ntxt')).toBeInTheDocument();
        expect(screen.getByText('Transaction hash:')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('View all')).toBeInTheDocument();
    });

    it('should trigger onClick callback when the user clicks on "View all" button', () => {
        renderRecentTransaction();

        const view_all_btn_link = screen.getByRole('link', { name: 'View all' });
        fireEvent.click(view_all_btn_link);

        expect(mockRootStore.modules.cashier.transaction_history.setIsCryptoTransactionsVisible).toHaveBeenCalledTimes(
            1
        );
    });
});

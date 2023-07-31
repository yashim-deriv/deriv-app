import React, { useState } from 'react';
import { Button, ButtonLink, Clipboard, Dropdown, Icon, Loading, Text } from '@deriv/components';
import { localize, Localize } from '@deriv/translations';
import { CryptoConfig, getCurrencyName, isCryptocurrency, isMobile } from '@deriv/shared';
import { useStore, observer } from '@deriv/stores';
import { useFetch } from '@deriv/api';
import CashierBreadcrumb from '../../../components/cashier-breadcrumb';
import QRCode from 'qrcode.react';
import RecentTransaction from '../../../components/recent-transaction';
import AlertBanner from '../../../components/alert-banner/alert-banner';
import { useCashierStore } from '../../../stores/useCashierStores';
import './crypto-deposit.scss';

const CryptoDeposit = observer(() => {
    const { client } = useStore();
    const { currency } = client;
    const { onramp, transaction_history, general_store } = useCashierStore();
    const { api_error, deposit_address, is_deposit_address_loading, pollApiForDepositAddress } = onramp;
    const { crypto_transactions, onMount: recentTransactionOnMount } = transaction_history;
    const { setIsDeposit } = general_store;

    const { data } = useFetch('crypto_config', { payload: { currency_code: currency } });
    const minimum_deposit = data?.crypto_config?.currencies_config[currency]?.minimum_deposit;

    React.useEffect(() => {
        recentTransactionOnMount();
    }, [recentTransactionOnMount]);

    React.useEffect(() => {
        setIsDeposit(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        pollApiForDepositAddress(false);
    }, [pollApiForDepositAddress]);

    const option_list = [
        { text: localize('Binance Smart Chain'), value: '1' },
        { text: localize('Polygon (Matic)'), value: '2' },
        { text: localize('Tron'), value: '3' },
        { text: localize('Ethereum (ERC20)'), value: '4' },
        { text: localize('Ethereum (ETH)'), value: '5' },
    ];

    const [option_message, setOptionMessage] = useState<JSX.Element | string>('');
    const [option_list_value, setOptionListValue] = useState<string | number>(0);
    const [qrcode_header, setQRCodeHeader] = useState<JSX.Element | string>('');

    const onChangeListOption = (event: { target: { value: number | string } }) => {
        const token_ETH = 'ETH';
        const token_USDC_eUSDT = 'ERC20';
        let token = '';

        if (currency === 'ETH') {
            token = token_ETH;
        } else if (['USDC', 'eUSDT'].includes(currency)) {
            token = token_USDC_eUSDT;
        }

        const setProhibitedTokenMessage = () => {
            const prohibited_token = token === token_ETH ? `${token_USDC_eUSDT} token` : token_ETH;
            setOptionMessage(
                <Localize
                    i18n_default_text='This is an Ethereum ({{token}}) only address, please do not use {{prohibited_token}}.'
                    values={{ token, prohibited_token }}
                />
            );
        };

        const setQRCodeHeaderMessage = () => {
            setOptionMessage('');
            setQRCodeHeader(
                <Localize i18n_default_text="Do not send any other currency to the following address. Otherwise, you'll lose funds." />
            );
        };

        switch (event.target.value) {
            case option_list[0].value:
                setOptionMessage(
                    <Localize
                        i18n_default_text='We do not support Binance Smart Chain tokens to deposit, please use only Ethereum ({{token}}).'
                        values={{ token }}
                    />
                );
                break;
            case option_list[1].value:
                setOptionMessage(
                    <Localize
                        i18n_default_text='We do not support Polygon (Matic), to deposit please use only Ethereum ({{token}}).'
                        values={{ token }}
                    />
                );
                break;
            case option_list[2].value:
                setOptionMessage(
                    <Localize
                        i18n_default_text='We do not support Tron, to deposit please use only Ethereum ({{token}}).'
                        values={{ token }}
                    />
                );
                break;
            case option_list[3].value:
                (currency === 'ETH' ? setProhibitedTokenMessage : setQRCodeHeaderMessage)();
                break;
            case option_list[4].value:
                (['USDC', 'eUSDT'].includes(currency) ? setProhibitedTokenMessage : setQRCodeHeaderMessage)();
                break;
            default:
                setOptionMessage('');
        }

        setOptionListValue(event.target.value);
    };

    if (is_deposit_address_loading) {
        return <Loading is_fullscreen />;
    }

    const currency_name = getCurrencyName(currency);
    const currency_display_code = CryptoConfig.get()[currency].display_code;

    let header_note;

    if (['ETH', 'USDC', 'eUSDT'].includes(currency)) {
        header_note = (
            <Localize i18n_default_text='Please select the network from where your deposit will come from.' />
        );
    } else {
        header_note = (
            <Localize i18n_default_text="Do not send any other currency to the following address. Otherwise, you'll lose funds." />
        );
    }

    return (
        <div className='cashier__wrapper crypto-deposit__wrapper'>
            <CashierBreadcrumb />
            <div className='crypto-deposit__transaction-wrapper'>
                <Icon icon={`IcCurrency-${currency?.toLowerCase()}`} size={64} />
                <Text
                    align='center'
                    as='p'
                    className='crypto-deposit__transaction-currency'
                    line_height='m'
                    size={isMobile() ? 'xs' : 's'}
                    weight='bold'
                >
                    <Localize
                        i18n_default_text='Send only {{currency}} ({{currency_symbol}}) to this address.'
                        values={{
                            currency: currency_name,
                            currency_symbol: currency_display_code,
                        }}
                    />
                </Text>
                {api_error ? (
                    <div className='crypto-api-error'>
                        <AlertBanner
                            icon='IcAlertWarning'
                            message={localize(
                                "Unfortunately, we couldn't get the address since our server was down. Please click Refresh to reload the address or try again later."
                            )}
                        />
                        <Button
                            text={localize('Refresh')}
                            onClick={() => pollApiForDepositAddress(false)}
                            secondary
                            small
                        />
                    </div>
                ) : (
                    <>
                        {minimum_deposit ? (
                            <AlertBanner
                                className='crypto-third-party-alert'
                                icon='IcAlertWarningDark'
                                message={localize(
                                    'A minimum deposit value of {{minimum_deposit}} {{currency}} is required. Otherwise, the funds will be lost and cannot be recovered.',
                                    {
                                        minimum_deposit,
                                        currency,
                                    }
                                )}
                            />
                        ) : (
                            <Text as='p' align='center' line_height='m' size={isMobile() ? 'xs' : 's'}>
                                {qrcode_header || header_note}
                            </Text>
                        )}
                        {
                            <>
                                {((currency === 'ETH' && option_list_value !== option_list[4].value) ||
                                    (['USDC', 'eUSDT'].includes(currency) &&
                                        option_list_value !== option_list[3].value)) && (
                                    <Dropdown
                                        className='crypto-deposit__dropdown-menu'
                                        is_align_text_left
                                        list={option_list}
                                        name='dropdown'
                                        onChange={onChangeListOption}
                                        placeholder={localize('Choose an option')}
                                        value={option_list_value}
                                    />
                                )}
                                {option_message && (
                                    <Text
                                        align='center'
                                        as='p'
                                        color='loss-danger'
                                        className='crypto-deposit__eth-option-message'
                                        line_height='m'
                                        size={isMobile() ? 'xs' : 's'}
                                    >
                                        {option_message}
                                    </Text>
                                )}
                            </>
                        }
                        {(!['ETH', 'USDC', 'eUSDT'].includes(currency) ||
                            (currency === 'ETH' && option_list_value === option_list[4].value) ||
                            (['USDC', 'eUSDT'].includes(currency) && option_list_value === option_list[3].value)) && (
                            <>
                                <QRCode className='qrcode' value={deposit_address || ''} size={160} includeMargin />
                                <div className='crypto-deposit__clipboard-wrapper'>
                                    <Text
                                        className='crypto-deposit__address-hash'
                                        line_height='m'
                                        size={isMobile() ? 'xxs' : 'xs'}
                                        weight='bold'
                                        align='center'
                                    >
                                        {deposit_address}
                                    </Text>
                                    <Clipboard
                                        className='crypto-deposit__clipboard'
                                        text_copy={deposit_address || ''}
                                        info_message={isMobile() ? '' : localize('copy')}
                                        icon='IcCashierClipboard'
                                        success_message={localize('copied!')}
                                        popoverAlignment={isMobile() ? 'left' : 'bottom'}
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
            <div className='crypto-deposit__fiat-onramp-wrapper'>
                <div className='crypto-deposit__fiat-onramp-description'>
                    <Text as='p' line_height='m' size={isMobile() ? 'xs' : 's'} align='center'>
                        <Localize i18n_default_text='Looking for a way to buy cryptocurrency?' />
                    </Text>
                    {isMobile() ? null : <br />}
                    <Text as='p' line_height='m' size={isMobile() ? 'xs' : 's'} align='center'>
                        <Localize i18n_default_text='Use our fiat onramp services to buy and deposit cryptocurrency into your Deriv account.' />
                    </Text>
                </div>
                <ButtonLink className='crypto-deposit__fiat-onramp-button' to='/cashier/on-ramp'>
                    <Text as='p' weight='bold' color='colored-background' size='xs'>
                        <Localize i18n_default_text='Try our Fiat onramp' />
                    </Text>
                </ButtonLink>
            </div>
            {isMobile() && isCryptocurrency(currency) ? <RecentTransaction /> : null}
        </div>
    );
});

export default CryptoDeposit;

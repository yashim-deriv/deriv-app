import { WS } from '@deriv/shared';
import { queryClient } from './APIProvider';
import { TSocketEndpointNames, TSocketRequestPayload, TSocketResponseData } from '../types';

export const send = async <T extends TSocketEndpointNames>(
    name: T,
    payload?: TSocketRequestPayload<T>
): Promise<TSocketResponseData<T>> => {
    const response = await WS.send({ [name]: 1, ...(payload || {}) });

    if (response.error) {
        throw response.error;
    }

    return response;
};

export const getQueryKeys = (name: string, props?: Record<string, unknown>) => {
    if (!props) return [name];

    delete props.req_id;
    if (name && props[name] === 1) delete props[name];

    if (Object.keys(props).length === 0) return [name];

    const ordered_props = Object.keys(props)
        .sort()
        .reduce((obj, key) => {
            obj[key] = props[key];

            return obj;
        }, {} as { [k: string]: unknown });

    const query_props = JSON.stringify(ordered_props);

    return [name, query_props];
};

const AUTH_REQUIRED_ENDPOINTS = [
    'account_security',
    'balance',
    'get_account_status',
    'get_account_types',
    'get_available_accounts_to_transfer',
    'get_financial_assessment',
    'get_limits',
    'get_self_exclusion',
    'get_settings',
    'mt5_login_list',
    'new_account_real',
    'new_account_virtual',
    'new_account_wallet',
    'p2p_order_list',
    'payout_currencies',
    'portfolio',
    'proposal_open_contract',
    'statement',
    'topup_virtual',
    'trading_platform_accounts',
    'trading_platform_available_accounts',
    'trading_servers',
    'transaction',
    'transfer_between_accounts',
    'wallet_migration',
];

export const isAuthorized = (name: TSocketEndpointNames) => {
    let is_authorized = true;

    if (AUTH_REQUIRED_ENDPOINTS.includes(name)) {
        const accounts = JSON.parse(localStorage.getItem('client.accounts') || '{}');
        const active_loginid = localStorage.getItem('active_loginid');
        const current_token = accounts?.[active_loginid || '']?.token;
        const state = queryClient.getQueryState<TSocketResponseData<'authorize'>>([
            'authorize',
            JSON.stringify({ authorize: current_token }),
        ]);
        is_authorized = Boolean(state?.data?.authorize);
    }

    return is_authorized;
};

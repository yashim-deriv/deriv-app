import React from 'react';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router-dom';
import {
    Button,
    DesktopWrapper,
    Div100vhContainer,
    FadeWrapper,
    MobileWrapper,
    PageOverlay,
    VerticalTab,
    Loading,
} from '@deriv/components';
import {
    useOnrampVisible,
    useAccountTransferVisible,
    useIsP2PEnabled,
    usePaymentAgentTransferVisible,
    useP2PNotificationCount,
} from '@deriv/hooks';
import { getSelectedRoute, getStaticUrl, isMobile, routes, WS } from '@deriv/shared';
import ErrorDialog from '../../components/error-dialog';
import { TRoute } from '../../types';
import { localize } from '@deriv/translations';
import { observer, useStore } from '@deriv/stores';
import { useCashierStore } from '../../stores/useCashierStores';
import type { TCoreStores } from '@deriv/stores/types';
import './cashier.scss';

type TCashierProps = RouteComponentProps & {
    routes: TRoute[];
    tab_index: number;
    onMount: (should_remount?: boolean) => void;
    setAccountSwitchListener: () => void;
    setTabIndex: (index: number) => void;
    routeBackInApp: TCoreStores['common']['routeBackInApp'];
    toggleCashier: TCoreStores['ui']['toggleCashier'];
    resetLastLocation: () => void;
};

type TCashierOptions = {
    count?: number;
    default?: boolean;
    has_side_note: boolean;
    icon: string;
    label: string;
    path?: string;
    value?: typeof React.Component;
};

const Cashier = observer(({ history, location, routes: routes_config }: TCashierProps) => {
    const { common, ui, client } = useStore();
    const { withdraw, general_store, transaction_history, payment_agent } = useCashierStore();
    const { error } = withdraw;
    const {
        is_cashier_onboarding,
        is_loading,
        onMountCommon: onMount,
        setAccountSwitchListener,
        setCashierTabIndex: setTabIndex,
        cashier_route_tab_index: tab_index,
    } = general_store;
    const { is_crypto_transactions_visible } = transaction_history;
    const {
        data: is_payment_agent_transfer_visible,
        isLoading: is_payment_agent_checking,
        isSuccess: is_payment_agent_transfer_visible_is_success,
    } = usePaymentAgentTransferVisible();
    const { is_payment_agent_visible } = payment_agent;
    const { is_from_derivgo } = common;
    const { is_cashier_visible: is_visible, toggleCashier } = ui;
    const { is_account_setting_loaded, is_logged_in, is_logging_in } = client;
    const is_account_transfer_visible = useAccountTransferVisible();
    const is_onramp_visible = useOnrampVisible();
    const p2p_notification_count = useP2PNotificationCount();
    const {
        data: is_p2p_enabled,
        isSuccess: is_p2p_enabled_success,
        isLoading: is_p2p_enabled_loading,
    } = useIsP2PEnabled();

    React.useEffect(() => {
        toggleCashier();
        // we still need to populate the tabs shown on cashier
        return () => {
            toggleCashier();
        };
    }, [toggleCashier]);

    React.useEffect(() => {
        (async () => {
            await WS?.wait('authorize');
            if (is_logged_in) {
                onMount();
                setAccountSwitchListener();
            }
        })();
    }, [is_logged_in, onMount, setAccountSwitchListener]);

    React.useEffect(() => {
        if (
            is_payment_agent_transfer_visible_is_success &&
            !is_payment_agent_transfer_visible &&
            history.location.pathname === routes.cashier_pa_transfer
        ) {
            history.push(routes.cashier_deposit);
        }
    }, [history, is_payment_agent_transfer_visible, is_payment_agent_transfer_visible_is_success]);

    React.useEffect(() => {
        if (is_p2p_enabled_success && !is_p2p_enabled && history.location.pathname.startsWith(routes.cashier_p2p)) {
            history.push(routes.cashier_deposit);
        }
    }, [history, is_p2p_enabled, is_p2p_enabled_success]);

    const onClickClose = () => history.push(routes.traders_hub);
    const getMenuOptions = () => {
        const options: TCashierOptions[] = [];
        routes_config.forEach(route => {
            if (
                !route.is_invisible &&
                (route.path !== routes.cashier_pa || is_payment_agent_visible) &&
                (route.path !== routes.cashier_pa_transfer || is_payment_agent_transfer_visible) &&
                (route.path !== routes.cashier_p2p || is_p2p_enabled) &&
                (route.path !== routes.cashier_onramp || is_onramp_visible) &&
                (route.path !== routes.cashier_acc_transfer || is_account_transfer_visible)
            ) {
                options.push({
                    ...(route.path === routes.cashier_p2p && { count: p2p_notification_count }),
                    default: route.default,
                    icon: route.icon_component,
                    label: route.getTitle(),
                    value: route.component,
                    path: route.path,
                    has_side_note: is_crypto_transactions_visible ? false : route.path !== routes.cashier_p2p, // Set to true to create the 3-column effect without passing any content. If there is content, the content should be passed in.
                });
            }
        });

        return options;
    };

    const selected_route = getSelectedRoute({ routes: routes_config, pathname: location.pathname });
    // const should_show_tab_headers_note =
    //     !is_virtual &&
    //     (location.pathname.startsWith(routes.cashier_deposit) ||
    //         location.pathname.startsWith(routes.cashier_withdrawal));

    const is_default_route = !!getSelectedRoute({ routes: routes_config, pathname: location.pathname }).default;

    // '|| !is_account_setting_loaded' condition added to make sure client_tnc_status loaded
    if (
        ((!is_logged_in || isMobile()) && is_logging_in) ||
        !is_account_setting_loaded ||
        is_payment_agent_checking ||
        is_p2p_enabled_loading
    ) {
        return <Loading is_fullscreen />;
    }

    const getHeaderTitle = () => {
        if (!isMobile() || (is_default_route && (is_loading || is_cashier_onboarding))) return localize('Cashier');

        return selected_route.getTitle?.();
    };

    return (
        <FadeWrapper is_visible={is_visible} className='cashier__page-wrapper' keyname='cashier__page-wrapper'>
            <ErrorDialog error={error} />
            <div className='cashier'>
                <PageOverlay header={getHeaderTitle()} onClickClose={onClickClose} is_from_app={is_from_derivgo}>
                    <DesktopWrapper>
                        <VerticalTab
                            current_path={location.pathname}
                            is_floating
                            setVerticalTabIndex={setTabIndex}
                            vertical_tab_index={is_default_route ? 0 : tab_index}
                            is_full_width
                            is_routed
                            list={getMenuOptions()}
                            tab_headers_note={
                                <Button
                                    id='cashier_learn_more'
                                    className='cashier__page-wrapper-button'
                                    text={localize('Learn more about payment methods')}
                                    onClick={() => window.open(getStaticUrl('/payment-methods'))}
                                    secondary
                                />
                            }
                            // TODO: Uncomment when Ewallet.Exchange is available
                            // tab_headers_note={
                            //     should_show_tab_headers_note ? (
                            //         <Text as='p' size='xxs' className='cashier__tab-header-note'>
                            //             <Localize
                            //                 i18n_default_text='Want to exchange between e-wallet currencies? Try <0>Ewallet.Exchange</0>'
                            //                 components={[
                            //                     <a
                            //                         key={0}
                            //                         href='https://ewallet.exchange'
                            //                         rel='noopener noreferrer'
                            //                         target='_blank'
                            //                         className='link'
                            //                     />,
                            //                 ]}
                            //             />
                            //         </Text>
                            //     ) : undefined
                            // }
                        />
                    </DesktopWrapper>
                    <MobileWrapper>
                        <Div100vhContainer className='cashier__wrapper--is-mobile' height_offset='80px'>
                            {selected_route && selected_route.component && (
                                <selected_route.component
                                    component_icon={selected_route.icon_component}
                                    history={history}
                                    menu_options={getMenuOptions()}
                                />
                            )}
                        </Div100vhContainer>
                    </MobileWrapper>
                </PageOverlay>
            </div>
        </FadeWrapper>
    );
});
export default withRouter(Cashier);

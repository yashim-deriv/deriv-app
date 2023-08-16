import React from 'react';
import { withRouter } from 'react-router-dom';
import {
    DesktopWrapper,
    MobileWrapper,
    ProgressBar,
    ProgressSliderMobile,
    DataList,
    DataTable,
    ContractCard,
    usePrevious,
    PositionsDrawerCard,
    SelectNative,
    Dropdown,
} from '@deriv/components';
import {
    isAccumulatorContract,
    isMobile,
    isMultiplierContract,
    isVanillaContract,
    isTurbosContract,
    getTimePercentage,
    getUnsupportedContracts,
    getTotalProfit,
    getContractPath,
    getCurrentTick,
    getDurationPeriod,
    getDurationUnitText,
    getGrowthRatePercentage,
    getCardLabels,
    toMoment,
    TContractStore,
} from '@deriv/shared';
import { localize, Localize } from '@deriv/translations';
import { ReportsTableRowLoader } from '../Components/Elements/ContentLoader';
import { getContractDurationType } from '../Helpers/market-underlying';

import EmptyTradeHistoryMessage from '../Components/empty-trade-history-message';
import {
    getOpenPositionsColumnsTemplate,
    getAccumulatorOpenPositionsColumnsTemplate,
    getMultiplierOpenPositionsColumnsTemplate,
} from 'Constants/data-table-constants';
import PlaceholderComponent from '../Components/placeholder-component';
import { connect } from 'Stores/connect';
import type { TRootStore } from 'Stores/index';
import { TColIndex } from 'Types';
import moment from 'moment';

type TPortfolioStore = TRootStore['portfolio'];
type TDataList = React.ComponentProps<typeof DataList>;
type TDataListCell = React.ComponentProps<typeof DataList.Cell>;
type TRowRenderer = TDataList['rowRenderer'];
type TMobileRowRenderer = {
    row?: TDataList['data_source'][number];
    is_footer?: boolean;
    columns_map?: Record<TColIndex, TDataListCell['column']>;
    server_time?: moment.Moment;
    onClickCancel: (contract_id?: number) => void;
    onClickSell: (contract_id?: number) => void;
    measure?: () => void;
};
type TRangeFloatZeroToOne = React.ComponentProps<typeof ProgressBar>['value'];
type TEmptyPlaceholderWrapper = React.PropsWithChildren<{
    is_empty: boolean;
    component_icon: string;
}>;

const EmptyPlaceholderWrapper = ({ is_empty, component_icon, children }: TEmptyPlaceholderWrapper) => (
    <React.Fragment>
        {is_empty ? (
            <PlaceholderComponent
                is_empty={is_empty}
                empty_message_component={EmptyTradeHistoryMessage}
                component_icon={component_icon}
                localized_message={localize('You have no open positions yet.')}
            />
        ) : (
            children
        )}
    </React.Fragment>
);

type TOpenPositionsTable = Pick<TDataList, 'getRowAction'> & {
    className: string;
    columns: Record<string, unknown>[];
    component_icon: string;
    currency: string;
    active_positions: TPortfolioStore['active_positions'];
    is_loading: boolean;
    mobileRowRenderer: TRowRenderer;
    preloaderCheck: (item: TTotals) => boolean;
    row_size: number;
    totals: TTotals;
    is_empty: boolean;
};

type TTotals = {
    contract_info?: {
        profit?: number;
        buy_price?: number;
        bid_price?: number;
        cancellation?: {
            ask_price?: number;
        };
        limit_order?: {
            take_profit?: {
                order_amount?: number | null;
            };
        };
    };
    indicative?: number;
    purchase?: number;
    profit_loss?: number;
    payout?: number;
};

type TAddToastProps = {
    key?: string;
    content: string;
    timeout?: number;
    is_bottom?: boolean;
    type?: string;
};

type TOpenPositions = Pick<
    TPortfolioStore,
    | 'active_positions'
    | 'error'
    | 'getPositionById'
    | 'is_loading'
    | 'is_multiplier'
    | 'onClickCancel'
    | 'onClickSell'
    | 'onMount'
> & {
    component_icon: string;
    currency: string;
    is_accumulator: boolean;
    is_eu: boolean;
    is_virtual: boolean;
    NotificationMessages: () => JSX.Element;
    server_time: moment.Moment;
    addToast: (obj: TAddToastProps) => void;
    current_focus: string;
    onClickRemove: () => void;
    getContractById: (contract_id?: number) => TContractStore;
    removeToast: () => void;
    setCurrentFocus: () => void;
    should_show_cancellation_warning: boolean;
    toggleCancellationWarning: () => void;
    toggleUnsupportedContractModal: () => void;
};

type TMobileRowRendererProps = Pick<
    TOpenPositions,
    | 'addToast'
    | 'current_focus'
    | 'getContractById'
    | 'onClickRemove'
    | 'removeToast'
    | 'setCurrentFocus'
    | 'should_show_cancellation_warning'
    | 'toggleCancellationWarning'
    | 'toggleUnsupportedContractModal'
> &
    Omit<TMobileRowRenderer, 'columns_map'> & {
        columns_map: { [key: TColIndex]: undefined | TDataListCell['column'] };
    };

const MobileRowRenderer = ({
    row = {},
    is_footer,
    columns_map = {},
    server_time = toMoment(),
    onClickCancel,
    onClickSell,
    measure,
    ...props
}: TMobileRowRendererProps) => {
    React.useEffect(() => {
        if (!is_footer) {
            measure?.();
        }
    }, [row.contract_info?.underlying, measure, is_footer]);

    if (is_footer) {
        return (
            <>
                <div className='open-positions__data-list-footer--content'>
                    <div>
                        <DataList.Cell row={row} column={columns_map.purchase} />
                        <DataList.Cell row={row} column={columns_map.payout} />
                    </div>
                    <div>
                        <DataList.Cell
                            className='data-list__row-cell--amount'
                            row={row}
                            column={columns_map.indicative}
                        />
                        <DataList.Cell className='data-list__row-cell--amount' row={row} column={columns_map.profit} />
                    </div>
                </div>
            </>
        );
    }

    const { contract_info, contract_update, type, is_sell_requested } =
        row as TPortfolioStore['active_positions'][number];
    const { currency, status, date_expiry, date_start, tick_count, purchase_time } = contract_info;
    const current_tick = tick_count ? getCurrentTick(contract_info) : null;
    const turbos_duration_unit = tick_count ? 'ticks' : getDurationUnitText(getDurationPeriod(contract_info), true);
    const duration_type = getContractDurationType(
        isTurbosContract(contract_info.contract_type) ? turbos_duration_unit : contract_info.longcode || ''
    );
    const progress_value = (getTimePercentage(server_time, date_start ?? 0, date_expiry ?? 0) /
        100) as TRangeFloatZeroToOne;

    if (isMultiplierContract(type ?? '') || isAccumulatorContract(type)) {
        return (
            <PositionsDrawerCard
                contract_info={contract_info}
                contract_update={contract_update}
                currency={currency ?? ''}
                is_link_disabled
                onClickCancel={onClickCancel}
                onClickSell={onClickSell}
                server_time={server_time}
                status={status ?? ''}
                {...props}
            />
        );
    }

    return (
        <>
            <div className='data-list__row'>
                <DataList.Cell row={row} column={columns_map.type} />
                {isVanillaContract(type) || (isTurbosContract(type) && !tick_count) ? (
                    <ProgressSliderMobile
                        current_tick={current_tick}
                        className='data-list__row--timer'
                        expiry_time={date_expiry}
                        getCardLabels={getCardLabels}
                        is_loading={false}
                        server_time={server_time}
                        start_time={purchase_time}
                        ticks_count={tick_count}
                    />
                ) : (
                    <ProgressBar label={duration_type} value={progress_value} />
                )}
            </div>
            <div className='data-list__row'>
                <DataList.Cell row={row} column={columns_map.reference} />
                <DataList.Cell className='data-list__row-cell--amount' row={row} column={columns_map.currency} />
            </div>
            <div className='data-list__row'>
                <DataList.Cell row={row} column={columns_map.purchase} />
                <DataList.Cell className='data-list__row-cell--amount' row={row} column={columns_map.indicative} />
            </div>
            <div className='data-list__row'>
                <DataList.Cell row={row} column={columns_map.payout} />
                <DataList.Cell className='data-list__row-cell--amount' row={row} column={columns_map.profit} />
            </div>
            <div className='data-list__row-divider' />
            <div className='data-list__row'>
                <ContractCard.Sell
                    contract_info={contract_info}
                    is_sell_requested={is_sell_requested}
                    getCardLabels={getCardLabels}
                    onClickSell={onClickSell}
                />
            </div>
        </>
    );
};

export const OpenPositionsTable = ({
    className,
    columns,
    component_icon,
    currency,
    active_positions,
    is_loading,
    getRowAction,
    mobileRowRenderer,
    preloaderCheck,
    row_size,
    totals,
    is_empty,
}: TOpenPositionsTable) => (
    <React.Fragment>
        {is_loading ? (
            <PlaceholderComponent
                is_loading={is_loading}
                empty_message_component={EmptyTradeHistoryMessage}
                component_icon={component_icon}
                localized_message={localize('You have no open positions yet.')}
            />
        ) : (
            currency && (
                <div className='reports__content'>
                    <DesktopWrapper>
                        <EmptyPlaceholderWrapper component_icon={component_icon} is_empty={is_empty}>
                            <DataTable
                                className={className}
                                columns={columns}
                                preloaderCheck={preloaderCheck}
                                footer={totals}
                                data_source={active_positions}
                                getRowAction={getRowAction}
                                getRowSize={() => row_size}
                                content_loader={ReportsTableRowLoader}
                            >
                                <PlaceholderComponent is_loading={is_loading} />
                            </DataTable>
                        </EmptyPlaceholderWrapper>
                    </DesktopWrapper>
                    <MobileWrapper>
                        <EmptyPlaceholderWrapper component_icon={component_icon} is_empty={is_empty}>
                            <DataList
                                className={className}
                                data_source={active_positions}
                                footer={totals}
                                rowRenderer={mobileRowRenderer}
                                getRowAction={getRowAction}
                                row_gap={8}
                                keyMapper={item => item?.id}
                            >
                                <PlaceholderComponent is_loading={is_loading} />
                            </DataList>
                        </EmptyPlaceholderWrapper>
                    </MobileWrapper>
                </div>
            )
        )}
    </React.Fragment>
);

const getRowAction: TDataList['getRowAction'] = row_obj =>
    row_obj.is_unsupported
        ? {
              component: (
                  <Localize
                      i18n_default_text="The {{trade_type_name}} contract details aren't currently available. We're working on making them available soon."
                      values={{
                          trade_type_name:
                              getUnsupportedContracts()[
                                  row_obj.type as keyof ReturnType<typeof getUnsupportedContracts>
                              ]?.name,
                      }}
                  />
              ),
          }
        : getContractPath(row_obj.id || 0);

/*
 * After refactoring transactionHandler for creating positions,
 * purchase property in contract positions object is somehow NaN or undefined in the first few responses.
 * So we set it to true in these cases to show a preloader for the data-table-row until the correct value is set.
 */
const isPurchaseReceived: TOpenPositionsTable['preloaderCheck'] = (item: { purchase?: number }) =>
    isNaN(Number(item.purchase)) || !item.purchase;

const getOpenPositionsTotals = (
    active_positions_filtered: TPortfolioStore['active_positions'],
    is_multiplier_selected: boolean,
    is_accumulator_selected: boolean
) => {
    let totals: TTotals;

    if (is_multiplier_selected) {
        let ask_price = 0;
        let profit = 0;
        let buy_price = 0;
        let bid_price = 0;
        let purchase = 0;

        active_positions_filtered.forEach(portfolio_pos => {
            buy_price += Number(portfolio_pos.contract_info.buy_price);
            bid_price += Number(portfolio_pos.contract_info.bid_price);
            purchase += Number(portfolio_pos.purchase);
            if (portfolio_pos.contract_info) {
                const prices = {
                    bid_price: portfolio_pos.contract_info.bid_price ?? 0,
                    buy_price: portfolio_pos.contract_info.buy_price ?? 0,
                };
                profit += getTotalProfit(prices);

                if (portfolio_pos.contract_info.cancellation) {
                    ask_price += portfolio_pos.contract_info.cancellation.ask_price || 0;
                }
            }
        });
        totals = {
            contract_info: {
                profit,
                buy_price,
                bid_price,
            },
            purchase,
        };

        if (ask_price > 0) {
            if (totals.contract_info)
                totals.contract_info.cancellation = {
                    ask_price,
                };
        }
    } else if (is_accumulator_selected) {
        let buy_price = 0;
        let bid_price = 0;
        let take_profit = 0;
        let profit = 0;

        active_positions_filtered?.forEach(({ contract_info }) => {
            buy_price += +(contract_info.buy_price ?? 0);
            bid_price += +(contract_info.bid_price ?? 0);
            take_profit += contract_info.limit_order?.take_profit?.order_amount ?? 0;
            if (contract_info) {
                profit += getTotalProfit(contract_info);
            }
        });
        totals = {
            contract_info: {
                buy_price,
                bid_price,
                profit,
                limit_order: {
                    take_profit: {
                        order_amount: take_profit,
                    },
                },
            },
            purchase: buy_price,
        };
    } else {
        let indicative = 0;
        let purchase = 0;
        let profit_loss = 0;
        let payout = 0;

        active_positions_filtered?.forEach(portfolio_pos => {
            indicative += +portfolio_pos.indicative;
            purchase += Number(portfolio_pos.purchase);
            profit_loss += Number(portfolio_pos.profit_loss);
            payout += Number(portfolio_pos.payout);
        });
        totals = {
            indicative,
            purchase,
            profit_loss,
            payout,
        };
    }
    return totals;
};

const OpenPositions = ({
    active_positions,
    component_icon,
    currency,
    error,
    getPositionById,
    is_accumulator,
    is_eu,
    is_loading,
    is_multiplier,
    is_virtual,
    NotificationMessages,
    onClickCancel,
    onClickSell,
    onMount,
    server_time,
    ...props
}: TOpenPositions) => {
    const [has_accumulator_contract, setHasAccumulatorContract] = React.useState(false);
    const [has_multiplier_contract, setHasMultiplierContract] = React.useState(false);
    const previous_active_positions = usePrevious(active_positions);
    const contract_types = [
        { text: localize('Options'), is_default: !is_multiplier && !is_accumulator },
        { text: localize('Multipliers'), is_default: is_multiplier },
        { text: localize('Accumulators'), is_default: is_accumulator },
    ];
    const [contract_type_value, setContractTypeValue] = React.useState(
        contract_types.find(type => type.is_default)?.text || localize('Options')
    );
    const accumulator_rates = [localize('All growth rates'), '1%', '2%', '3%', '4%', '5%'];
    const [accumulator_rate, setAccumulatorRate] = React.useState(accumulator_rates[0]);
    const is_accumulator_selected = contract_type_value === contract_types[2].text;
    const is_multiplier_selected = contract_type_value === contract_types[1].text;
    const show_accu_in_dropdown = !is_eu && is_virtual;
    const contract_types_list = contract_types
        .filter(contract_type => contract_type.text !== localize('Accumulators') || show_accu_in_dropdown)
        .map(({ text }) => ({ text, value: text }));
    const accumulators_rates_list = accumulator_rates.map(value => ({ text: value, value }));
    const active_positions_filtered = active_positions?.filter(({ contract_info }) => {
        if (contract_info) {
            if (is_multiplier_selected) return isMultiplierContract(contract_info.contract_type || '');
            if (is_accumulator_selected)
                return (
                    isAccumulatorContract(contract_info.contract_type) &&
                    (`${getGrowthRatePercentage(contract_info.growth_rate || 0)}%` === accumulator_rate ||
                        !accumulator_rate.includes('%'))
                );
            return (
                !isMultiplierContract(contract_info.contract_type || '') &&
                !isAccumulatorContract(contract_info.contract_type)
            );
        }
        return true;
    });
    const active_positions_filtered_totals = getOpenPositionsTotals(
        active_positions_filtered,
        is_multiplier_selected,
        is_accumulator_selected
    );

    React.useEffect(() => {
        /*
         * For mobile, we show portfolio stepper in header even for reports pages.
         * `onMount` in portfolio store will be invoked from portfolio stepper component in `trade-header-extensions.jsx`
         */

        onMount();
        checkForAccuAndMultContracts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        checkForAccuAndMultContracts(previous_active_positions);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previous_active_positions]);

    const checkForAccuAndMultContracts = (prev_active_positions: TPortfolioStore['active_positions'] = []) => {
        if (active_positions === prev_active_positions) return;
        if (!has_accumulator_contract) {
            setHasAccumulatorContract(
                active_positions.some(({ contract_info }) => isAccumulatorContract(contract_info?.contract_type))
            );
        }
        if (!has_multiplier_contract) {
            setHasMultiplierContract(
                active_positions.some(({ contract_info }) => isMultiplierContract(contract_info?.contract_type || ''))
            );
        }
    };

    if (error) return <p>{error}</p>;

    const getColumns = () => {
        if (is_multiplier_selected) {
            return getMultiplierOpenPositionsColumnsTemplate({
                currency,
                onClickCancel,
                onClickSell,
                getPositionById,
                server_time,
            });
        }
        if (is_accumulator_selected) {
            return getAccumulatorOpenPositionsColumnsTemplate({
                currency,
                onClickSell,
                getPositionById,
            });
        }
        return getOpenPositionsColumnsTemplate(currency);
    };

    const columns = getColumns();

    const columns_map = {} as Record<TColIndex, TDataListCell['column']>;
    columns.forEach(e => {
        columns_map[e.col_index] = e as TDataListCell['column'];
    });

    const mobileRowRenderer: TRowRenderer = args => (
        <MobileRowRenderer
            {...args}
            columns_map={columns_map}
            server_time={server_time}
            onClickCancel={onClickCancel}
            onClickSell={onClickSell}
            {...props}
        />
    );

    const shared_props = {
        active_positions: active_positions_filtered,
        component_icon,
        currency,
        is_loading,
        mobileRowRenderer,
        getRowAction,
        preloaderCheck: isPurchaseReceived,
        totals: active_positions_filtered_totals,
    };

    const getOpenPositionsTable = () => {
        let classname = 'open-positions';
        let row_size = isMobile() ? 5 : 63;

        if (is_accumulator_selected) {
            classname = 'open-positions-accumulator open-positions';
            row_size = isMobile() ? 3 : 68;
        } else if (is_multiplier_selected) {
            classname = 'open-positions-multiplier open-positions';
            row_size = isMobile() ? 3 : 68;
        }

        return (
            <OpenPositionsTable
                className={classname}
                columns={columns}
                is_empty={active_positions_filtered.length === 0}
                row_size={row_size}
                {...shared_props}
            />
        );
    };

    return (
        <React.Fragment>
            <NotificationMessages />
            {active_positions.length !== 0 && (
                <React.Fragment>
                    <DesktopWrapper>
                        <div
                            className={
                                is_accumulator_selected
                                    ? 'open-positions__accumulator-container'
                                    : 'open-positions__contract-types-selector-container'
                            }
                        >
                            <div className='open-positions__accumulator-container__contract-dropdown'>
                                <Dropdown
                                    is_align_text_left
                                    name='contract_types'
                                    list={contract_types_list}
                                    value={contract_type_value}
                                    onChange={e => setContractTypeValue(e.target.value)}
                                />
                            </div>
                            {is_accumulator_selected && show_accu_in_dropdown && (
                                <div className='open-positions__accumulator-container__rates-dropdown'>
                                    <Dropdown
                                        is_align_text_left
                                        name='accumulator_rates'
                                        list={accumulators_rates_list}
                                        value={accumulator_rate}
                                        onChange={e => setAccumulatorRate(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    </DesktopWrapper>
                    <MobileWrapper>
                        <div
                            className={
                                is_accumulator_selected
                                    ? 'open-positions__accumulator-container--mobile'
                                    : 'open-positions__contract-types-selector-container--mobile'
                            }
                        >
                            <SelectNative
                                className='open-positions__accumulator-container-mobile__contract-dropdown'
                                list_items={contract_types_list}
                                value={contract_type_value}
                                should_show_empty_option={false}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement> & { target: { value: string } }) =>
                                    setContractTypeValue(e.target.value)
                                }
                            />
                            {is_accumulator_selected && show_accu_in_dropdown && (
                                <SelectNative
                                    className='open-positions__accumulator-container--mobile__rates-dropdown'
                                    list_items={accumulators_rates_list}
                                    value={accumulator_rate}
                                    should_show_empty_option={false}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLSelectElement> & { target: { value: string } }
                                    ) => setAccumulatorRate(e.target.value)}
                                />
                            )}
                        </div>
                    </MobileWrapper>
                </React.Fragment>
            )}
            {getOpenPositionsTable()}
        </React.Fragment>
    );
};

export default withRouter(
    connect(({ client, common, ui, portfolio, contract_trade }: TRootStore) => ({
        active_positions: portfolio.active_positions,
        currency: client.currency,
        is_eu: client.is_eu,
        is_virtual: client.is_virtual,
        error: portfolio.error,
        getPositionById: portfolio.getPositionById,
        is_accumulator: portfolio.is_accumulator,
        is_loading: portfolio.is_loading,
        is_multiplier: portfolio.is_multiplier,
        NotificationMessages: ui.notification_messages_ui,
        onClickCancel: portfolio.onClickCancel,
        onClickSell: portfolio.onClickSell,
        onMount: portfolio.onMount,
        server_time: common.server_time,
        addToast: ui.addToast,
        current_focus: ui.current_focus,
        onClickRemove: portfolio.removePositionById,
        getContractById: contract_trade.getContractById,
        removeToast: ui.removeToast,
        setCurrentFocus: ui.setCurrentFocus,
        should_show_cancellation_warning: ui.should_show_cancellation_warning,
        toggleCancellationWarning: ui.toggleCancellationWarning,
        toggleUnsupportedContractModal: ui.toggleUnsupportedContractModal,
    }))(OpenPositions)
);

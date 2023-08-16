import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import { ContractCard, CurrencyBadge, Icon, Money, ProgressSliderMobile, Text } from '@deriv/components';
import {
    getContractPath,
    isAccumulatorContract,
    isCryptoContract,
    isMultiplierContract,
    isTurbosContract,
    isHighLow,
    isCryptocurrency,
    hasContractEntered,
    isOpen,
    getSymbolDisplayName,
    getEndTime,
    getTotalProfit,
    isVanillaContract,
} from '@deriv/shared';
import { localize } from '@deriv/translations';
import { BinaryLink } from 'App/Components/Routes';
import { PositionsCardLoader } from 'App/Components/Elements/ContentLoader';
import { getContractTypeDisplay, getCardLabels } from 'Constants/contract';
import { getMarketInformation } from 'Utils/Helpers/market-underlying';
import ResultMobile from './result-mobile.jsx';
import { observer, useStore } from '@deriv/stores';
import { useTraderStore } from 'Stores/useTraderStores';

const PositionsModalCard = observer(
    ({
        className,
        contract_info,
        contract_update,
        currency,
        current_tick,
        id,
        indicative,
        is_loading,
        is_sell_requested,
        is_unsupported,
        onClickSell,
        profit_loss,
        onClickCancel,
        result,
        sell_price,
        status,
        togglePositions,
        toggleUnsupportedContractModal,
        type,
    }) => {
        const { ui, common, contract_trade } = useStore();
        const { active_symbols } = useTraderStore();
        const { server_time } = common;
        const { getContractById } = contract_trade;
        const {
            addToast,
            current_focus,
            is_mobile,
            removeToast,
            setCurrentFocus,
            should_show_cancellation_warning,
            toggleCancellationWarning,
        } = ui;
        const loader_el = (
            <div className='positions-modal-card__content-loader'>
                <PositionsCardLoader speed={2} />
            </div>
        );
        const is_multiplier = isMultiplierContract(contract_info.contract_type);
        const is_accumulator = isAccumulatorContract(contract_info.contract_type);
        const is_turbos = isTurbosContract(contract_info.contract_type);
        const is_vanilla = isVanillaContract(contract_info.contract_type);
        const is_crypto = isCryptoContract(contract_info.underlying);
        const has_progress_slider = !is_multiplier || (is_crypto && is_multiplier);
        const has_ended = !!getEndTime(contract_info);
        const fallback_result = profit_loss >= 0 ? 'won' : 'lost';
        const total_profit = getTotalProfit(contract_info);

        const should_show_sell = hasContractEntered(contract_info) && isOpen(contract_info);
        const display_name = getSymbolDisplayName(
            active_symbols,
            getMarketInformation(contract_info.shortcode).underlying
        );

        const contract_options_el = (
            <React.Fragment>
                <div className={classNames('positions-modal-card__grid', 'positions-modal-card__grid-header')}>
                    <div className='positions-modal-card__underlying-name'>
                        <Icon
                            icon={contract_info.underlying ? `IcUnderlying${contract_info.underlying}` : 'IcUnknown'}
                            size={34}
                        />
                        <Text size='xxs' className='positions-modal-card__symbol' weight='bold'>
                            {contract_info.display_name}
                        </Text>
                    </div>
                    <div className='positions-modal-card__type'>
                        <ContractCard.ContractTypeCell
                            getContractTypeDisplay={getContractTypeDisplay}
                            is_high_low={isHighLow({ shortcode: contract_info.shortcode })}
                            multiplier={contract_info.multiplier}
                            type={type}
                        />
                    </div>
                    <CSSTransition
                        in={should_show_sell}
                        timeout={250}
                        classNames={{
                            enter: 'positions-modal-card__sell-button--enter',
                            enterDone: 'positions-modal-card__sell-button--enter-done',
                            exit: 'positions-modal-card__sell-button--exit',
                        }}
                        unmountOnExit
                    >
                        <div className='positions-modal-card__sell-button'>
                            <ContractCard.Sell
                                contract_info={contract_info}
                                is_sell_requested={is_sell_requested}
                                getCardLabels={getCardLabels}
                                onClickSell={onClickSell}
                            />
                        </div>
                    </CSSTransition>
                </div>
                <CurrencyBadge currency={contract_info?.currency ?? ''} />
                <div className={classNames('positions-modal-card__grid', 'positions-modal-card__grid-body')}>
                    <div className={classNames('positions-modal-card__grid-profit-payout')}>
                        <div
                            className={classNames(
                                'positions-modal-card__profit-loss',
                                'positions-modal-card__profit-loss-label'
                            )}
                        >
                            {result ? localize('Profit/Loss:') : localize('Potential profit/loss:')}
                        </div>
                        <div
                            className={classNames(
                                'positions-modal-card__indicative',
                                'positions-modal-card__indicative-label'
                            )}
                        >
                            {!result ? localize('Indicative price:') : localize('Payout:')}
                        </div>
                        <div
                            className={classNames('positions-modal-card__profit-loss', {
                                'positions-modal-card__profit-loss--is-crypto': isCryptocurrency(currency),
                                'positions-modal-card__profit-loss--negative': profit_loss < 0,
                                'positions-modal-card__profit-loss--positive': profit_loss > 0,
                            })}
                        >
                            <Money amount={Math.abs(profit_loss)} currency={currency} />
                            <div
                                className={classNames('positions-modal-card__indicative--movement', {
                                    'positions-modal-card__indicative--movement-complete': !!result,
                                })}
                            >
                                {status === 'profit' && <Icon icon='IcProfit' />}
                                {status === 'loss' && <Icon icon='IcLoss' />}
                            </div>
                        </div>
                        <div className='positions-modal-card__indicative'>
                            <Money amount={sell_price || indicative} currency={currency} />
                            <div
                                className={classNames('positions-modal-card__indicative--movement', {
                                    'positions-modal-card__indicative--movement-complete': !!result,
                                })}
                            >
                                {status === 'profit' && <Icon icon='IcProfit' />}
                                {status === 'loss' && <Icon icon='IcLoss' />}
                            </div>
                        </div>
                    </div>
                    <div className={classNames('positions-modal-card__grid-price-payout')}>
                        <div className='positions-modal-card__purchase-price'>
                            <Text size='xxxs' className='positions-modal-card__purchase-label'>
                                {localize('Purchase price:')}
                            </Text>
                            <Text weight='bold' size='xxs' className='positions-modal-card__purchase-value'>
                                <Money amount={contract_info.buy_price} currency={currency} />
                            </Text>
                        </div>
                        <div className='positions-modal-card__payout-price'>
                            <Text size='xxxs' className='positions-modal-card__payout-label'>
                                {localize('Potential payout:')}
                            </Text>
                            <Text weight='bold' size='xxs' className='positions-modal-card__payout-value'>
                                {contract_info.payout ? (
                                    <Money amount={contract_info.payout} currency={currency} />
                                ) : (
                                    <strong>-i</strong>
                                )}
                            </Text>
                        </div>
                    </div>

                    {result || !!contract_info.is_sold ? (
                        <ResultMobile
                            contract_id={id}
                            is_visible={!!contract_info.is_sold}
                            result={result || fallback_result}
                        />
                    ) : (
                        <ProgressSliderMobile
                            className='positions-modal-card__progress'
                            current_tick={current_tick}
                            getCardLabels={getCardLabels}
                            is_loading={is_loading}
                            start_time={contract_info.date_start}
                            expiry_time={contract_info.date_expiry}
                            server_time={server_time}
                            ticks_count={contract_info.tick_count}
                        />
                    )}
                </div>
            </React.Fragment>
        );

        const contract_vanilla_el = (
            <React.Fragment>
                <NavLink
                    className={classNames('dc-contract-card', {
                        'dc-contract-card--green': profit_loss > 0 && !result,
                        'dc-contract-card--red': profit_loss < 0 && !result,
                    })}
                    to={{
                        pathname: `/contract/${contract_info.contract_id}`,
                    }}
                >
                    <ContractCard.Header
                        contract_info={contract_info}
                        display_name={display_name}
                        getCardLabels={getCardLabels}
                        getContractTypeDisplay={getContractTypeDisplay}
                        has_progress_slider={!is_mobile && has_progress_slider}
                        is_mobile={is_mobile}
                        is_sell_requested={is_sell_requested}
                        onClickSell={onClickSell}
                        server_time={server_time}
                    />
                </NavLink>
                <CurrencyBadge currency={contract_info?.currency ?? ''} />
                <div className={classNames('positions-modal-card__grid', 'positions-modal-card__grid-body')}>
                    <div className={classNames('positions-modal-card__grid-profit-payout')}>
                        <div className='positions-modal-card__purchase-price'>
                            <Text size='xxxs' className='positions-modal-card__purchase-label'>
                                {localize('Buy price:')}
                            </Text>
                            <Text weight='bold' size='xxs' className='positions-modal-card__purchase-value'>
                                <Money amount={contract_info.buy_price} currency={currency} />
                            </Text>
                        </div>
                        <div className='positions-modal-card__payout-price'>
                            <Text size='xxxs' className='positions-modal-card__payout-label'>
                                {localize('Contract value:')}
                            </Text>
                            <Text weight='bold' size='xxs' className='positions-modal-card__payout-value'>
                                <Money amount={contract_info.bid_price} currency={currency} />
                            </Text>
                        </div>
                    </div>

                    <div className={classNames('positions-modal-card__grid-price-payout')}>
                        <div className='positions-modal-card__purchase-price'>
                            <Text size='xxxs' className='positions-modal-card__purchase-label'>
                                {localize('Entry spot:')}
                            </Text>
                            <Text weight='bold' size='xxs' className='positions-modal-card__purchase-value'>
                                <Money amount={contract_info.entry_spot} currency={currency} />
                            </Text>
                        </div>
                        <div className='positions-modal-card__payout-price'>
                            <Text size='xxxs' className='positions-modal-card__payout-label'>
                                {localize('Strike:')}
                            </Text>
                            <Text weight='bold' size='xxs' className='positions-modal-card__payout-value'>
                                <Money amount={contract_info.barrier} currency={currency} />
                            </Text>
                        </div>
                    </div>

                    {result || !!contract_info.is_sold ? (
                        <ResultMobile
                            contract_id={id}
                            is_visible={!!contract_info.is_sold}
                            result={result || fallback_result}
                        />
                    ) : (
                        <ProgressSliderMobile
                            className='positions-modal-card__progress'
                            current_tick={current_tick}
                            getCardLabels={getCardLabels}
                            is_loading={is_loading}
                            start_time={contract_info.date_start}
                            expiry_time={contract_info.date_expiry}
                            server_time={server_time}
                            ticks_count={contract_info.tick_count}
                        />
                    )}
                </div>
                <div className={classNames('positions-modal-card__item', className)}>
                    <div className='dc-contract-card-item__header'>{getCardLabels().TOTAL_PROFIT_LOSS}</div>
                    <div
                        className={classNames('dc-contract-card-item__body', {
                            'dc-contract-card-item__body--crypto': isCryptocurrency(currency),
                            'dc-contract-card-item__body--loss': +total_profit < 0,
                            'dc-contract-card-item__body--profit': +total_profit > 0,
                        })}
                    >
                        <Money amount={total_profit} currency={currency} />
                        <div
                            className={classNames('dc-contract-card__indicative--movement', {
                                'dc-contract-card__indicative--movement-complete': !!contract_info.is_sold,
                            })}
                        >
                            {status === 'profit' && <Icon icon='IcProfit' />}
                            {status === 'loss' && <Icon icon='IcLoss' />}
                        </div>
                    </div>
                </div>
                <ContractCard.Footer
                    contract_info={contract_info}
                    getCardLabels={getCardLabels}
                    is_multiplier={is_multiplier}
                    is_sell_requested={is_sell_requested}
                    onClickCancel={onClickCancel}
                    onClickSell={onClickSell}
                    server_time={server_time}
                    status={status}
                />
            </React.Fragment>
        );

        const custom_card_header = (
            <ContractCard.Header
                contract_info={contract_info}
                display_name={display_name}
                getCardLabels={getCardLabels}
                getContractTypeDisplay={getContractTypeDisplay}
                has_progress_slider={(!is_mobile && has_progress_slider) || is_accumulator}
                is_mobile={is_mobile}
                is_sell_requested={is_sell_requested}
                onClickSell={onClickSell}
                server_time={server_time}
            />
        );

        const custom_card_body = (
            <ContractCard.Body
                addToast={addToast}
                contract_info={contract_info}
                contract_update={contract_update}
                currency={currency}
                current_focus={current_focus}
                getCardLabels={getCardLabels}
                getContractById={getContractById}
                is_accumulator={is_accumulator}
                is_mobile={is_mobile}
                is_multiplier={is_multiplier}
                is_positions
                is_sold={!!contract_info.is_sold}
                is_turbos={is_turbos}
                has_progress_slider={is_mobile && has_progress_slider && !has_ended}
                removeToast={removeToast}
                server_time={server_time}
                setCurrentFocus={setCurrentFocus}
                should_show_cancellation_warning={should_show_cancellation_warning}
                status={status}
                toggleCancellationWarning={toggleCancellationWarning}
            />
        );

        const custom_card_footer = (
            <ContractCard.Footer
                contract_info={contract_info}
                getCardLabels={getCardLabels}
                is_multiplier={is_multiplier}
                is_sell_requested={is_sell_requested}
                onClickCancel={onClickCancel}
                onClickSell={onClickSell}
                server_time={server_time}
                status={status}
            />
        );

        const custom_contract_el = (
            <React.Fragment>
                <ContractCard
                    contract_info={contract_info}
                    getCardLabels={getCardLabels}
                    is_multiplier={is_multiplier}
                    profit_loss={profit_loss}
                    should_show_result_overlay={false}
                >
                    {custom_card_header}
                    {custom_card_body}
                    {custom_card_footer}
                </ContractCard>
            </React.Fragment>
        );

        const options_el = is_vanilla ? contract_vanilla_el : contract_options_el;
        const contract_el = is_multiplier || is_accumulator || is_turbos ? custom_contract_el : options_el;

        return (
            <div id={`dt_drawer_card_${id}`} className={classNames('positions-modal-card__wrapper', className)}>
                {is_unsupported ? (
                    <div
                        className={classNames('positions-modal-card')}
                        onClick={() => toggleUnsupportedContractModal(true)}
                    >
                        {contract_info.underlying ? contract_el : loader_el}
                    </div>
                ) : (
                    <React.Fragment>
                        <BinaryLink
                            onClick={togglePositions}
                            className={classNames('positions-modal-card', {
                                'positions-modal-card--multiplier': is_multiplier,
                            })}
                            to={getContractPath(id)}
                        >
                            {contract_info.underlying ? contract_el : loader_el}
                        </BinaryLink>
                    </React.Fragment>
                )}
            </div>
        );
    }
);

PositionsModalCard.propTypes = {
    className: PropTypes.string,
    contract_info: PropTypes.object,
    contract_update: PropTypes.object,
    currency: PropTypes.string,
    current_tick: PropTypes.number,
    duration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    duration_unit: PropTypes.string,
    exit_spot: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    id: PropTypes.number,
    indicative: PropTypes.number,
    is_loading: PropTypes.bool,
    is_sell_requested: PropTypes.bool,
    is_unsupported: PropTypes.bool,
    is_valid_to_sell: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
    onClickSell: PropTypes.func,
    onClickCancel: PropTypes.func,
    profit_loss: PropTypes.number,
    result: PropTypes.string,
    sell_price: PropTypes.number,
    sell_time: PropTypes.number,
    status: PropTypes.string,
    togglePositions: PropTypes.func,
    toggleUnsupportedContractModal: PropTypes.func,
    type: PropTypes.string,
};

export default PositionsModalCard;

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Text, StaticUrl } from '@deriv/components';
import { Localize, localize } from '@deriv/translations';
import ListingContainer from 'Components/containers/listing-container';
import { BrandConfig } from 'Constants/platform-config';
import TradingAppCard from 'Components/containers/trading-app-card';
import { useStores } from 'Stores/index';
import { isMobile, ContentFlag } from '@deriv/shared';
import PlatformLoader from 'Components/pre-loader/platform-loader';
import { getHasDivider } from 'Constants/utils';

const OptionsAndMultipliersListing = () => {
    const { traders_hub, client, ui } = useStores();
    const { available_platforms, is_eu_user, is_real, no_MF_account, no_CR_account, is_demo, content_flag } =
        traders_hub;
    const { is_landing_company_loaded, is_eu, has_maltainvest_account, real_account_creation_unlock_date } = client;

    const { setShouldShowCooldownModal, openRealAccountSignup } = ui;

    const low_risk_cr_non_eu = content_flag === ContentFlag.LOW_RISK_CR_NON_EU;

    const low_risk_cr_eu = content_flag === ContentFlag.LOW_RISK_CR_EU;

    const high_risk_cr = content_flag === ContentFlag.HIGH_RISK_CR;

    const cr_demo = content_flag === ContentFlag.CR_DEMO;

    const OptionsTitle = () => {
        if ((low_risk_cr_non_eu || high_risk_cr || cr_demo) && !isMobile()) {
            return (
                <Text size='sm' line_height='m' weight='bold'>
                    <Localize i18n_default_text='Options & Multipliers' />
                </Text>
            );
        } else if ((low_risk_cr_eu || is_eu) && !isMobile()) {
            return (
                <Text size='sm' line_height='m' weight='bold' color='prominent'>
                    <Localize i18n_default_text='Multipliers' />
                </Text>
            );
        }
        return null;
    };

    return (
        <ListingContainer
            title={<OptionsTitle />}
            description={
                low_risk_cr_non_eu || high_risk_cr || cr_demo ? (
                    <Text size='xs' line_height='s'>
                        <Localize
                            i18n_default_text='Earn a range of payouts by correctly predicting market price movements with <0>options</0>, or get the
                    upside of CFDs without risking more than your initial stake with <1>multipliers</1>.'
                            components={[
                                <StaticUrl key={0} className='options' href='trade-types/options/' />,
                                <StaticUrl key={1} className='options' href='trade-types/multiplier/' />,
                            ]}
                        />
                    </Text>
                ) : (
                    <Text size='xs' line_height='s'>
                        <Localize
                            i18n_default_text='Get the upside of CFDs without risking more than your initial stake with <0>Multipliers</0>.'
                            components={[<StaticUrl key={0} className='options' href='trade-types/multiplier/' />]}
                        />
                    </Text>
                )
            }
            is_deriv_platform
        >
            {is_real && (no_CR_account || no_MF_account) && (
                <div className='full-row'>
                    <TradingAppCard
                        action_type='get'
                        availability='All'
                        clickable_icon
                        name={localize('Deriv account')}
                        description={localize('Get a real Deriv account, start trading and manage your funds.')}
                        icon='Options'
                        onAction={() => {
                            if (no_MF_account) {
                                if (real_account_creation_unlock_date) {
                                    setShouldShowCooldownModal(true);
                                } else {
                                    openRealAccountSignup('maltainvest');
                                }
                            } else {
                                openRealAccountSignup('svg');
                            }
                        }}
                    />
                </div>
            )}

            {is_landing_company_loaded ? (
                available_platforms.map((available_platform: BrandConfig, index: number) => (
                    <TradingAppCard
                        key={`trading_app_card_${available_platform.name}`}
                        {...available_platform}
                        clickable_icon
                        action_type={
                            is_demo || (!no_CR_account && !is_eu_user) || (has_maltainvest_account && is_eu_user)
                                ? 'trade'
                                : 'none'
                        }
                        is_deriv_platform
                        has_divider={(!is_eu_user || is_demo) && getHasDivider(index, available_platforms.length, 3)}
                    />
                ))
            ) : (
                <PlatformLoader />
            )}
        </ListingContainer>
    );
};

export default observer(OptionsAndMultipliersListing);

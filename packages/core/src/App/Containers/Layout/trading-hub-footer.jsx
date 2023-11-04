import classNames from 'classnames';
import PropTypes from 'prop-types';
import * as React from 'react';
import { withRouter } from 'react-router';
import NetworkStatus, {
    AccountLimits as AccountLimitsFooter,
    EndpointNote,
    GoToDeriv,
    HelpCentre,
    RegulatoryInformation,
    ResponsibleTrading,
    ToggleSettings,
    ToggleFullScreen,
    ToggleLanguageSettings,
} from 'App/Components/Layout/Footer';
import LiveChat from 'App/Components/Elements/LiveChat';
import { connect } from 'Stores/connect';
import ServerTime from '../server-time.jsx';
import { routes } from '@deriv/shared';
import DarkModeToggleIcon from 'Assets/SvgComponents/footer/ic-footer-light-theme.svg';
import LightModeToggleIcon from 'Assets/SvgComponents/footer/ic-footer-dark-theme.svg';
import { Popover } from '@deriv/components';
import { localize } from '@deriv/translations';

const FooterIconSeparator = () => <div className='footer-icon-separator' />;

const FooterExtensionRenderer = (footer_extension, idx) => {
    const { Component: FooterExtensionComponent } = footer_extension;
    return (
        <React.Fragment key={`footer-link-${footer_extension.position}-${idx}`}>
            {footer_extension.has_left_separator && <FooterIconSeparator />}
            <FooterExtensionComponent />
            {footer_extension.has_right_separator && <FooterIconSeparator />}
        </React.Fragment>
    );
};

const TradingHubFooter = ({
    current_language,
    enableApp,
    footer_extensions,
    is_app_disabled,
    is_eu,
    is_logged_in,
    is_route_modal_on,
    is_settings_modal_on,
    is_language_settings_modal_on,
    is_virtual,
    disableApp,
    landing_company_shortcode,
    toggleSettingsModal,
    toggleLanguageSettingsModal,
    settings_extension,
    setDarkMode,
    is_dark_mode,
    show_eu_related_content,
}) => {
    let footer_extensions_left = [];
    let footer_extensions_right = [];
    if (footer_extensions.filter) {
        footer_extensions_left = footer_extensions.filter(footer_extension => footer_extension.position === 'left');
        footer_extensions_right = footer_extensions.filter(footer_extension => footer_extension.position === 'right');
    }

    const changeTheme = () => {
        setDarkMode(!is_dark_mode);
    };

    const location = window.location.pathname;

    return (
        <footer
            className={classNames('footer', {
                'footer--is-disabled': is_app_disabled || is_route_modal_on,
            })}
        >
            {footer_extensions_left.length > 0 && (
                <div className='footer__links footer__links--left'>
                    {footer_extensions_left.map(FooterExtensionRenderer)}
                </div>
            )}
            <EndpointNote />
            <NetworkStatus />
            <FooterIconSeparator />
            <ServerTime />
            <FooterIconSeparator />
            <div className='footer__links'>
                {footer_extensions_right.map(FooterExtensionRenderer)}

                <LiveChat />
                <GoToDeriv />
                <ResponsibleTrading />
                {is_logged_in && <AccountLimitsFooter />}
                {is_logged_in && !is_virtual && (
                    <RegulatoryInformation
                        landing_company={landing_company_shortcode}
                        is_eu={is_eu}
                        show_eu_related_content={show_eu_related_content}
                    />
                )}
                <div className='footer__links--dark-mode'>
                    <Popover alignment='top' message={localize('Change theme')} zIndex={9999}>
                        {is_dark_mode ? (
                            <LightModeToggleIcon onClick={changeTheme} />
                        ) : (
                            <DarkModeToggleIcon onClick={changeTheme} />
                        )}
                    </Popover>
                </div>
                <FooterIconSeparator />
                <HelpCentre />
                {location === routes.trade && (
                    <ToggleSettings
                        is_settings_visible={is_settings_modal_on}
                        toggleSettings={toggleSettingsModal}
                        disableApp={disableApp}
                        enableApp={enableApp}
                        settings_extension={settings_extension}
                    />
                )}
                <ToggleLanguageSettings
                    is_settings_visible={is_language_settings_modal_on}
                    toggleSettings={toggleLanguageSettingsModal}
                    lang={current_language}
                />
                <ToggleFullScreen />
            </div>
        </footer>
    );
};

TradingHubFooter.propTypes = {
    current_language: PropTypes.string,
    is_app_disabled: PropTypes.bool,
    is_logged_in: PropTypes.bool,
    is_route_modal_on: PropTypes.bool,
    is_settings_modal_on: PropTypes.bool,
    is_language_settings_modal_on: PropTypes.bool,
    landing_company_shortcode: PropTypes.string,
    location: PropTypes.object,
    toggleSettingsModal: PropTypes.func,
    toggleLanguageSettingsModal: PropTypes.func,
    settings_extension: PropTypes.array,
    is_virtual: PropTypes.bool,
    is_eu: PropTypes.bool,
    disableApp: PropTypes.func,
    enableApp: PropTypes.func,
    footer_extensions: PropTypes.array,
    is_dark_mode: PropTypes.bool,
    setDarkMode: PropTypes.func,
    show_eu_related_content: PropTypes.bool,
};

export default withRouter(
    connect(({ client, common, ui, traders_hub }) => ({
        current_language: common.current_language,
        enableApp: ui.enableApp,
        footer_extensions: ui.footer_extensions,
        settings_extension: ui.settings_extension,
        is_app_disabled: ui.is_app_disabled,
        is_route_modal_on: ui.is_route_modal_on,
        is_logged_in: client.is_logged_in,
        is_eu: client.is_eu,
        is_loading: ui.is_loading,
        is_settings_modal_on: ui.is_settings_modal_on,
        is_language_settings_modal_on: ui.is_language_settings_modal_on,
        is_virtual: client.is_virtual,
        landing_company_shortcode: client.landing_company_shortcode,
        disableApp: ui.disableApp,
        toggleSettingsModal: ui.toggleSettingsModal,
        toggleLanguageSettingsModal: ui.toggleLanguageSettingsModal,
        is_dark_mode: ui.is_dark_mode_on,
        setDarkMode: ui.setDarkMode,
        show_eu_related_content: traders_hub.show_eu_related_content,
    }))(TradingHubFooter)
);

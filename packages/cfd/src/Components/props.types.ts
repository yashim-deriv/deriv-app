import { DetailsOfEachMT5Loginid } from '@deriv/api-types';
import { TCFDPasswordReset } from '../Containers/props.types';

export type TCFDPlatform = 'dxtrade' | 'mt5';

export type TCFDsPlatformType = 'dxtrade' | 'derivez' | 'mt5' | 'ctrader' | '';

export type TCFDAccountCopy = {
    text: string | undefined;
    className: string;
};

export type TDxtradeDesktopDownloadProps = {
    dxtrade_tokens: TCFDDashboardContainer['dxtrade_tokens'];
    is_demo: string;
};

export type TAccountIconValues = { [key: string]: string };

export type TSpecBoxProps = {
    value: string | undefined;
    is_bold?: boolean;
};

export type TPasswordBoxProps = {
    platform: string;
    onClick: () => void;
};

export type TType = {
    category: TCFDPasswordReset['account_group'];
    type: string;
    platform: string;
};

export type TCFDDashboardContainer = {
    platform: TCFDPlatform;
    active_index: number;
    is_dark_mode_on: boolean;
    dxtrade_tokens: {
        demo: string;
        real: string;
    };
    derivez_tokens: {
        demo: string;
        real: string;
    };
};

export type TCFDAccountCardActionProps = {
    button_label?: string | JSX.Element;
    handleClickSwitchAccount: () => void;
    has_real_account?: boolean;
    is_accounts_switcher_on?: boolean;
    is_button_primary?: boolean;
    is_disabled: boolean;
    is_virtual?: boolean;
    onSelectAccount: () => void;
    type: TType;
    platform: string;
    title: string;
    real_account_creation_unlock_date: string;
    setShouldShowCooldownModal: (value: boolean) => void;
};

export type TTradingPlatformAvailableAccount = {
    market_type: 'financial' | 'gaming' | 'all';
    name: string;
    requirements: {
        after_first_deposit: {
            financial_assessment: string[];
        };
        compliance: {
            mt5: string[];
            tax_information: string[];
        };
        signup: string[];
    };
    shortcode: 'bvi' | 'labuan' | 'maltainvest' | 'svg' | 'vanuatu';
    sub_account_type: string;
    account_type?: 'real' | 'demo';
    landing_company_short?: 'bvi' | 'labuan' | 'svg' | 'vanuatu';
};

export type TCardFlipStatus = {
    svg: boolean;
    bvi: boolean;
    labuan: boolean;
    vanuatu: boolean;
    maltainvest: boolean;
};

export type TClickableDescription = {
    type: 'text' | 'link';
    text: string;
};

export type TJurisdictionCardSectionTitleIndicators = {
    type: 'displayText' | 'displayIcons';
    display_text?: string;
    display_text_skin_color?: string;
};

export type TJurisdictionCardSection = {
    key: string;
    title: string;
    title_indicators?: TJurisdictionCardSectionTitleIndicators;
    description?: string;
    clickable_description?: Array<TClickableDescription>;
};

export type TJurisdictionCardVerificationStatus = 'Pending' | 'Verified' | 'Failed' | 'Default';

export type TJurisdictionCardItemVerificationItem =
    | 'document_number'
    | 'selfie'
    | 'identity_document'
    | 'name_and_address'
    | 'not_applicable';

export type TJurisdictionCardItemVerification = Array<TJurisdictionCardItemVerificationItem>;

export type TJurisdictionCardItems = {
    header: string;
    over_header?: string;
    synthetic_contents: TJurisdictionCardSection[];
    financial_contents: TJurisdictionCardSection[];
    swapfree_contents?: TJurisdictionCardSection[];
    is_over_header_available: boolean;
    synthetic_verification_docs?: TJurisdictionCardItemVerification;
    financial_verification_docs?: TJurisdictionCardItemVerification;
};

export type TJurisdictionVerificationSection = {
    icon: string;
    text: string;
};

export type TJurisdictionVerificationItems = {
    document_number?: TJurisdictionVerificationSection;
    selfie?: TJurisdictionVerificationSection;
    identity_document?: TJurisdictionVerificationSection;
    name_and_address?: TJurisdictionVerificationSection;
    not_applicable?: TJurisdictionVerificationSection;
};

type TJurisdictionVerificationColors = 'yellow' | 'red' | 'green';

export type TJurisdictionVerificationStatus = {
    icon: string;
    text: string;
    color: TJurisdictionVerificationColors;
};

export type TExistingData = DetailsOfEachMT5Loginid & DetailsOfEachMT5Loginid[];

export type TCFDAccountCard = {
    button_label?: string | JSX.Element;
    commission_message: string;
    descriptor: string;
    existing_accounts_data?: TExistingData | null;
    is_hovered?: boolean;
    has_banner?: boolean;
    has_cfd_account_error?: boolean;
    has_real_account?: boolean;
    is_accounts_switcher_on?: boolean;
    is_button_primary?: boolean;
    is_disabled: boolean;
    is_logged_in: boolean;
    is_virtual?: boolean;
    platform: string;
    specs?: { [key: string]: { key: () => string; value: () => string } };
    title: string;
    type: TType;
    onSelectAccount: () => void;
    onClickFund: (arg: DetailsOfEachMT5Loginid) => void;
    onPasswordManager: (
        arg1: string | undefined,
        arg2: string,
        group: TCFDPasswordReset['account_group'],
        arg4: string,
        arg5: string | undefined
    ) => void;
    toggleAccountsDialog?: (arg?: boolean) => void;
    toggleShouldShowRealAccountsList?: (arg?: boolean) => void;
};

export type TTradingPlatformAccounts = {
    account_id?: string;
    /**
     * Account type.
     */
    account_type?: 'demo' | 'real';
    /**
     * Balance of the DXTrade account.
     */
    balance?: number;
    /**
     * Residence of the DXTrade account.
     */
    country?: string;
    /**
     * Currency of the DXTrade account.
     */
    currency?: string;
    /**
     * Account balance, formatted to appropriate decimal places.
     */
    display_balance?: string;
    /**
     * Display login of DXTrade account.
     */
    display_login?: string;
    /**
     * Landing company shortcode of the DXTrade account.
     */
    landing_company_short?: 'bvi' | 'labuan' | 'malta' | 'maltainvest' | 'svg' | 'vanuatu';
    /**
     * Login of DXTrade account.
     */
    login?: string;
    /**
     * Market type
     */
    market_type?: 'financial' | 'synthetic' | 'all';
    /**
     * Name of trading platform.
     */
    platform?: 'dxtrade' | string;
};

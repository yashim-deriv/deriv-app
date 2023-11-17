const CONFIG_APP_ID_KEY = 'config.app_id';
const CONFIG_PLATFORM_KEY = 'config.platform';
const CONFIG_SERVER_URL_KEY = 'config.server_url';
const APP_LANGUAGE_KEY = 'i18n_language';

export const ENVIRONMENT_URL = {
    real: 'green.derivws.com',
    demo: 'blue.derivws.com',
} as const;

export const OFFICIAL_APP_ID = {
    'deriv.app': 16929,
    'app.deriv.com': 16929,
    'app.deriv.me': 1411,
    'app.deriv.be': 30767,
    'test-app.deriv.com': 51072,
    'bot.deriv.com': 29864,
    'staging-app.deriv.com': 16303,
    'staging-app.deriv.me': 1411,
    'staging-app.deriv.be': 31186,
    'staging-bot.deriv.com': 29934,
    'localhost.binary.sx': 36300,
    localhost: 36300,
} as const;

export const PLATFORM_APP_ID = {
    derivgo: 23789,
} as const;

export type Environment = keyof typeof ENVIRONMENT_URL;
type OfficialURL = keyof typeof OFFICIAL_APP_ID;
type Platform = keyof typeof PLATFORM_APP_ID;

/**
 * Gets the WebSocket URL based on the client loginid. Priority QA -> Real -> Demo (default).
 * @returns WebSocket URL
 */
export const getWebsocketEndpointURL = () => {
    const configServerURL = window.localStorage.getItem(CONFIG_SERVER_URL_KEY);
    if (configServerURL) return configServerURL;

    const searchParams = new URLSearchParams(window.location.search);
    const urlActiveLoginid = searchParams.get('acct1');

    const loginid = window.localStorage.getItem('active_loginid') || urlActiveLoginid;
    return ENVIRONMENT_URL[loginid && !/^VR/.test(loginid) ? 'real' : 'demo'];
};

/**
 * Get current app language from local storage. Fallbacks to english - EN.
 * @returns Two letter language code ISO 639-1 (EN, ES, PT)
 */
export const getAppLanguage = () => window.localStorage.getItem(APP_LANGUAGE_KEY) || 'EN';

/**
 * Get the app id based on the following priority: config.platform -> config.app_id -> domain app id.
 * Defaults to the official deriv-app app id.
 * @returns app_id
 */
export const getAppId = () => {
    const hostname = window.location.hostname;
    const configAppID = window.localStorage.getItem(CONFIG_APP_ID_KEY);
    const configPlatform = window.sessionStorage.getItem(CONFIG_PLATFORM_KEY) as Platform;
    const isBot = window.location.pathname.split('/')[2] === 'bot';

    if (configPlatform && PLATFORM_APP_ID[configPlatform]) return PLATFORM_APP_ID[configPlatform];

    if (configAppID) return configAppID;

    // Deriv Bot specific checks (since it is a path - /bot instead of a domain)
    if (/^staging-app\.deriv\.(com|me|be)$/i.test(hostname) && isBot) return 19112;
    if (/deriv\.(com|me|be)$/i.test(hostname) && isBot) return 19111;

    const domainAppId = OFFICIAL_APP_ID[hostname as OfficialURL];
    if (domainAppId) {
        return domainAppId;
    }

    return OFFICIAL_APP_ID['app.deriv.com'];
};

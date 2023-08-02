import i18n from './i18n-instance';
import {
    ALL_LANGUAGES,
    ALLOWED_LANGUAGES,
    DEFAULT_LANGUAGE,
    Language,
    STORE_LANGUAGE_KEY,
    Environment,
    LanguageData,
} from './config';

let temp_environment: Environment = 'production';

/**
 * Sets the current environment for the application. This function is used to synchronize
 * the environment variable with the state in the React life cycle and update the translation data accordingly.
 *
 * @param {Environment} env - The environment to be set. A string representing the application's environment.
 * @returns {void} This function does not return anything.
 */
export const setEnvironment = (env: Environment) => (temp_environment = env);

/**
 * Gets the current set language.
 * Do not use this in React components. Ideally everything in react React utilise
 * the useLanguageSettings() hook.
 *
 * @returns {string} The current language.
 */
export const getLanguage = () => i18n.language || getInitialLanguage(temp_environment);

/**
 * Gets the allowed languages based on the specified environment.
 *
 * @param {Environment} environment - The environment for which to retrieve the allowed languages.
 * @returns {Partial<LanguageData>} An object containing allowed languages as keys and their descriptions as values.
 */
export const getAllowedLanguages = (environment: Environment): Partial<LanguageData> => {
    switch (environment) {
        case 'production':
            return ALLOWED_LANGUAGES;
        case 'local':
        case 'staging':
        default:
            return ALL_LANGUAGES;
    }
};

/**
 * Checks if the specified language is available in the given environment.
 *
 * @param {string} lang - The language code to check for availability.
 * @param {Environment} environment - The environment in which the language availability is to be checked.
 * @returns {boolean} Returns true if the language is available; otherwise, returns false.
 */
export const isLanguageAvailable = (lang: string, environment: Environment) => {
    if (!lang) return false;

    const selected_language = lang.toUpperCase();
    const is_ach = selected_language === 'ACH';

    if (is_ach) return environment === 'staging' || environment === 'local';

    return Object.keys(getAllowedLanguages(environment)).includes(selected_language);
};

/**
 * Gets the initial language to be used in the application based on the specified environment.
 *
 * @param {Environment} environment - The environment for which to get the initial language.
 * @returns {string} The initial language code to be used in the application.
 */
export const getInitialLanguage = (environment: Environment) => {
    const url_params = new URLSearchParams(window.location.search);
    const query_lang = url_params.get('lang');
    const local_storage_language = localStorage.getItem(STORE_LANGUAGE_KEY);

    if (query_lang) {
        const query_lang_uppercase = query_lang.toUpperCase();
        if (isLanguageAvailable(query_lang_uppercase, environment)) {
            localStorage.setItem(STORE_LANGUAGE_KEY, query_lang_uppercase);
            return query_lang_uppercase;
        }
    }

    if (local_storage_language) {
        if (isLanguageAvailable(local_storage_language, environment)) {
            return local_storage_language;
        }
    }

    return DEFAULT_LANGUAGE;
};

/**
 * Loads Crowdin's in-context translation for the current language if it's 'ACH' (Acholi language).
 *
 * @param {Language} current_language - The current language selected.
 * @returns {void}
 */
export const loadIncontextTranslation = () => {
    const in_context_loaded = document.getElementById('in_context_crowdin');
    if (in_context_loaded) return;

    const jipt = document.createElement('script');
    jipt.id = 'in_context_crowdin';
    jipt.type = 'text/javascript';
    jipt.text = `
            var _jipt = []; _jipt.push(['project', 'deriv-app']);
            var crowdin = document.createElement("script");
            crowdin.setAttribute('src', '//cdn.crowdin.com/jipt/jipt.js');
            document.head.appendChild(crowdin);
        `;
    document.head.appendChild(jipt);
};

/**
 * Asynchronously loads the language JSON file for the specified language and adds it to the i18n resource bundles.
 *
 * @param {string} lang - The language code for which to load the JSON file.
 * @returns {Promise<void>} A promise that resolves when the JSON file is loaded and added to the i18n resource bundles,
 * or when it is not necessary to load the file (e.g., when the language is already available or is the default language).
 */
export const loadLanguageJson = async (lang: string) => {
    if (!i18n.hasResourceBundle(lang, 'translations') && lang.toUpperCase() !== DEFAULT_LANGUAGE) {
        const lang_json = await import(
            /* webpackChunkName: "[request]" */ `../translations/${lang.toLowerCase()}.json`
        );
        i18n.addResourceBundle(lang, 'translations', lang_json);
        document.documentElement.setAttribute('lang', lang);
    }
};

export const switchLanguage = async (
    lang: Language,
    environment: Environment,
    onChange?: (lang: Language) => void | Promise<void>
) => {
    if (!isLanguageAvailable(lang, environment)) return;
    await i18n.changeLanguage(lang, () => {
        localStorage.setItem(STORE_LANGUAGE_KEY, lang);
        if (typeof onChange === 'function') onChange(lang);
    });
};

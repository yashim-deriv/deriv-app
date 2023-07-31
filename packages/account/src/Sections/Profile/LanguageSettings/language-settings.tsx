import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DesktopWrapper } from '@deriv/components';
import { localize, getAllowedLanguages } from '@deriv/translations';
import FormSubHeader from 'Components/form-sub-header';
import { Formik, FormikHandlers, FormikHelpers, FormikValues } from 'formik';
import FormFooter from 'Components/form-footer';
import LanguageRadioButton from 'Components/language-settings';
import { observer, useStore } from '@deriv/stores';

const LanguageSettings = observer(() => {
    const { common } = useStore();
    const { changeSelectedLanguage, current_language, isCurrentLanguage } = common;
    const { i18n } = useTranslation();
    const allowed_language_keys: string[] = Object.keys(getAllowedLanguages());
    const initial_values = { language_code: current_language };
    return (
        <Formik
            initialValues={initial_values}
            onSubmit={async values => {
                const { language_code } = values;
                await changeSelectedLanguage(language_code);
                await i18n.changeLanguage?.(language_code);
            }}
        >
            {({ handleSubmit, setFieldValue, values }: FormikHandlers & FormikHelpers<FormikValues> & FormikValues) => {
                return (
                    <form onSubmit={handleSubmit} className='account-form account-form--language-settings'>
                        <div className='settings-language'>
                            <DesktopWrapper>
                                <FormSubHeader title={localize('Select Language')} />
                            </DesktopWrapper>
                            <div className='settings-language__language-container'>
                                {allowed_language_keys.map(language_key => {
                                    return (
                                        <LanguageRadioButton
                                            key={language_key}
                                            id={language_key}
                                            language_code={language_key}
                                            is_current_language={values.language_code === language_key}
                                            name='language-radio-group'
                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                                setFieldValue('language_code', event.target.value)
                                            }
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        <FormFooter>
                            <Button
                                className='account-form__footer-btn'
                                type='submit'
                                data-testid={'submit-button'}
                                has_effect
                                text={localize('Submit')}
                                large
                                primary
                                is_disabled={isCurrentLanguage(values.language_code)}
                            />
                        </FormFooter>
                    </form>
                );
            }}
        </Formik>
    );
});

export default LanguageSettings;

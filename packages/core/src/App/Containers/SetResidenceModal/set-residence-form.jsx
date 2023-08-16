import { Field } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import { Autocomplete, Text } from '@deriv/components';
import { localize } from '@deriv/translations';

const SetResidenceForm = ({
    class_prefix = 'set-residence',
    default_value,
    history_value,
    errors,
    onResidenceSelectionChanged,
    touched,
    setFieldTouched,
    setFieldValue,
    residence_list,
}) => {
    React.useEffect(() => {
        if (default_value) {
            setFieldTouched('residence', true);
            setFieldValue('residence', default_value, true);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className={`${class_prefix}__residence-selection`}>
            <Field name='residence'>
                {({ field }) => (
                    <React.Fragment>
                        <Autocomplete
                            {...field}
                            autoComplete='off'
                            input_id='dt_core_set-residence-form_signup-residence-select'
                            className={`${class_prefix}__residence-field`}
                            type='text'
                            label={localize('Country of residence')}
                            historyValue={history_value}
                            error={touched.residence && errors.residence}
                            required
                            list_items={residence_list}
                            onItemSelection={({ value, text }) => {
                                setFieldValue('residence', value ? text : '', true);
                                onResidenceSelectionChanged?.();
                            }}
                        />
                    </React.Fragment>
                )}
            </Field>
            {!errors?.residence?.length > 0 ? (
                <Text as='p' size='xxs' className='account-signup__subtext' color='less-prominent'>
                    {localize('Country of residence is where you currently live.')}
                </Text>
            ) : null}
        </div>
    );
};

SetResidenceForm.propTypes = {
    class_prefix: PropTypes.string,
    default_value: PropTypes.string,
    history_value: PropTypes.string,
    errors: PropTypes.object,
    onResidenceSelectionChanged: PropTypes.func,
    residence_list: PropTypes.arrayOf(PropTypes.object),
    setFieldTouched: PropTypes.func,
    setFieldValue: PropTypes.func,
    touched: PropTypes.object,
};

export default SetResidenceForm;

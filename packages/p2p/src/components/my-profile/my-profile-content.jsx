import classNames from 'classnames';
import React from 'react';
import { DesktopWrapper, MobileFullPageModal, MobileWrapper } from '@deriv/components';
import { observer } from 'mobx-react-lite';
import { localize } from 'Components/i18next';
import { my_profile_tabs } from 'Constants/my-profile-tabs';
import { useStores } from 'Stores';
import MyProfileForm from './my-profile-form';
import MyProfileStats from './my-profile-stats';
import PaymentMethods from './payment-methods';
import BlockUser from './block-user';
import { useModalManagerContext } from 'Components/modal-manager/modal-manager-context';

const MyProfileContent = () => {
    const { my_profile_store, general_store } = useStores();
    const { showModal } = useModalManagerContext() || {};

    if (my_profile_store.active_tab === my_profile_tabs.AD_TEMPLATE) {
        return <MyProfileForm />;
    } else if (my_profile_store.active_tab === my_profile_tabs.PAYMENT_METHODS) {
        return (
            <React.Fragment>
                <DesktopWrapper>
                    <PaymentMethods />
                </DesktopWrapper>
                <MobileWrapper>
                    <MobileFullPageModal
                        body_className={classNames('payment-methods-list__modal', {
                            'payment-methods-list__modal-add':
                                my_profile_store.selected_payment_method ||
                                my_profile_store.should_show_edit_payment_method_form,
                        })}
                        height_offset='80px'
                        is_modal_open
                        is_flex
                        page_header_className='buy-sell__modal-header'
                        page_header_text={localize('Add payment method')}
                        pageHeaderReturnFn={() => {
                            if (general_store.is_form_modified || my_profile_store.selected_payment_method.length > 0) {
                                if (my_profile_store.should_show_add_payment_method_form) {
                                    showModal({
                                        key: 'CancelAddPaymentMethodModal',
                                    });
                                }
                                if (my_profile_store.should_show_edit_payment_method_form) {
                                    showModal({
                                        key: 'CancelEditPaymentMethodModal',
                                    });
                                }
                            } else {
                                my_profile_store.hideAddPaymentMethodForm();
                                my_profile_store.setShouldShowEditPaymentMethodForm(false);
                            }
                        }}
                    >
                        <PaymentMethods />
                    </MobileFullPageModal>
                </MobileWrapper>
            </React.Fragment>
        );
    } else if (my_profile_store.active_tab === my_profile_tabs.MY_COUNTERPARTIES) {
        return <BlockUser />;
    }
    return <MyProfileStats />;
};

export default observer(MyProfileContent);

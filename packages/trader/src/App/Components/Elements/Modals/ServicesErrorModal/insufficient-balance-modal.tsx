import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Modal } from '@deriv/components';
import { routes, isMobile } from '@deriv/shared';
import { localize } from '@deriv/translations';

type TInsufficientBalanceModal = RouteComponentProps & {
    is_virtual?: boolean;
    is_visible: boolean;
    message: string;
    toggleModal: () => void;
};

const InsufficientBalanceModal = ({
    history,
    is_virtual,
    is_visible,
    message,
    toggleModal,
}: TInsufficientBalanceModal) => (
    <Modal
        id='dt_insufficient_balance_modal'
        is_open={is_visible}
        small
        is_vertical_centered={isMobile()}
        toggleModal={toggleModal}
        title={localize('Insufficient balance')}
    >
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
            {/* TODO: Add topping up mechanism for demo accounts after confirmation */}
            <Button
                has_effect
                text={is_virtual ? localize('OK') : localize('Deposit now')}
                onClick={() => {
                    if (!is_virtual) {
                        history?.push?.(routes.cashier_deposit);
                    } else {
                        toggleModal();
                    }
                }}
                primary
            />
        </Modal.Footer>
    </Modal>
);

export default withRouter(InsufficientBalanceModal);

import React from 'react';
import { useStores } from 'Stores';
import { ModalManagerContext } from './modal-manager-context';
import { isDesktop } from '@deriv/shared';

const ModalManagerContextProvider = props => {
    const [active_modal, setActiveModal] = React.useState({});
    const [previous_modal, setPreviousModal] = React.useState({});
    // for mobile, modals are stacked and not shown alternatingly one by one
    const [stacked_modal, setStackedModal] = React.useState({});
    const [is_modal_open, setIsModalOpen] = React.useState(false);
    const [modal_props, setModalProps] = React.useState(new Map());
    const { general_store } = useStores();
    const persisted_states = React.useRef({});

    /**
     * A `useState` wrapper that allows the local state to be persisted and restored if the modal is unmounted in place of another modal.
     * By default the local states are not saved when modal is unmounted using hideModal, but once `hideModal` is called with the setting `should_restore_local_state` to `true`,
     * local states will be saved and automatically restored when the modal is mounted back.
     *
     * @param {key} string - the key to specify when persisting the local state, by default you should specify the local state name
     * @param {default_state} - the value you want the state to be initially
     */
    const useSavedState = (key, default_state) => {
        const [saved_state, setSavedState] = React.useState(default_state);
        const saved_state_ref = React.useRef(saved_state);

        React.useEffect(() => {
            const persisted_state = persisted_states.current[active_modal.key];

            if (persisted_state) {
                if (persisted_state[key]) {
                    setSavedState(persisted_state[key]);
                }
            } else {
                persisted_states.current[active_modal.key] = {
                    [key]: default_state,
                };
            }

            return () => {
                if (persisted_states.current[active_modal.key]) {
                    persisted_states.current[active_modal.key][key] = saved_state_ref.current;
                }
            };
        }, []);

        React.useEffect(() => {
            saved_state_ref.current = saved_state;
        }, [saved_state]);

        return [saved_state, setSavedState];
    };

    /**
     * Sets the specified modals' props on mount or when the props passed to the hook has changed.
     *
     * Use this hook to declare the modals' props beforehand for cases when the props can't be passed/declared in stores.
     *
     * For instance, calling `showModal({key: ..., props: ... })` in a store action where the props can't be passed to the action, use this hook to pass the props beforehand
     * and simply call `showModal({key: ...})` without the need to specify the props, since its already passed using this hook to the modal manager.
     *
     * @param {Object|Object[]} modals - list of object modals to set props, each modal object must contain a 'key' attribute and 'props' attribute
     */
    const useRegisterModalProps = modals => {
        const registered_modals = React.useRef([]);

        const registerModals = React.useCallback(() => {
            if (Array.isArray(modals)) {
                modals.forEach(modal => {
                    registered_modals.current.push(modal);
                    setModalProps(modal_props.set(modal.key, modal.props));
                });
            } else {
                registered_modals.current.push(modals);
                setModalProps(modal_props.set(modals.key, modals.props));
            }
        }, [modals]);

        React.useEffect(() => {
            registerModals();
            return () => {
                registered_modals.current.forEach(registered_modal => {
                    modal_props.delete(registered_modal.key);
                });
                registered_modals.current = [];
            };
        }, [modals]);
    };

    /**
     * Checks if the current visible modal matches the specified modal key passed to the argument.
     * Can also be used to check for multiple modal keys.
     *
     * @param {...string} keys - the modal keys to check if the current visible modal matches it
     */
    const isCurrentModal = (...keys) => keys.includes(active_modal.key);

    const showModal = (modal, options = { should_stack_modal: false }) => {
        if (isDesktop() || options.should_stack_modal) {
            setPreviousModal(active_modal);
            setActiveModal(modal);
        } else if (Object.keys(active_modal).length === 0) {
            setActiveModal(modal);
        } else {
            setStackedModal(modal);
        }
        setIsModalOpen(true);
    };

    /**
     * Hides the current shown modal.
     * If a previous modal was present, by default the previous modal will be shown in-place of the current closed modal.
     * This option can be overriden by setting `should_hide_all_modals` to `true` in the `options` argument to close all modals instead.
     *
     * @param {Object} options - list of supported settings to tweak how modals should be hidden:
     * - **should_hide_all_modals**: `false` by default. If set to `true`, previous modal will not be shown and all modals are hidden.
     * - **should_save_form_history**: `false` by default. If set to `true`, form values in modals that has a form with `ModalForm` component
     * - **should_restore_local_state**: `false` by default. If set to `true`, local states declared with `useSavedState` will be persisted and restored once the modal is mounted.
     * will be saved when the modal is hidden and restored when modal is shown again.
     */
    const hideModal = (options = {}) => {
        const {
            should_save_form_history = false,
            should_hide_all_modals = false,
            should_restore_local_state = false,
        } = options;

        if (should_save_form_history) {
            general_store.saveFormState();
        } else {
            general_store.setSavedFormState(null);
            general_store.setFormikRef(null);
        }

        if (!should_restore_local_state) persisted_states.current = {};

        if (isDesktop()) {
            if (should_hide_all_modals) {
                setPreviousModal({});
                setActiveModal({});
                setIsModalOpen(false);
            } else if (previous_modal) {
                setActiveModal(previous_modal);
                setPreviousModal({});
            } else {
                setActiveModal({});
                setIsModalOpen(false);
            }
        } else if (Object.keys(stacked_modal).length !== 0) {
            if (should_hide_all_modals) {
                setActiveModal({});
                setIsModalOpen(false);
            }
            setStackedModal({});
        } else {
            setActiveModal({});
            setIsModalOpen(false);
        }
    };

    general_store.hideModal = hideModal;
    general_store.isCurrentModal = isCurrentModal;
    general_store.modal = active_modal;
    general_store.showModal = showModal;

    const state = {
        hideModal,
        is_modal_open,
        isCurrentModal,
        modal: active_modal,
        modal_props,
        previous_modal,
        stacked_modal,
        showModal,
        useRegisterModalProps,
        useSavedState,
    };

    general_store.showModal = showModal;
    general_store.hideModal = hideModal;
    general_store.modal = active_modal;

    return <ModalManagerContext.Provider value={state}>{props.children}</ModalManagerContext.Provider>;
};

export default ModalManagerContextProvider;

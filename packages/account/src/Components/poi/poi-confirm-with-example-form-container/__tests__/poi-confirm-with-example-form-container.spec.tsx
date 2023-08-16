import React from 'react';
import ReactDOM from 'react-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PoiConfirmWithExampleFormContainer from '../poi-confirm-with-example-form-container';

jest.mock('Assets/ic-poi-name-dob-example.svg', () => jest.fn(() => 'PoiNameDobExampleImage'));

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    isDesktop: jest.fn(() => true),
    isMobile: jest.fn(() => false),
    filterObjProperties: jest.fn(() => ({
        first_name: 'test first name',
        last_name: 'test last name',
        date_of_birth: '2003-08-02',
    })),
    toMoment: jest.fn(() => ({
        format: jest.fn(() => '2003-08-02'),
        subtract: jest.fn(),
    })),
    WS: {
        wait: jest.fn(() => Promise.resolve()),
        setSettings: jest.fn(() =>
            Promise.resolve({
                data: { error: '' },
            })
        ),
        authorized: {
            storage: {
                getSettings: jest.fn(() =>
                    Promise.resolve({
                        response: { error: '', get_settings: {} },
                    })
                ),
            },
        },
    },
}));

describe('<PoiConfirmWithExampleFormContainer/>', () => {
    beforeAll(() => {
        (ReactDOM.createPortal as jest.Mock) = jest.fn(element => element);
    });
    afterEach(() => {
        (ReactDOM.createPortal as jest.Mock).mockClear();
    });

    const mock_props = {
        account_settings: {},
        getChangeableFields: jest.fn(() => ['first_name', 'last_name', 'date_of_birth']),
        onFormConfirm: jest.fn(),
    };
    const clarification_message = /To avoid delays, enter your/;
    const checkbox_label =
        'I confirm that the name and date of birth above match my chosen identity document (see below)';

    it('should render PersonalDetailsForm with image and checkbox', async () => {
        render(<PoiConfirmWithExampleFormContainer {...mock_props} />);

        expect(await screen.findByText('PoiNameDobExampleImage')).toBeInTheDocument();
        expect(screen.getByText(clarification_message)).toBeInTheDocument();
        expect(screen.getByText(checkbox_label)).toBeInTheDocument();
        const checkbox_el: HTMLInputElement = screen.getByRole('checkbox');
        expect(checkbox_el.checked).toBeFalsy();

        const input_fields: HTMLInputElement[] = screen.getAllByRole('textbox');
        expect(input_fields.length).toBe(3);
        expect(input_fields[0].name).toBe('first_name');
        expect(input_fields[1].name).toBe('last_name');
        expect(input_fields[2].name).toBe('date_of_birth');
    });
    it('should change fields and trigger submit', async () => {
        render(<PoiConfirmWithExampleFormContainer {...mock_props} />);

        const [checkbox_el] = await screen.findAllByRole('checkbox');
        expect((checkbox_el as HTMLInputElement).checked).toBeFalsy();

        const input_fields: HTMLInputElement[] = screen.getAllByRole('textbox');
        const [first_name_input, last_name_input, dob_input] = input_fields;

        expect(first_name_input.value).toBe('test first name');
        expect(last_name_input.value).toBe('test last name');
        expect(dob_input.value).toBe('2003-08-02');

        userEvent.clear(first_name_input);
        userEvent.clear(last_name_input);
        userEvent.type(first_name_input, 'new test first name');
        userEvent.type(last_name_input, 'new test last name');

        await waitFor(() => {
            expect(first_name_input.value).toBe('new test first name');
            expect(last_name_input.value).toBe('new test last name');
        });

        const button_el = screen.getByRole('button');
        userEvent.click(button_el);

        await waitFor(() => {
            expect(mock_props.onFormConfirm).toHaveBeenCalled();
        });
    });
});

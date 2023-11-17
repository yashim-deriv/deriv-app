import { useCallback, useMemo } from 'react';
import { getActiveAuthTokenIDFromLocalStorage } from '@deriv/utils';
import { useStandaloneContext } from '../APIProvider';
import useQuery from '../useQuery';
import useInvalidateQuery from '../useInvalidateQuery';

/** A custom hook that authorize the user with the given token. If no token is given,
 * it will use the current token from localStorage.
 */
const useAuthorize = () => {
    const invalidate = useInvalidateQuery();
    const current_token = getActiveAuthTokenIDFromLocalStorage();
    const { handleSwitchAccount } = useStandaloneContext();

    const { data, ...rest } = useQuery('authorize', {
        payload: { authorize: current_token || '' },
        options: { enabled: Boolean(current_token) },
    });

    // Add additional information to the authorize response.
    const modified_authorize = useMemo(() => ({ ...data?.authorize }), [data?.authorize]);

    const switchAccount = useCallback(
        (loginid: string) => {
            handleSwitchAccount(loginid, () => invalidate('authorize'));
        },
        [handleSwitchAccount, invalidate]
    );

    return {
        /** The authorize response. */
        data: modified_authorize,
        /** Function to switch to another account */
        switchAccount,
        ...rest,
    };
};

export default useAuthorize;

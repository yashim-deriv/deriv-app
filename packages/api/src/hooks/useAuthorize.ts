import { useMemo } from 'react';
import { getActiveAuthTokenIDFromLocalStorage } from '@deriv/utils';
import { useQuery } from '@tanstack/react-query';
import { useStandaloneContext } from '../providers/StandaloneAPIProvider';
import { TSocketResponseData } from '../../types';

/** A custom hook that authorize the user with the given token. If no token is given,
 * it will use the current token from localStorage.
 */
const useAuthorize = () => {
    const current_token = getActiveAuthTokenIDFromLocalStorage();
    const { activeLoginid, switchAccount, derivAPI } = useStandaloneContext();

    const { data, ...rest } = useQuery<TSocketResponseData<'authorize'>>(
        ['authorize', activeLoginid],
        () => derivAPI?.send({ authorize: current_token || '' }),
        { enabled: !!current_token }
    );

    // const { data, ...rest } = useQuery('authorize', {
    //     payload: { authorize: current_token || '' },
    //     options: { enabled: Boolean(current_token) },
    // });

    // Add additional information to the authorize response.
    const modified_authorize = useMemo(() => ({ ...data?.authorize }), [data?.authorize]);

    return {
        /** The authorize response. */
        data: modified_authorize,
        /** Function to switch to another account */
        switchAccount,
        ...rest,
    };
};

export default useAuthorize;

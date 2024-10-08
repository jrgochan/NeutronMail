import { useContext } from 'react';

import type { Api } from '@proton/shared/lib/interfaces';

import ContextApi from '../containers/api/apiContext';

const useApi = (): Api => {
    return useContext(ContextApi);
};

export default useApi;

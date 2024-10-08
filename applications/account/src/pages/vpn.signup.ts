import { VPN_APP_NAME } from '@proton/shared/lib/constants';

import type { Parameters } from './interface';
import { getSignupDescription, getSignupTitle } from './interface';

const data = (): Parameters => ({
    title: getSignupTitle(VPN_APP_NAME),
    description: getSignupDescription(VPN_APP_NAME),
});

export default data;

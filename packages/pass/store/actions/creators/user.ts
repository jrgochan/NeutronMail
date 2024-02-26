import { createAction } from '@reduxjs/toolkit';

import { withCache } from '@proton/pass/store/actions/enhancers/cache';
import { withRequest, withRequestFailure, withRequestSuccess } from '@proton/pass/store/actions/enhancers/request';
import { userAccessRequest, userFeaturesRequest } from '@proton/pass/store/actions/requests';
import type { FeatureFlagState, HydratedAccessState } from '@proton/pass/store/reducers';
import type { MaybeNull } from '@proton/pass/types';
import { UNIX_HOUR } from '@proton/pass/utils/time/constants';
import type { Organization } from '@proton/shared/lib/interfaces';

export const getUserFeaturesIntent = createAction('user::features::get::intent', (userId: string) =>
    withRequest({ type: 'start', id: userFeaturesRequest(userId) })({ payload: {} })
);

export const getUserFeaturesSuccess = createAction(
    'user::features::get::success',
    withRequestSuccess((payload: FeatureFlagState) => withCache({ payload }), { maxAge: UNIX_HOUR / 2 })
);

export const getUserFeaturesFailure = createAction(
    'user::features::get::failure',
    withRequestFailure((error: unknown) => ({ payload: {}, error }))
);

export const getUserAccessIntent = createAction('user::access::get::intent', (userId: string) =>
    withRequest({ type: 'start', id: userAccessRequest(userId) })({ payload: {} })
);

export const getUserAccessSuccess = createAction(
    'user::access::get::success',
    withRequestSuccess(
        (
            payload: HydratedAccessState & {
                organization: MaybeNull<Organization>;
            }
        ) => withCache({ payload }),
        { maxAge: UNIX_HOUR / 2 }
    )
);

export const getUserAccessFailure = createAction(
    'user::access::get::failure',
    withRequestFailure((error: unknown) => ({ payload: {}, error }))
);

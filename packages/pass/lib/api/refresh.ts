import type { AuthSession } from '@proton/pass/lib/auth/session';
import { type ApiAuth, type ApiCallFn, AuthMode, type Maybe, type MaybePromise } from '@proton/pass/types';
import { asyncLock } from '@proton/pass/utils/fp/promises';
import { logger } from '@proton/pass/utils/logger';
import { setRefreshCookies as refreshTokens, setRefreshCookies } from '@proton/shared/lib/api/auth';
import { InactiveSessionError } from '@proton/shared/lib/api/helpers/errors';
import { retryHandler } from '@proton/shared/lib/api/helpers/retryHandler';
import type { RefreshSessionResponse } from '@proton/shared/lib/authentication/interface';
import { OFFLINE_RETRY_ATTEMPTS_MAX, OFFLINE_RETRY_DELAY, RETRY_ATTEMPTS_MAX } from '@proton/shared/lib/constants';
import { HTTP_ERROR_CODES } from '@proton/shared/lib/errors';
import { withAuthHeaders, withUIDHeaders } from '@proton/shared/lib/fetch/headers';
import { getDateHeader } from '@proton/shared/lib/fetch/helpers';
import { wait } from '@proton/shared/lib/helpers/promise';
import randomIntFromInterval from '@proton/utils/randomIntFromInterval';

type RefreshCookieResponse = { LocalID?: number; RefreshCounter: number; RefreshTime: number; UID: string };

export type RefreshSessionData = Pick<AuthSession, 'UID' | 'AccessToken' | 'RefreshToken' | 'RefreshTime' | 'cookies'>;
export type RefreshHandler = (response: Response) => Promise<void>;
export type OnRefreshCallback = (response: RefreshSessionData) => MaybePromise<void>;

export type DynamicRefreshResult =
    | { type: AuthMode.COOKIE; response: { json: () => Promise<RefreshCookieResponse> } }
    | { type: AuthMode.TOKEN; response: { json: () => Promise<RefreshSessionResponse> } };

type CreateRefreshHandlerOptions = {
    call: ApiCallFn;
    getAuth: () => Maybe<ApiAuth>;
    onRefresh: OnRefreshCallback;
};

/**
 * Handle refresh token. Happens when the access token has expired.
 * Multiple calls can fail, so this ensures the refresh route is called once.
 * Needs to re-handle errors here for that reason.
 */
const refresh = async (options: {
    getAuth: () => Maybe<ApiAuth>;
    call: ApiCallFn;
    attempt: number;
    maxAttempts: number;
}): Promise<DynamicRefreshResult> => {
    const { call, getAuth, attempt, maxAttempts } = options;
    const auth = getAuth();
    if (auth === undefined) throw InactiveSessionError();

    try {
        return {
            type: auth.type,
            response: await call(
                auth.type === AuthMode.COOKIE
                    ? withUIDHeaders(auth.UID, setRefreshCookies())
                    : withAuthHeaders(auth.UID, auth.AccessToken, refreshTokens({ RefreshToken: auth.RefreshToken }))
            ),
        };
    } catch (error: any) {
        if (attempt >= maxAttempts) throw error;

        const { status, name } = error;
        const next = (max: number) => refresh({ call, getAuth, attempt: attempt + 1, maxAttempts: max });

        if (['OfflineError', 'TimeoutError'].includes(name)) {
            if (attempt > OFFLINE_RETRY_ATTEMPTS_MAX) throw error;
            await wait(name === 'OfflineError' ? OFFLINE_RETRY_DELAY : 0);
            return next(OFFLINE_RETRY_ATTEMPTS_MAX);
        }

        if (status === HTTP_ERROR_CODES.TOO_MANY_REQUESTS) {
            await retryHandler(error);
            return next(maxAttempts);
        }

        throw error;
    }
};

export const refreshHandlerFactory = ({ call, getAuth, onRefresh }: CreateRefreshHandlerOptions) =>
    asyncLock<RefreshHandler>(
        async (response) => {
            const auth = getAuth();
            if (auth === undefined) throw InactiveSessionError();

            const responseDate = getDateHeader(response.headers);
            const lastRefreshDate = getAuth()?.RefreshTime;

            if (lastRefreshDate === undefined || +(responseDate ?? new Date()) > lastRefreshDate) {
                const result = await refresh({
                    call,
                    getAuth,
                    attempt: 1,
                    maxAttempts: RETRY_ATTEMPTS_MAX,
                });
                const RefreshTime = +(getDateHeader(response.headers) ?? new Date());

                const refreshData = await (async (): Promise<RefreshSessionData> => {
                    switch (result.type) {
                        case AuthMode.TOKEN: {
                            const { AccessToken, RefreshToken, UID } = await result.response.json();
                            return { UID, AccessToken, RefreshToken, RefreshTime };
                        }
                        case AuthMode.COOKIE: {
                            const { UID } = await result.response.json();
                            return { UID, AccessToken: '', RefreshToken: '', RefreshTime, cookies: true };
                        }
                    }
                })();

                logger.info('[API] Successfully refreshed session tokens');

                await onRefresh(refreshData);
                await wait(randomIntFromInterval(500, 2000));
            }
        },
        { key: () => getAuth()?.UID ?? '' }
    );

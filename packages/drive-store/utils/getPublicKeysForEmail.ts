import { getAllPublicKeys } from '@proton/shared/lib/api/keys';
import type { KEY_FLAG } from '@proton/shared/lib/constants';
import { API_CUSTOM_ERROR_CODES } from '@proton/shared/lib/errors';
import type { Api } from '@proton/shared/lib/interfaces';

type Key = {
    Flags: KEY_FLAG;
    PublicKey: string;
    Source: string;
};

const cache = new Map<string, string[]>();
/**
 * Retrieve all public keys for a specific user email.
 * We silence errors for address missing and external domain as we allow addition of exernal users.
 */
export const getPublicKeysForEmail = async (api: Api, email: string) => {
    const cached = cache.get(email);
    if (cached) {
        return cached;
    }
    return api<{ Address: { Keys: Key[] } }>({
        ...getAllPublicKeys({
            Email: email,
            InternalOnly: 1,
        }),
        silence: [API_CUSTOM_ERROR_CODES.KEY_GET_ADDRESS_MISSING, API_CUSTOM_ERROR_CODES.KEY_GET_DOMAIN_EXTERNAL],
    })
        .then(({ Address }) => {
            const keysMap = Address.Keys.map((key) => key.PublicKey);
            cache.set(email, keysMap);
            return keysMap;
        })
        .catch((error) => {
            if (
                error?.data?.Code === API_CUSTOM_ERROR_CODES.KEY_GET_ADDRESS_MISSING ||
                error?.data?.Code === API_CUSTOM_ERROR_CODES.KEY_GET_DOMAIN_EXTERNAL
            ) {
                return undefined;
            }
            throw error;
        });
};
export const getPrimaryPublicKeyForEmail = async (api: Api, email: string) =>
    getPublicKeysForEmail(api, email).then((PublicKeys) => PublicKeys?.[0]);

import { CryptoProxy, serverTime } from '@proton/crypto';
import type { KTBlobContent } from '@proton/key-transparency/lib';
import { commitSKLToLS, getKTLocalStorage } from '@proton/key-transparency/lib';
import { encodeBase64URL, stringToUint8Array, uint8ArrayToString } from '@proton/shared/lib/helpers/encoding';
import type { SaveSKLToLS } from '@proton/shared/lib/interfaces';

import { useConfig, useGetUser, useGetUserKeys } from '../../hooks';

/**
 * Generate a unique fake ID from an email address
 */
const generateID = async (userID: string, email: string) => {
    const digest = await CryptoProxy.computeHash({
        algorithm: 'SHA256',
        data: stringToUint8Array(`${userID}${email}`),
    });
    return encodeBase64URL(uint8ArrayToString(digest.slice(0, 64)));
};

const useSaveSKLToLS = () => {
    const getUser = useGetUser();
    const { APP_NAME: appName } = useConfig();
    const ktLSAPIPromise = getKTLocalStorage(appName);
    const getUserKeys = useGetUserKeys();

    const saveSKLToLS: SaveSKLToLS = async (
        email: string,
        data: string,
        revision: number,
        expectedMinEpochID: number,
        addressID?: string,
        isCatchall?: boolean
    ) => {
        const userID = (await getUser()).ID;
        // The fake address is generated just for matching purposes inside the stashedKeys
        // structure and to avoid writing the email in plaintext in localStorage
        const storedAddressID = addressID ?? (await generateID(userID, email));
        const ktLSAPI = await ktLSAPIPromise;
        const ktBlobContent: KTBlobContent = {
            creationTimestamp: +serverTime(),
            email,
            data,
            revision,
            expectedMinEpochID,
            isCatchall,
        };

        const userKeys = await getUserKeys();
        await commitSKLToLS(
            ktBlobContent,
            userKeys.map(({ privateKey }) => privateKey),
            ktLSAPI,
            userID,
            storedAddressID
        );
    };
    return saveSKLToLS;
};

export default useSaveSKLToLS;

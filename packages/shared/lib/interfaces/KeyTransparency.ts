import type { PrivateKeyReference, PublicKeyReference } from '@proton/crypto';
import type { Epoch, SelfAuditResult } from '@proton/key-transparency/lib';

import type { Address } from './Address';
import type { ProcessedApiKey } from './EncryptionPreferences';
import type { DecryptedAddressKey, DecryptedKey, KeyPair } from './Key';
import type { FetchedSignedKeyList, SignedKeyList } from './SignedKeyList';
import type { User } from './User';

export enum IGNORE_KT {
    NORMAL,
    EXTERNAL,
    CATCHALL,
}

export interface ProcessedAddressKey extends ProcessedApiKey {
    flags: number;
    publicKey: PublicKeyReference;
    primary: 1 | 0;
}

export interface KTLocalStorageAPI {
    getBlobs: () => Promise<string[]>;
    removeItem: (key: string) => Promise<void | undefined>;
    getItem: (key: string) => Promise<string | null | undefined>;
    setItem: (key: string, value: string) => Promise<void | undefined>;
}

export interface SelfAuditState {
    userKeys: KeyPair[];
    lastSelfAudit: SelfAuditResult | undefined;
    addresses: {
        address: Address;
        addressKeys: DecryptedAddressKey[];
    }[];
}

export interface KeyTransparencyState {
    selfAuditResult?: SelfAuditResult;
}

export type KeyTransparencyVerify = (
    address: Address,
    signedKeyList: SignedKeyList,
    publicKeys: PublicKeyReference[]
) => Promise<void>;
export type PreAuthKTVerify = (userKeys: DecryptedKey[]) => KeyTransparencyVerify;
export type KeyTransparencyCommit = (userKeys: DecryptedKey[]) => Promise<void>;

export interface PreAuthKTVerifier {
    preAuthKTVerify: PreAuthKTVerify;
    preAuthKTCommit: (userID: string) => Promise<void>;
}

export type VerifyOutboundPublicKeys = (
    email: string,
    /**
     * Optimisations for apps where users with external domains do not have valid keys (e.g. Mail)
     */
    skipVerificationOfExternalDomains: boolean,
    address: {
        keyList: ProcessedApiKey[];
        signedKeyList: FetchedSignedKeyList | null;
    },
    catchAll?: {
        keyList: ProcessedApiKey[];
        signedKeyList: FetchedSignedKeyList | null;
    }
) => Promise<{
    addressKTResult?: KeyTransparencyVerificationResult;
    catchAllKTResult?: KeyTransparencyVerificationResult;
}>;

export type SaveSKLToLS = (
    email: string,
    data: string,
    revision: number,
    expectedMinEpochID: number,
    addressID?: string,
    isCatchall?: boolean
) => Promise<void>;

export type KeyMigrationKTVerifier = (
    email: string,
    signedKeyList: Partial<FetchedSignedKeyList> | null | undefined
) => Promise<void>;

export enum KeyTransparencyActivation {
    DISABLED,
    LOG_ONLY,
    SHOW_UI,
}

export type GetLatestEpoch = (forceRefresh?: boolean) => Epoch;

export enum KT_VERIFICATION_STATUS {
    VERIFIED_KEYS,
    UNVERIFIED_KEYS,
    VERIFICATION_FAILED,
}

export interface KeyTransparencyVerificationResult {
    status: KT_VERIFICATION_STATUS;
    keysChangedRecently?: boolean;
}

export type UploadMissingSKL = (address: Address, epoch: Epoch, saveSKLToLS: SaveSKLToLS) => Promise<void>;

export type ResetSelfAudit = (user: User, keyPassword: string, addressesBeforeReset: Address[]) => Promise<void>;

export interface ResignSKLWithPrimaryKeyArguments {
    address: Address;
    newPrimaryKey: PrivateKeyReference;
    formerPrimaryKey: PublicKeyReference;
    userKeys: DecryptedKey[];
}

export type ResignSKLWithPrimaryKey = (args: ResignSKLWithPrimaryKeyArguments) => Promise<void>;

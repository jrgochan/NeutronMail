import { c } from 'ttag';

import {
    BRAND_NAME,
    CALENDAR_APP_NAME,
    CALENDAR_SHORT_APP_NAME,
    CONTACTS_SHORT_APP_NAME,
    DRIVE_APP_NAME,
    DRIVE_SHORT_APP_NAME,
    MAIL_APP_NAME,
    MAIL_SHORT_APP_NAME,
    PASS_APP_NAME,
    PASS_SHORT_APP_NAME,
    PLANS,
} from '@proton/shared/lib/constants';
import humanSize, { getSizeFormat } from '@proton/shared/lib/helpers/humanSize';
import type { FreePlanDefault, PlansMap } from '@proton/shared/lib/interfaces';
import { Audience } from '@proton/shared/lib/interfaces';

import type { PlanCardFeature, PlanCardFeatureDefinition } from './interface';

const getTb = (n: number) => {
    return `${n} ${getSizeFormat('TB', n)}`;
};

export const getFreeDriveStorageFeature = (freePlan: FreePlanDefault): PlanCardFeatureDefinition => {
    const totalStorageSize = humanSize({ bytes: freePlan.MaxDriveRewardSpace, fraction: 0 });
    return {
        text: c('storage_split: feature').t`Up to ${totalStorageSize} Drive storage`,
        tooltip: '',
        included: true,
        icon: 'storage',
    };
};

export const getFreeMailStorageFeature = (freePlan: FreePlanDefault): PlanCardFeatureDefinition => {
    const totalStorageSize = humanSize({ bytes: freePlan.MaxBaseRewardSpace, fraction: 0 });
    return {
        text: c('storage_split: feature').t`Up to ${totalStorageSize} Mail storage`,
        tooltip: c('storage_split: feature')
            .t`Storage for data generated by ${BRAND_NAME} ${MAIL_SHORT_APP_NAME}, ${CALENDAR_SHORT_APP_NAME}, ${CONTACTS_SHORT_APP_NAME}, and ${PASS_SHORT_APP_NAME}`,
        included: true,
        icon: 'storage',
    };
};

export const getStorageFeature = (
    bytes: number,
    options: {
        freePlan: FreePlanDefault;
        highlight?: boolean;
        boldStorageSize?: boolean;
        family?: boolean;
        visionary?: boolean;
        subtext?: boolean;
    }
): PlanCardFeatureDefinition => {
    const { highlight = false, boldStorageSize = false } = options;
    if (bytes === -1) {
        const freeBaseStorage = options.freePlan.MaxBaseRewardSpace;
        const freeDriveStorage = options.freePlan.MaxDriveRewardSpace;
        const driveStorageSize = humanSize({ bytes: freeDriveStorage, fraction: 0 });
        const baseStorageSize = humanSize({ bytes: freeBaseStorage, fraction: 0 });
        const totalStorageSize = humanSize({ bytes: freeDriveStorage + freeBaseStorage, fraction: 0 });
        return {
            text: c('new_plans: feature').t`Up to ${totalStorageSize} storage`,
            subtext: options.subtext
                ? `${baseStorageSize} ${MAIL_SHORT_APP_NAME} + ${driveStorageSize} ${DRIVE_SHORT_APP_NAME}`
                : undefined,
            included: true,
            icon: 'storage',
        };
    }

    // humanSize doesn't support TB and we don't want to add it yet because of "nice numbers" rounding issues.
    const humanReadableSize = options.visionary
        ? getTb(6)
        : options.family
          ? getTb(3)
          : humanSize({ bytes, fraction: 0 });

    const size = boldStorageSize ? <b key="bold-storage-size">{humanReadableSize}</b> : humanReadableSize;
    const tooltip = options.family
        ? c('new_plans: tooltip')
              .t`Storage space is shared between users across ${MAIL_APP_NAME}, ${CALENDAR_APP_NAME}, ${DRIVE_APP_NAME}, and ${PASS_APP_NAME}`
        : c('new_plans: tooltip')
              .t`Storage space is shared across ${MAIL_APP_NAME}, ${CALENDAR_APP_NAME}, ${DRIVE_APP_NAME}, and ${PASS_APP_NAME}`;

    return {
        text: c('new_plans: feature').jt`${size} storage`,
        subtext: options.subtext ? c('storage_split: info').t`For all ${BRAND_NAME} services` : undefined,
        tooltip,
        included: true,
        highlight,
        icon: 'storage',
    };
};

export const getStorageBoostFeature = (bundleStorage: string): PlanCardFeatureDefinition => {
    return {
        icon: 'storage',
        text: c('new_plans: Upsell attribute').t`Boost your storage space to ${bundleStorage} total`,
        included: true,
    };
};

export const getStorageBoostFeatureB2B = (bundleStorage: string): PlanCardFeatureDefinition => {
    return {
        icon: 'storage',
        text: c('new_plans: Upsell attribute').t`Boost your storage space to ${bundleStorage} per user`,
        included: true,
    };
};

export const getStorageFeatureB2B = (
    bytes: number,
    options: {
        highlight?: boolean;
        subtext?: boolean;
    }
): PlanCardFeatureDefinition => {
    const size = humanSize({ bytes, fraction: 0 });
    return {
        text: c('new_plans: feature').t`${size} storage per user`,
        tooltip: c('new_plans: tooltip')
            .t`Storage space is shared across ${MAIL_APP_NAME}, ${CALENDAR_APP_NAME}, and ${DRIVE_APP_NAME}. Administrators can allocate different storage amounts to users in their organization`,
        subtext: options.subtext ? c('storage_split: info').t`For all ${BRAND_NAME} services` : undefined,
        included: true,
        highlight: options.highlight,
        icon: 'storage',
    };
};

const getEndToEndEncryption = (): PlanCardFeatureDefinition => {
    return {
        text: c('new_plans: feature').t`End-to-end encryption`,
        included: true,
    };
};

export const getDriveAppFeature = (options?: { family?: boolean }): PlanCardFeatureDefinition => {
    return {
        text: DRIVE_APP_NAME,
        tooltip: options?.family
            ? c('new_plans: tooltip')
                  .t`Secure your files with encrypted cloud storage. Includes automatic sync, encrypted file sharing, and more.`
            : c('new_plans: tooltip')
                  .t`${DRIVE_APP_NAME}: Secure your files with encrypted cloud storage. Includes version history, encrypted file sharing, and more.`,
        included: true,
        icon: 'brand-proton-drive',
    };
};

const getShareFeature = (): PlanCardFeatureDefinition => {
    return {
        text: c('new_plans: feature').t`Share files and folders via link`,
        tooltip: c('new_plans: tooltip').t`Share your files or folders with anyone by using secure, shareable links`,
        included: true,
    };
};

const getAdvancedShareFeature = (): PlanCardFeatureDefinition => {
    return {
        text: c('new_plans: feature').t`Advanced sharing security`,
        tooltip: c('new_plans: tooltip')
            .t`Control access to your shared files by adding password protection and link expiration dates`,
        included: true,
    };
};

const getDocumentEditor = (): PlanCardFeatureDefinition => {
    return {
        text: c('new_plans: feature').t`Collaborative document editor`,
        included: true,
    };
};

export const getCollaborate = (): PlanCardFeatureDefinition => {
    return {
        text: c('new_plans: feature').t`Collaborate and share large files`,
        included: true,
    };
};

export const getStorage = (plansMap: PlansMap, freePlan: FreePlanDefault): PlanCardFeature => {
    return {
        name: 'storage',
        plans: {
            [PLANS.FREE]: getStorageFeature(-1, { subtext: true, freePlan }),
            [PLANS.BUNDLE]: getStorageFeature(plansMap[PLANS.BUNDLE]?.MaxSpace ?? 536870912000, {
                subtext: true,
                freePlan,
            }),
            [PLANS.MAIL]: getStorageFeature(plansMap[PLANS.MAIL]?.MaxSpace ?? 16106127360, { subtext: true, freePlan }),
            [PLANS.VPN]: getStorageFeature(-1, { subtext: true, freePlan }),
            [PLANS.DRIVE]: getStorageFeature(plansMap[PLANS.DRIVE]?.MaxSpace ?? 214748364800, {
                subtext: true,
                freePlan,
            }),
            [PLANS.PASS]: getStorageFeature(-1, { subtext: true, freePlan }),
            [PLANS.FAMILY]: getStorageFeature(plansMap[PLANS.FAMILY]?.MaxSpace ?? 2748779069440, {
                family: true,
                subtext: true,
                freePlan,
            }),
            [PLANS.MAIL_PRO]: getStorageFeatureB2B(plansMap[PLANS.MAIL_PRO]?.MaxSpace ?? 16106127360, {
                subtext: true,
            }),
            [PLANS.MAIL_BUSINESS]: getStorageFeatureB2B(plansMap[PLANS.MAIL_BUSINESS]?.MaxSpace ?? 53687091200, {
                subtext: true,
            }),
            [PLANS.BUNDLE_PRO]: getStorageFeatureB2B(plansMap[PLANS.BUNDLE_PRO]?.MaxSpace ?? 536870912000, {
                subtext: true,
            }),
            [PLANS.BUNDLE_PRO_2024]: getStorageFeatureB2B(plansMap[PLANS.BUNDLE_PRO_2024]?.MaxSpace ?? 536870912000, {
                subtext: true,
            }),
            [PLANS.PASS_PRO]: getStorageFeature(-1, { subtext: true, freePlan }),
            [PLANS.PASS_BUSINESS]: getStorageFeature(-1, { subtext: true, freePlan }),
            [PLANS.VPN_PRO]: null,
            [PLANS.VPN_BUSINESS]: null,
            [PLANS.WALLET]: null,
        },
    };
};

export const getDriveFeatures = (plansMap: PlansMap, freePlan: FreePlanDefault): PlanCardFeature[] => {
    return [
        getStorage(plansMap, freePlan),
        {
            name: 'encryption',
            plans: {
                [PLANS.FREE]: getEndToEndEncryption(),
                [PLANS.BUNDLE]: getEndToEndEncryption(),
                [PLANS.MAIL]: getEndToEndEncryption(),
                [PLANS.VPN]: getEndToEndEncryption(),
                [PLANS.DRIVE]: getEndToEndEncryption(),
                [PLANS.PASS]: getEndToEndEncryption(),
                [PLANS.FAMILY]: getEndToEndEncryption(),
                [PLANS.MAIL_PRO]: getEndToEndEncryption(),
                [PLANS.MAIL_BUSINESS]: getEndToEndEncryption(),
                [PLANS.BUNDLE_PRO]: getEndToEndEncryption(),
                [PLANS.BUNDLE_PRO_2024]: getEndToEndEncryption(),
                [PLANS.PASS_PRO]: getEndToEndEncryption(),
                [PLANS.PASS_BUSINESS]: getEndToEndEncryption(),
                [PLANS.VPN_PRO]: null,
                [PLANS.VPN_BUSINESS]: null,
                [PLANS.WALLET]: null,
            },
        },
        {
            name: 'share',
            plans: {
                [PLANS.FREE]: getShareFeature(),
                [PLANS.BUNDLE]: getShareFeature(),
                [PLANS.MAIL]: getShareFeature(),
                [PLANS.VPN]: getShareFeature(),
                [PLANS.DRIVE]: getShareFeature(),
                [PLANS.PASS]: getShareFeature(),
                [PLANS.FAMILY]: getShareFeature(),
                [PLANS.MAIL_PRO]: getShareFeature(),
                [PLANS.MAIL_BUSINESS]: getShareFeature(),
                [PLANS.BUNDLE_PRO]: getShareFeature(),
                [PLANS.BUNDLE_PRO_2024]: getShareFeature(),
                [PLANS.PASS_PRO]: getShareFeature(),
                [PLANS.PASS_BUSINESS]: getShareFeature(),
                [PLANS.VPN_PRO]: null,
                [PLANS.VPN_BUSINESS]: null,
                [PLANS.WALLET]: null,
            },
        },
        {
            name: 'advanced-share',
            plans: {
                [PLANS.FREE]: getAdvancedShareFeature(),
                [PLANS.BUNDLE]: getAdvancedShareFeature(),
                [PLANS.MAIL]: getAdvancedShareFeature(),
                [PLANS.VPN]: getAdvancedShareFeature(),
                [PLANS.DRIVE]: getAdvancedShareFeature(),
                [PLANS.PASS]: getAdvancedShareFeature(),
                [PLANS.FAMILY]: getAdvancedShareFeature(),
                [PLANS.MAIL_PRO]: getAdvancedShareFeature(),
                [PLANS.MAIL_BUSINESS]: getAdvancedShareFeature(),
                [PLANS.BUNDLE_PRO]: getAdvancedShareFeature(),
                [PLANS.BUNDLE_PRO_2024]: getAdvancedShareFeature(),
                [PLANS.PASS_PRO]: getAdvancedShareFeature(),
                [PLANS.PASS_BUSINESS]: getAdvancedShareFeature(),
                [PLANS.VPN_PRO]: null,
                [PLANS.VPN_BUSINESS]: null,
                [PLANS.WALLET]: null,
            },
        },
        {
            name: 'document-editor',
            target: Audience.B2B,
            plans: {
                [PLANS.FREE]: getDocumentEditor(),
                [PLANS.BUNDLE]: getDocumentEditor(),
                [PLANS.MAIL]: getDocumentEditor(),
                [PLANS.VPN]: getDocumentEditor(),
                [PLANS.DRIVE]: getDocumentEditor(),
                [PLANS.PASS]: getDocumentEditor(),
                [PLANS.FAMILY]: getDocumentEditor(),
                [PLANS.MAIL_PRO]: getDocumentEditor(),
                [PLANS.MAIL_BUSINESS]: getDocumentEditor(),
                [PLANS.BUNDLE_PRO]: getDocumentEditor(),
                [PLANS.BUNDLE_PRO_2024]: getDocumentEditor(),
                [PLANS.PASS_PRO]: getDocumentEditor(),
                [PLANS.PASS_BUSINESS]: getDocumentEditor(),
                [PLANS.VPN_PRO]: null,
                [PLANS.VPN_BUSINESS]: null,
                [PLANS.WALLET]: null,
            },
        },
    ];
};

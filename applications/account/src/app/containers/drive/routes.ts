import { c } from 'ttag';

import type { SectionConfig } from '@proton/components';
import type { APP_NAMES } from '@proton/shared/lib/constants';
import { APPS, BRAND_NAME, DRIVE_APP_NAME } from '@proton/shared/lib/constants';

export const getDriveAppRoutes = ({ app }: { app: APP_NAMES }) => {
    return <const>{
        available: app === APPS.PROTONDRIVE,
        header: DRIVE_APP_NAME,
        routes: {
            revisions: <SectionConfig>{
                text: c('Title').t`Version history`,
                to: '/version-history',
                icon: 'clock-rotate-left',
                description: c('Info')
                    .t`To ensure you don’t lose important data, ${DRIVE_APP_NAME} saves older versions of your files as you and your collaborators make changes. Select how long ${BRAND_NAME} should keep previous versions.`,
                subsections: [
                    {
                        id: 'history',
                    },
                ],
            },
        },
    };
};

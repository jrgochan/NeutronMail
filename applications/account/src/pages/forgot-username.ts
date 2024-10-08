import { c } from 'ttag';

import { BRAND_NAME, CALENDAR_SHORT_APP_NAME, DRIVE_SHORT_APP_NAME, MAIL_APP_NAME } from '@proton/shared/lib/constants';

import type { Parameters } from './interface';

const data = (): Parameters => ({
    title: c('Metadata title').t`Find your ${BRAND_NAME} Account username`,
    description: c('Metadata title')
        .t`Forgot your ${BRAND_NAME} Account username? Find it using your recovery email or phone number and regain access to your ${MAIL_APP_NAME}, ${DRIVE_SHORT_APP_NAME}, ${CALENDAR_SHORT_APP_NAME}, and more.`,
});

export default data;

import { c } from 'ttag';

import type { APP_NAMES } from '@proton/shared/lib/constants';
import { APPS } from '@proton/shared/lib/constants';

import { SettingsLink, Time } from '../../components';
import { useConfig, useSubscription } from '../../hooks';
import { REACTIVATE_SOURCE } from '../payments/subscription';
import { subscriptionExpires } from '../payments/subscription/helpers';
import TopBanner from './TopBanner';

const SubscriptionEndsBanner = () => {
    const { APP_NAME } = useConfig();
    const [subscription] = useSubscription();
    const { subscriptionExpiresSoon, planName, expirationDate } = subscriptionExpires(subscription!);

    if (!([APPS.PROTONACCOUNT, APPS.PROTONVPN_SETTINGS] as APP_NAMES[]).includes(APP_NAME)) {
        return null;
    }

    if (!subscriptionExpiresSoon || !subscription) {
        return null;
    }

    const byDate = (
        <Time format="PP" key="subscription-end">
            {expirationDate}
        </Time>
    );

    const reactivateLink = (
        <SettingsLink
            data-testid="reactivate-link"
            key="reactivate-subscription"
            className="color-inherit"
            path={`/dashboard?source=${REACTIVATE_SOURCE.banners}#your-subscriptions`}
        >{c('Link').t`Reactivate now`}</SettingsLink>
    );

    return (
        <TopBanner className="bg-danger">
            {c('Info')
                .jt`Subscription ending: Reactivate by ${byDate} to keep your ${planName} benefits. ${reactivateLink}`}
        </TopBanner>
    );
};

export default SubscriptionEndsBanner;

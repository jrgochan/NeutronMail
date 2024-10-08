import { c } from 'ttag';

import { MAIL_APP_NAME, PLANS, PLAN_NAMES } from '@proton/shared/lib/constants';
import humanSize from '@proton/shared/lib/helpers/humanSize';
import { hasCancellablePlan } from '@proton/shared/lib/helpers/subscription';
import type { SubscriptionModel, SubscriptionPlan, UserModel } from '@proton/shared/lib/interfaces';

import type {
    ConfirmationModal,
    PlanConfig,
    PlanConfigFeatures,
    PlanConfigStorage,
    PlanConfigTestimonial,
} from '../interface';
import {
    getDefaultConfirmationModal,
    getDefaultGBStorageWarning,
    getDefaultReminder,
    getDefaultTestimonial,
} from './b2cCommonConfig';

export const getMailPlusConfig = (
    subscription: SubscriptionModel,
    user: UserModel,
    plan: SubscriptionPlan & { Name: PLANS }
): PlanConfig => {
    const currentPlan = PLANS.MAIL;
    const planName = PLAN_NAMES[currentPlan];
    const planMaxSpace = humanSize({ bytes: plan.MaxSpace, unit: 'GB', fraction: 0 });

    const reminder = getDefaultReminder(planName);
    const testimonials: PlanConfigTestimonial = getDefaultTestimonial();

    const features: PlanConfigFeatures = {
        title: c('Subscription reminder').t`Premium productivity features`,
        description: c('Subscription reminder')
            .t`${planName} goes beyond the basics to help you be more productive, organized, and in control of your inbox, email identity, and more.`,
        features: [
            {
                icon: 'storage',
                text: c('Subscription reminder').t`${planMaxSpace} total storage`,
            },
            {
                icon: 'gift',
                text: c('Subscription reminder').t`Yearly free storage bonuses`,
            },
            {
                icon: 'envelopes',
                text: c('Subscription reminder').t`10 email addresses`,
            },
            {
                icon: 'folders',
                text: c('Subscription reminder').t`Unlimited folders, labels and filters`,
            },
            {
                icon: 'globe',
                text: c('Subscription reminder').t`Your own custom email domain`,
            },
            {
                icon: 'calendar-grid',
                text: c('Subscription reminder').t`Calendar sharing`,
            },
            {
                icon: 'at',
                text: c('Subscription reminder').t`Your own short @pm.me email alias`,
            },
            {
                icon: 'clock-paper-plane',
                text: c('Subscription reminder').t`Custom schedule send and snooze times`,
            },
            {
                icon: 'tv',
                text: c('Subscription reminder').t`${MAIL_APP_NAME} desktop app`,
            },
            {
                icon: 'life-ring',
                text: c('Subscription reminder').t`Priority support`,
            },
        ],
    };

    const cancellablePlan = hasCancellablePlan(subscription, user);
    const storage: PlanConfigStorage = getDefaultGBStorageWarning(planName, planMaxSpace, cancellablePlan);
    const confirmationModal: ConfirmationModal = getDefaultConfirmationModal(subscription, planName, cancellablePlan);

    return {
        planName,
        reminder,
        testimonials,
        features,
        storage,
        confirmationModal,
        plan: currentPlan,
    };
};

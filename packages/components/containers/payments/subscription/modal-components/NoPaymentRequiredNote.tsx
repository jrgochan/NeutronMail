import { c } from 'ttag';

import { getPlanTitle, isTrial } from '@proton/shared/lib/helpers/subscription';
import type { SubscriptionCheckResponse, SubscriptionModel } from '@proton/shared/lib/interfaces';

interface Props {
    amountDue: number;
    creditsRemaining: number;
    checkResult: SubscriptionCheckResponse | undefined;
    subscription: SubscriptionModel | undefined;
    hasPaymentMethod: boolean;
}

export const NoPaymentRequiredNote = ({
    amountDue,
    checkResult,
    creditsRemaining,
    subscription,
    hasPaymentMethod,
}: Props) => {
    const trial = isTrial(subscription);
    const planTitle = getPlanTitle(subscription);

    return (
        <div className={amountDue || !checkResult ? 'hidden' : undefined}>
            {!trial && (
                <>
                    <div className="mb-4">{c('Info').t`No payment is required at this time.`}</div>
                    {checkResult?.Credit && creditsRemaining ? (
                        <div className="mb-4">{c('Info')
                            .t`Please note that upon clicking the Confirm button, your account will have ${creditsRemaining} credits remaining.`}</div>
                    ) : null}
                </>
            )}
            {trial && !hasPaymentMethod && (
                <div className="mb-4">
                    {c('Info')
                        .t`You have a trial ${planTitle} subscription. If you would like to continue your subscription after the trial period, please add a payment method.`}
                </div>
            )}
            {trial && hasPaymentMethod && (
                <div className="mb-4">
                    {c('Info')
                        .t`You have a trial ${planTitle} subscription. No payment is required at this time. Your subscription will be automatically renewed at the end of the trial period.`}
                </div>
            )}
        </div>
    );
};

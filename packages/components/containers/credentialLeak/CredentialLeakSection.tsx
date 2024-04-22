import { useEffect, useState } from 'react';

import { c } from 'ttag';

import { Href } from '@proton/atoms/Href';
import {
    GenericError,
    Icon,
    Loader,
    SUBSCRIPTION_STEPS,
    Toggle,
    useErrorHandler,
    useModalStateObject,
    useSubscriptionModal,
    useUser,
    useUserSettings,
} from '@proton/components';
import { useApi, useNotifications } from '@proton/components/hooks';
import { useLoading } from '@proton/hooks';
import { getBreaches, updateBreachState } from '@proton/shared/lib/api/breaches';
import { getApiError } from '@proton/shared/lib/api/helpers/apiErrorHelper';
import { disableBreachAlert, enableBreachAlert } from '@proton/shared/lib/api/settings';
import { BRAND_NAME, DARK_WEB_MONITORING_NAME } from '@proton/shared/lib/constants';
import { getKnowledgeBaseUrl } from '@proton/shared/lib/helpers/url';
import freeUserBreachImg from '@proton/styles/assets/img/breach-alert/img-breaches-found.svg';
import freeUserNoBreachImg from '@proton/styles/assets/img/breach-alert/img-no-breaches-found-inactive.svg';
import clsx from '@proton/utils/clsx';
import noop from '@proton/utils/noop';

import { useActiveBreakpoint } from '../../hooks';
import {
    SettingsLayout,
    SettingsLayoutLeft,
    SettingsLayoutRight,
    SettingsParagraph,
    SettingsSectionWide,
} from '../account';
import BreachInformationCard from './BreachInformationCard';
import BreachModal from './BreachModal';
import BreachesList from './BreachesList';
import EmptyBreachListCard from './EmptyBreachListCard';
import NoBreachesView from './NoBreachesView';
import { BREACH_API_ERROR, getEnableString, toCamelCase } from './helpers';
import { BREACH_STATE, ListType } from './models';
import { useBreaches } from './useBreaches';

const LIST_STATES_MAP: Record<ListType, BREACH_STATE[]> = {
    open: [BREACH_STATE.UNREAD, BREACH_STATE.READ],
    resolved: [BREACH_STATE.RESOLVED],
};

const CredentialLeakSection = () => {
    const handleError = useErrorHandler();
    const [loading, withLoading] = useLoading();
    const [breachesLoading] = useLoading();
    const [toggleLoading, withToggleLoading] = useLoading();
    const [openSubscriptionModal] = useSubscriptionModal();
    const api = useApi();
    const [user] = useUser();
    const [userSettings] = useUserSettings();
    const { createNotification } = useNotifications();
    const breachModal = useModalStateObject();
    const { viewportWidth } = useActiveBreakpoint();
    const { breaches: breachList, actions } = useBreaches();

    const [selectedBreachID, setSelectedBreachID] = useState<string | null>(null);
    const [listType, setListType] = useState<ListType>('open');
    const [total, setTotal] = useState<number | null>(null);
    const [error, setError] = useState<{ message: string } | null>(null);
    const [openModal, setOpenModal] = useState<boolean>(false);
    // TODO: change nums to constants
    const [hasAlertsEnabled, setHasAlertsEnabled] = useState<boolean>(
        userSettings.BreachAlerts.Eligible === 1 && userSettings.BreachAlerts.Value === 1
    );
    const isPaidUser = user.isPaid;

    //TODO: update source of metrics
    const metrics = {
        source: 'plans',
    } as const;

    useEffect(() => {
        const fetchLeakData = async () => {
            try {
                const { Breaches, Samples, IsEligible, Count } = await api(getBreaches());

                if (IsEligible) {
                    const breaches = toCamelCase(Breaches);
                    actions.load(breaches);
                } else {
                    const fetchedSample = toCamelCase(Samples);
                    actions.load(fetchedSample);
                }
                setTotal(Count);
            } catch (e) {
                const { message, code } = getApiError(e);
                if (code === BREACH_API_ERROR.GENERIC) {
                    setError({ message: message });
                    return;
                } else {
                    handleError(e);
                }
            }
        };
        withLoading(fetchLeakData()).catch(noop);
    }, [hasAlertsEnabled]);

    useEffect(() => {
        const handleBreachModal = () => {
            if (!loading && viewportWidth['<=medium'] && openModal) {
                breachModal.openModal(true);
                setOpenModal(!openModal);
            }
        };
        handleBreachModal();
    }, [loading, openModal, viewportWidth]);

    const viewingBreachList = breachList.filter((breach) => LIST_STATES_MAP[listType].includes(breach.resolvedState));
    const viewingBreach = viewingBreachList.find((b) => b.id === selectedBreachID) ?? viewingBreachList[0];

    const markAsResolvedBreach = async () => {
        if (!viewingBreach) {
            return;
        }
        try {
            actions.resolve(viewingBreach);
            await api(
                updateBreachState({
                    ID: viewingBreach.id,
                    State: BREACH_STATE.RESOLVED,
                })
            );
        } catch (e) {
            handleError(e);
            actions.open(viewingBreach);
        }
    };

    const markAsOpenBreach = async () => {
        if (!viewingBreach) {
            return;
        }
        try {
            actions.open(viewingBreach);
            await api(
                updateBreachState({
                    ID: viewingBreach.id,
                    State: BREACH_STATE.READ,
                })
            );
        } catch (e) {
            handleError(e);
            if (viewingBreach.resolvedState === BREACH_STATE.RESOLVED) {
                actions.resolve(viewingBreach);
            }
        }
    };

    const handleEnableBreachAlertToggle = async (newToggleState: boolean) => {
        try {
            const [action, notification] = newToggleState
                ? [enableBreachAlert, c('Notification').t`Dark Web Monitoring has been enabled`]
                : [disableBreachAlert, c('Notification').t`Dark Web Monitoring has been disabled`];

            await withToggleLoading(api(action()));
            createNotification({ text: notification });
            setHasAlertsEnabled(newToggleState);
        } catch (e) {
            handleError(e);
        }
    };

    const handleUpgrade = () => {
        openSubscriptionModal({
            step: SUBSCRIPTION_STEPS.PLAN_SELECTION,
            metrics,
            mode: 'upsell-modal',
            onSubscribed: () => {
                handleEnableBreachAlertToggle(true);
                return;
            },
        });
    };

    useEffect(() => {
        if (viewingBreach && viewingBreach.resolvedState === BREACH_STATE.UNREAD) {
            markAsOpenBreach();
        }
    }, [viewingBreach]);

    const href = getKnowledgeBaseUrl('/dark-web-monitoring');
    // translator: full sentence is: We monitor the dark web for instances where your personal information (such as an email address or password used on a third-party site) is leaked or compromised. <How does monitoring work?>
    const dataBreachLink = (
        <Href key={'breach'} className="inline-block" href={href}>{c('Link').t`How does monitoring work?`}</Href>
    );

    const breachAlertIntroText = (
        <SettingsParagraph>
            {
                // translator: full sentence is: We monitor the dark web for instances where your personal information (such as an email address or password used on a third-party site) is leaked or compromised. <How does monitoring work?>
                c('Info')
                    .jt`We monitor the dark web for instances where your personal information (such as an email address or password used on a third-party site) is leaked or compromised.`
            }{' '}
            {dataBreachLink}
        </SettingsParagraph>
    );

    const breachAlertInfoSharing = (
        <SettingsParagraph>
            {c('Info')
                .t`${BRAND_NAME} never shares your information with third parties. Data comes from ${BRAND_NAME}'s own analyses and Constella Intelligence.`}{' '}
            {
                // translator: full sentence is: Proton never shares your information with third parties. Data comes from Proton's own analyses and Constella Intelligence. Support for monitoring of custom domains and non-Proton email addresses is coming soon.
                c('Info')
                    .t`Support for monitoring of custom domains and non-${BRAND_NAME} email addresses is coming soon.`
            }
        </SettingsParagraph>
    );

    // translator: full sentence is: Get notified if your password or other personal data was leaked. <Learn more>
    const learnMoreLinkNoBreach = <Href href={href} className="inline-block">{c('Link').t`Learn more`}</Href>;

    // translator: full sentence is: Your information was found in at least one data breach. Turn on Dark Web Monitoring to view details and take action. <Learn more>
    const learnMoreLinkBreach = (
        <Href href={href} className="inline-block color-danger">{c('Link').t`Learn more`}</Href>
    );

    return (
        <>
            <SettingsSectionWide>
                {(() => {
                    if (error) {
                        return <GenericError className="text-center">{error.message}</GenericError>;
                    }
                    if (loading) {
                        return <Loader size="medium" />;
                    }

                    if (!isPaidUser) {
                        return (
                            <div className="flex flex-nowrap">
                                <div className="flex-1">
                                    {breachAlertIntroText}
                                    {total === 0 ? (
                                        <SettingsParagraph>
                                            {c('Info')
                                                .jt`Get notified if your password or other personal data was leaked. ${learnMoreLinkNoBreach}`}
                                        </SettingsParagraph>
                                    ) : (
                                        <SettingsParagraph>
                                            <div
                                                className="flex flex-nowrap color-danger p-4 rounded"
                                                style={{ 'background-color': 'var(--signal-danger-minor-2)' }}
                                            >
                                                <Icon
                                                    name="exclamation-circle-filled"
                                                    className="shrink-0 mt-0.5 mr-2"
                                                />
                                                <span className="flex-1">
                                                    {
                                                        // translator: full sentence is: Your information was found in at least one data breach. Turn on Dark Web Monitoring to view details and take action. <Learn more>
                                                        c('Security Center - Info')
                                                            .jt`Your information was found in at least one data breach. Turn on ${DARK_WEB_MONITORING_NAME} to view details and take action. ${learnMoreLinkBreach}`
                                                    }
                                                </span>
                                            </div>
                                        </SettingsParagraph>
                                    )}

                                    <SettingsLayout>
                                        <SettingsLayoutLeft>
                                            <label className="text-semibold" htmlFor="data-breach-toggle">
                                                <span className="mr-2">
                                                    {getEnableString(DARK_WEB_MONITORING_NAME)}
                                                </span>
                                            </label>
                                        </SettingsLayoutLeft>
                                        <SettingsLayoutRight isToggleContainer>
                                            <Toggle
                                                id="data-breach-toggle"
                                                disabled={false}
                                                checked={false}
                                                onClick={handleUpgrade}
                                            />
                                        </SettingsLayoutRight>
                                    </SettingsLayout>
                                </div>

                                <div className="hidden lg:flex">
                                    <img
                                        src={total === 0 ? freeUserNoBreachImg : freeUserBreachImg}
                                        alt=""
                                        width={300}
                                        className="m-auto"
                                    />
                                </div>
                            </div>
                        );
                    }

                    return (
                        <>
                            {breachAlertIntroText}
                            {breachAlertInfoSharing}

                            <SettingsLayout>
                                <SettingsLayoutLeft>
                                    <label className="text-semibold" htmlFor="data-breach-toggle">
                                        <span className="mr-2">{getEnableString(DARK_WEB_MONITORING_NAME)}</span>
                                    </label>
                                </SettingsLayoutLeft>
                                <SettingsLayoutRight isToggleContainer>
                                    <Toggle
                                        id="data-breach-toggle"
                                        disabled={false}
                                        checked={hasAlertsEnabled}
                                        loading={toggleLoading}
                                        onChange={({ target }) => {
                                            void handleEnableBreachAlertToggle(target.checked);
                                        }}
                                    />
                                </SettingsLayoutRight>
                            </SettingsLayout>
                            {hasAlertsEnabled &&
                                (total === 0 ? (
                                    <NoBreachesView />
                                ) : (
                                    <div
                                        className="flex flex-nowrap lg:flex-row w-full max-h-custom lg:max-h-custom"
                                        style={{ '--max-h-custom': '40vh', '--lg-max-h-custom': '90vh' }}
                                    >
                                        <BreachesList
                                            data={breachList}
                                            selectedID={selectedBreachID}
                                            onSelect={(id) => {
                                                setSelectedBreachID(id);
                                                setOpenModal(true);
                                            }}
                                            isPaidUser={isPaidUser}
                                            total={total}
                                            type={listType}
                                            onViewTypeChange={setListType}
                                        />
                                        {viewingBreachList.length === 0 && (
                                            <div
                                                className={clsx(
                                                    'flex relative w-full md:w-2/3',
                                                    viewportWidth['<=medium'] && 'hidden'
                                                )}
                                            >
                                                <EmptyBreachListCard listType={listType} />
                                            </div>
                                        )}
                                        {viewingBreach && (
                                            <div
                                                className={clsx(
                                                    'relative w-full md:w-2/3',
                                                    viewportWidth['<=medium'] && 'hidden'
                                                )}
                                            >
                                                <BreachInformationCard
                                                    paid={isPaidUser}
                                                    breachData={viewingBreach}
                                                    onResolve={markAsResolvedBreach}
                                                    onOpen={markAsOpenBreach}
                                                    isMutating={breachesLoading}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </>
                    );
                })()}
            </SettingsSectionWide>
            {breachModal.render && (
                <BreachModal
                    modalProps={breachModal.modalProps}
                    breachData={viewingBreach}
                    onResolve={() => {
                        if (viewingBreach) {
                            actions.resolve(viewingBreach);
                        }
                    }}
                />
            )}
        </>
    );
};

export default CredentialLeakSection;

import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { Icon, useNotifications } from '@proton/components';
import { getBlockedIncomingDefaultByAddress } from '@proton/shared/lib/helpers/incomingDefaults';
import { getSender } from '@proton/shared/lib/mail/messages';

import { useMailDispatch } from 'proton-mail/store/hooks';

import {
    useIncomingDefaultsAddresses,
    useIncomingDefaultsStatus,
} from '../../../hooks/incomingDefaults/useIncomingDefaults';
import { remove } from '../../../store/incomingDefaults/incomingDefaultsActions';
import type { MessageState } from '../../../store/messages/messagesTypes';

interface Props {
    message: MessageState;
}

const ExtraBlockedSender = ({ message }: Props) => {
    const dispatch = useMailDispatch();
    const { createNotification } = useNotifications();

    const senderAddress = getSender(message.data)?.Address;

    const incomingDefaultsAddresses = useIncomingDefaultsAddresses();

    const incomingDefaultsStatus = useIncomingDefaultsStatus();

    const blockedIncomingDefault = getBlockedIncomingDefaultByAddress(incomingDefaultsAddresses, senderAddress || '');

    const handleUnblock = async () => {
        // Need to handle blocked by domain case
        if (!blockedIncomingDefault || !blockedIncomingDefault.Email) {
            return;
        }

        await dispatch(remove({ ID: blockedIncomingDefault.ID }));

        createNotification({
            text: c('Notification').t`Block removed`,
            type: 'success',
        });
    };

    return incomingDefaultsStatus === 'loaded' && blockedIncomingDefault ? (
        <div className="bg-norm rounded border pr-2 md:pr-1 pb-2 md:pb-1 pt-1 pl-2 mb-3 flex flex-nowrap flex-column md:flex-row">
            <div className="md:flex-1 flex flex-nowrap mb-2 md:mb-0">
                <Icon name="exclamation-circle-filled" className="mt-1 ml-0.5 shrink-0" />
                <span className="px-2 flex flex-1 items-center">{c('Info').t`Sender has been blocked.`}</span>
            </div>
            <span className="shrink-0 items-start flex w-full md:w-auto pt-0.5">
                <Button
                    className="rounded-sm"
                    color="weak"
                    data-testid="block-sender:unblock"
                    onClick={handleUnblock}
                    shape="outline"
                    size="small"
                >
                    {c('Action').t`Unblock`}
                </Button>
            </span>
        </div>
    ) : null;
};

export default ExtraBlockedSender;

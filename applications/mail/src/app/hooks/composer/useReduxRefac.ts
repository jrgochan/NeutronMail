import { useEffect } from 'react';

import { defaultFontStyle } from '@proton/components/components/editor/helpers';
import { useAddresses, useUserSettings } from '@proton/components/hooks';

import useMailModel from 'proton-mail/hooks/useMailModel';
import { useMailSelector } from 'proton-mail/store/hooks';

import type { MessageChange } from '../../components/composer/Composer';
import { getAddressFromEmail } from '../../helpers/addresses';
import { changeSignature } from '../../helpers/message/messageSignature';
import type { RecipientType } from '../../models/address';
import { selectComposer } from '../../store/composers/composerSelectors';
import type { ComposerID } from '../../store/composers/composerTypes';
import type { MessageState } from '../../store/messages/messagesTypes';

interface Props {
    composerID?: ComposerID;
    modelMessage: MessageState;
    handleChange: MessageChange;
    handleChangeContent: (content: string, refreshEditor?: boolean, silent?: boolean) => void;
}

const useReduxRefac = ({ composerID, modelMessage, handleChange, handleChangeContent }: Props) => {
    const mailSettings = useMailModel('MailSettings');
    const [userSettings] = useUserSettings();
    const [addresses = []] = useAddresses();
    const composer = useMailSelector((state) => selectComposer(state, composerID || ''));

    useEffect(() => {
        if (!composer || composer.changesCount === 0) {
            return;
        }

        if (composer.senderEmailAddress !== modelMessage.data?.Sender.Address) {
            const prevAddress = getAddressFromEmail(addresses, modelMessage.data?.Sender.Address);
            const newAddress = getAddressFromEmail(addresses, composer.senderEmailAddress);

            if (!newAddress || !composer.senderEmailAddress) {
                return;
            }

            const Sender = newAddress
                ? { Name: newAddress.DisplayName, Address: composer.senderEmailAddress }
                : undefined;

            handleChange({ data: { AddressID: newAddress.ID, Sender } });

            const fontStyle = defaultFontStyle(mailSettings);
            handleChangeContent(
                changeSignature(
                    modelMessage,
                    mailSettings,
                    userSettings,
                    fontStyle,
                    prevAddress?.Signature || '',
                    newAddress?.Signature || ''
                ),
                true
            );
        }

        const recipientTypes = ['ToList', 'CCList', 'BCCList'] as RecipientType[];
        for (const type of recipientTypes) {
            if (composer.recipients[type] !== modelMessage.data?.[type]) {
                handleChange({ data: { [type]: composer.recipients[type] } });
            }
        }
    }, [composer?.changesCount]);
};

export default useReduxRefac;

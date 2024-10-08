import { fireEvent } from '@testing-library/react';

import type { PublicKeyReference } from '@proton/crypto';

import { releaseCryptoProxy, setupCryptoProxyForTesting } from '../../../helpers/test/crypto';
import { addApiMock, clearAll, generateKeys, render, tick } from '../../../helpers/test/helper';
import { contactEmails, message, setupContactsForPinKeys } from '../../../helpers/test/pinKeys';
import { refresh } from '../../../store/contacts/contactsActions';
import type { MessageVerification } from '../../../store/messages/messagesTypes';
import ExtraAskResign from './ExtraAskResign';

const getMessageVerification = (pinnedKeysVerified: boolean, pinnedKeys?: PublicKeyReference[]) => {
    return {
        pinnedKeysVerified,
        senderPinnedKeys: pinnedKeys,
    } as MessageVerification;
};

const setup = async (messageVerification: MessageVerification) => {
    const onResignContact = jest.fn();

    const component = await render(
        <ExtraAskResign message={message} messageVerification={messageVerification} onResignContact={onResignContact} />
    );

    return component;
};

jest.mock('@proton/components/hooks/useGetEncryptionPreferences', () => ({
    __esModule: true,
    default: () => async () => ({ pinnedKeys: [] }),
}));

describe('Extra ask resign banner', () => {
    beforeAll(async () => {
        await setupCryptoProxyForTesting();
    });

    afterAll(async () => {
        await releaseCryptoProxy();
    });

    beforeEach(clearAll);

    it('should not display the extra ask resign banner when sender is verified and keys are pinned', async () => {
        const senderKey = await generateKeys('sender', message.Sender.Address);

        const messageVerification = getMessageVerification(true, [senderKey.publicKeys[0]]);
        const { queryByTestId } = await setup(messageVerification);

        const banner = queryByTestId('extra-ask-resign:banner');

        expect(banner).toBeNull();
    });

    it('should not display the extra ask resign banner when sender is verified and no keys are pinned', async () => {
        const messageVerification = getMessageVerification(true);
        const { queryByTestId } = await setup(messageVerification);

        const banner = queryByTestId('extra-ask-resign:banner');

        expect(banner).toBeNull();
    });

    it('should not display the extra ask resign banner when sender is not verified and no keys are pinned', async () => {
        const messageVerification = getMessageVerification(false);
        const { queryByTestId } = await setup(messageVerification);

        const banner = queryByTestId('extra-ask-resign:banner');

        expect(banner).toBeNull();
    });

    it('should display the extra ask resign banner when sender is not verified and keys are pinned', async () => {
        const { senderKeys } = await setupContactsForPinKeys();
        addApiMock('core/v4/keys/all', () => ({ Address: { Keys: [{ PublicKey: senderKeys.publicKeyArmored }] } }));

        const messageVerification = getMessageVerification(false, [senderKeys.publicKeys[0]]);
        const { store, getByTestId, getByText } = await setup(messageVerification);

        // Initialize contactsMap
        store.dispatch(refresh({ contacts: [...contactEmails], contactGroups: [] }));

        // Banner is displayed
        getByTestId('extra-ask-resign:banner');

        // Modal is opened
        const trustKeyButton = getByText('Verify');
        fireEvent.click(trustKeyButton);
        await tick();

        getByText('Trust pinned keys?');
    });
});

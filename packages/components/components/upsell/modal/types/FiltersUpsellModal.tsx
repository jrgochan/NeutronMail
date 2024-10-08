import { c } from 'ttag';

import type { ModalStateProps } from '@proton/components/components';
import { UpsellModal, useUpsellConfig } from '@proton/components/components';
import { APP_UPSELL_REF_PATH, MAIL_UPSELL_PATHS, UPSELL_COMPONENT } from '@proton/shared/lib/constants';
import { getUpsellRef } from '@proton/shared/lib/helpers/upsell';

interface Props {
    modalProps: ModalStateProps;
    /**
     * Needed in a "Dropdown" scenario because we want to close the dropdown after closing the upsell modal
     */
    onCloseCustomAction?: () => void;
    isSettings?: boolean;
}

const FiltersUpsellModal = ({ modalProps, onCloseCustomAction, isSettings = false }: Props) => {
    const upsellRef = getUpsellRef({
        app: APP_UPSELL_REF_PATH.MAIL_UPSELL_REF_PATH,
        component: UPSELL_COMPONENT.MODAL,
        feature: MAIL_UPSELL_PATHS.UNLIMITED_FILTERS,
        isSettings,
    });
    const upsellConfig = useUpsellConfig({ upsellRef });

    return (
        <UpsellModal
            title={c('Title').t`Save time with email filters`}
            description={c('Description')
                .t`Unlock unlimited filters that sort your inbox for you and more premium features when you upgrade.`}
            modalProps={modalProps}
            features={['more-storage', 'more-email-addresses', 'unlimited-folders-and-labels', 'custom-email-domains']}
            onClose={onCloseCustomAction}
            {...upsellConfig}
        />
    );
};

export default FiltersUpsellModal;

import { c } from 'ttag';

import { MAIL_APP_NAME } from '@proton/shared/lib/constants';
import { getKnowledgeBaseUrl } from '@proton/shared/lib/helpers/url';
import { useFlag } from '@proton/unleash';

import { BetaBadge, Info } from '../../components';
import { SettingsSection } from '../account';
import SettingsLayout from '../account/SettingsLayout';
import SettingsLayoutLeft from '../account/SettingsLayoutLeft';
import SettingsLayoutRight from '../account/SettingsLayoutRight';
import KTToggle from './KTToggle';
import PromptPinToggle from './PromptPinToggle';

const AddressVerificationSection = () => {
    const showKTSetting = useFlag('KeyTransparencyShowUI');
    return (
        <SettingsSection>
            <SettingsLayout>
                <SettingsLayoutLeft>
                    <label htmlFor="prompt-pin-toggle" className="text-semibold">
                        <span className="mr-2">{c('Label').t`Prompt to trust keys`}</span>
                        <Info
                            url={getKnowledgeBaseUrl('/address-verification')}
                            title={c('Tooltip prompt to trust keys')
                                .t`When receiving an email from another ${MAIL_APP_NAME} user who does not have trusted keys in your contacts, a banner will ask if you want to enable trusted keys.`}
                        />
                    </label>
                </SettingsLayoutLeft>
                <SettingsLayoutRight isToggleContainer>
                    <PromptPinToggle id="prompt-pin-toggle" />
                </SettingsLayoutRight>
            </SettingsLayout>
            {showKTSetting ? (
                <SettingsLayout>
                    <SettingsLayoutLeft>
                        <label htmlFor="kt-toggle" className="text-semibold">
                            <span className="mr-2">{c('Label').t`Verify keys with Key Transparency`}</span>
                            <BetaBadge className="mr-2" />
                            <Info url={getKnowledgeBaseUrl('/key-transparency')} />
                        </label>
                    </SettingsLayoutLeft>
                    <SettingsLayoutRight isToggleContainer>
                        <KTToggle id="kt-toggle" />
                    </SettingsLayoutRight>
                </SettingsLayout>
            ) : null}
        </SettingsSection>
    );
};

export default AddressVerificationSection;

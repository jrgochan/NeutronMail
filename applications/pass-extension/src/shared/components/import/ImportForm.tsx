import { type VFC, useMemo } from 'react';

import { Field } from 'formik';
import { c } from 'ttag';

import { Href } from '@proton/atoms/Href';
import { AttachedFile, Bordered, Dropzone, FileInput, Icon, InlineLinkButton } from '@proton/components/components';
import { ImportProvider, ImportProviderValues, PROVIDER_INFO_MAP, extractFileExtension } from '@proton/pass/import';
import type { MaybeNull } from '@proton/pass/types';
import clsx from '@proton/utils/clsx';

import { type ImportFormContext, SUPPORTED_IMPORT_FILE_TYPES } from '../../hooks/useImportForm';
import { PasswordField } from '../fields';
import { ImportProviderItem } from './ImportProviderItem';

import './ImportForm.scss';

export const ImportForm: VFC<Omit<ImportFormContext, 'reset' | 'result'>> = ({ form, dropzone, busy }) => {
    const needsPassphrase = useMemo(
        () =>
            form.values.file &&
            extractFileExtension(form.values.file.name) === 'pgp' &&
            form.values.provider === ImportProvider.PROTONPASS,
        [form.values]
    );

    const onSelectProvider = (provider: MaybeNull<ImportProvider>) => () => form.setFieldValue('provider', provider);

    return (
        <>
            <div className="mb-2">
                <strong>{c('Label').t`Select your password manager`}</strong>
                {form.values.provider && (
                    <InlineLinkButton onClick={onSelectProvider(null)} className="ml-2">
                        {c('Action').t`Change`}
                    </InlineLinkButton>
                )}
            </div>

            {!form.values.provider && (
                <>
                    <div className="pass-import-providers--grid gap-3 mb-4">
                        {ImportProviderValues.map((provider) => (
                            <ImportProviderItem
                                onClick={onSelectProvider(provider)}
                                key={provider}
                                value={provider}
                                title={PROVIDER_INFO_MAP[provider].title}
                                fileExtension={PROVIDER_INFO_MAP[provider].fileExtension}
                            />
                        ))}
                    </div>
                    <Href href="https://protonmail.uservoice.com/forums/953584-proton-pass">{c('Action')
                        .t`Can't find your password manager? Please let us know!`}</Href>
                </>
            )}

            {form.values.provider && (
                <>
                    <div className="flex flex-justify-space-between flex-align-items-center mt-3 mb-4">
                        <div className="flex flex-align-items-center">
                            <div className="mr-2">
                                <img
                                    src={
                                        form.values.provider === ImportProvider.PROTONPASS
                                            ? '/assets/protonpass-icon-24.svg'
                                            : `/assets/${form.values.provider}-icon-24.png`
                                    }
                                    alt=""
                                />
                            </div>
                            <div className="flex flex-column ml-3">
                                <span>{PROVIDER_INFO_MAP[form.values.provider].title}</span>
                                <span className="color-weak">
                                    {PROVIDER_INFO_MAP[form.values.provider].fileExtension}
                                </span>
                            </div>
                        </div>
                        {PROVIDER_INFO_MAP[form.values.provider].tutorialUrl && (
                            <Href
                                href={PROVIDER_INFO_MAP[form.values.provider].tutorialUrl}
                                className="flex flex-align-items-center"
                            >
                                {c('Action').t`How do I export my data from ${
                                    PROVIDER_INFO_MAP[form.values.provider].title
                                }?`}
                                <Icon className="ml-2" name="arrow-out-square" />
                            </Href>
                        )}
                    </div>
                    <Dropzone onDrop={dropzone.onDrop} disabled={busy} border={false}>
                        <Bordered
                            className={clsx([
                                'flex flex-columns flex-justify-center flex-align-items-center relative p-4 mb-4 rounded border-weak min-h-custom pass-import-upload',
                                form.values.file ? 'pass-import-upload--has-file' : 'border-dashed',
                                form.errors.file && 'border-danger',
                            ])}
                        >
                            {form.values.file ? (
                                <AttachedFile
                                    file={form.values.file}
                                    className={clsx('border-none', busy && 'no-pointer-events')}
                                    iconName="file-lines"
                                    clear={c('Action').t`Delete`}
                                    onClear={() => form.setFieldValue('file', undefined)}
                                />
                            ) : (
                                <FileInput
                                    accept={SUPPORTED_IMPORT_FILE_TYPES.map((ext) => `.${ext}`).join(',')}
                                    onChange={dropzone.onAttach}
                                    disabled={busy}
                                    shape="solid"
                                    color="weak"
                                >
                                    {c('Action').t`Choose a file or drag it here`}
                                </FileInput>
                            )}
                        </Bordered>
                    </Dropzone>
                    {needsPassphrase && (
                        <Field name="passphrase" label={c('Label').t`Passphrase`} component={PasswordField} />
                    )}
                </>
            )}
        </>
    );
};

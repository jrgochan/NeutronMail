import type { ReactNode } from 'react';

import clsx from '@proton/utils/clsx';

import ContactLabelProperty from '../ContactLabelProperty';
import EncryptedIcon from '../EncryptedIcon';

interface Props {
    field: string;
    type?: string;
    isSignatureVerified: boolean;
    children: ReactNode;
}

const ContactViewProperty = ({ field, type, isSignatureVerified, children }: Props) => {
    return (
        <div className="contact-view-row flex flex-nowrap items-start mb-4">
            <div className={clsx(['contact-view-row-left flex flex-nowrap flex-1 flex-column md:flex-row w-full'])}>
                <div
                    className={clsx([
                        'contact-view-row-label flex *:min-size-auto w-full md:w-1/5 shrink-0 items-start label',
                    ])}
                >
                    <div className="flex shrink-0 flex-1 items-center max-w-full">
                        <div role="heading" aria-level={3} className="mr-2">
                            <ContactLabelProperty field={field} type={type} />
                        </div>
                        {field && ['email', 'fn'].includes(field) ? null : (
                            <EncryptedIcon className="flex" isSignatureVerified={isSignatureVerified} />
                        )}
                    </div>
                </div>
                <span
                    className={clsx([
                        'contact-view-row-content mr-2 md:flex-1 pt-2 pl-0 md:pl-7',
                        ['note'].includes(field) && 'text-pre-wrap',
                    ])}
                >
                    {children}
                </span>
            </div>
        </div>
    );
};

export default ContactViewProperty;

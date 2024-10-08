import type { ReactNode, Ref } from 'react';
import { forwardRef } from 'react';

interface Props {
    children: ReactNode;
    onClick: () => void;
}

const QuickSettingsButton = ({ onClick, children, ...rest }: Props, ref: Ref<HTMLButtonElement>) => {
    return (
        <button
            onClick={onClick}
            type="button"
            className="color-weak text-no-decoration hover:text-underline flex flex-nowrap justify-center text-sm mx-auto"
            ref={ref}
            {...rest}
        >
            {children}
        </button>
    );
};

export default forwardRef(QuickSettingsButton);

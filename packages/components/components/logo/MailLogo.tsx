import type { ComponentPropsWithoutRef } from 'react';
import { useState } from 'react';

import { generateUID } from '@proton/components';
import { MAIL_APP_NAME } from '@proton/shared/lib/constants';
import clsx from '@proton/utils/clsx';

import type { LogoProps } from './Logo';

type Props = ComponentPropsWithoutRef<'svg'> & Pick<LogoProps, 'variant' | 'size' | 'hasTitle'>;

const MailLogo = ({ variant = 'with-wordmark', className, size, hasTitle = true, ...rest }: Props) => {
    // This logo can be several times in the view, ids has to be different each time
    const [uid] = useState(generateUID('logo'));

    let logoWidth: number;

    switch (variant) {
        case 'glyph-only':
            logoWidth = 36;
            break;
        case 'wordmark-only':
            logoWidth = 256;
            break;
        default:
            logoWidth = 134;
            break;
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox={`0 0 ${logoWidth} 36`}
            width={logoWidth}
            height="36"
            fill="none"
            role="img"
            className={clsx('logo', size && variant === 'glyph-only' && `icon-size-${size}`, variant, className)}
            aria-labelledby={`${uid}-title`}
            {...rest}
        >
            {hasTitle && <title id={`${uid}-title`}>{MAIL_APP_NAME}</title>}
            {variant === 'glyph-only' && (
                <>
                    <path
                        fill={`url(#${uid}-a)`}
                        fillRule="evenodd"
                        d="m21.78 14.36.002.002L14 23 4 11.993V7.245a.644.644 0 0 1 1.055-.495l11.095 9.213a2.896 2.896 0 0 0 3.7 0l1.93-1.602Z"
                        clipRule="evenodd"
                    />
                    <path
                        fill={`url(#${uid}-b)`}
                        d="m26 10.857-4.22 3.504.002.001-5.588 4.936a2.575 2.575 0 0 1-3.35.05L4 11.993v14.11A2.896 2.896 0 0 0 6.897 29H26l2-9.072-2-9.072Z"
                    />
                    <path
                        fill={`url(#${uid}-c)`}
                        fillRule="evenodd"
                        d="M26 10.86V29h3.103c1.6 0 2.897-1.297 2.897-2.896V7.244a.644.644 0 0 0-1.055-.494L26 10.86Z"
                        clipRule="evenodd"
                    />
                    <defs>
                        <linearGradient
                            id={`${uid}-a`}
                            x1="14.507"
                            x2="5.116"
                            y1="23.152"
                            y2="-9.469"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#E3D9FF" />
                            <stop offset="1" stopColor="#7341FF" />
                        </linearGradient>
                        <linearGradient
                            id={`${uid}-c`}
                            x1="41.055"
                            x2="19.455"
                            y1="43.522"
                            y2="-3.075"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset=".271" stopColor="#E3D9FF" />
                            <stop offset="1" stopColor="#7341FF" />
                        </linearGradient>
                        <radialGradient
                            id={`${uid}-b`}
                            cx="0"
                            cy="0"
                            r="1"
                            gradientTransform="matrix(27.9882 0 0 26.381 27.895 13.077)"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset=".556" stopColor="#6D4AFF" />
                            <stop offset=".994" stopColor="#AA8EFF" />
                        </radialGradient>
                    </defs>
                </>
            )}

            {variant === 'with-wordmark' && (
                <>
                    <path
                        fill={`url(#${uid}-a)`}
                        fillRule="evenodd"
                        d="m17.78 14.361.002.001L10 23 0 11.993V7.245a.644.644 0 0 1 1.055-.495l11.095 9.213a2.895 2.895 0 0 0 3.7 0l1.93-1.602Z"
                        clipRule="evenodd"
                    />
                    <path
                        fill={`url(#${uid}-b)`}
                        d="m22 10.856-4.22 3.505.002.001-5.588 4.936a2.575 2.575 0 0 1-3.35.05L0 11.993v14.11A2.896 2.896 0 0 0 2.897 29H22l2-9.072-2-9.072Z"
                    />
                    <path
                        fill={`url(#${uid}-c)`}
                        fillRule="evenodd"
                        d="M22 10.86V29h3.103c1.6 0 2.897-1.297 2.897-2.896V7.245a.644.644 0 0 0-1.055-.495L22 10.86Z"
                        clipRule="evenodd"
                    />
                    <path
                        fill="var(--logo-text-proton-color)"
                        d="M38 21.26v3.664h2.56V21.42a1.282 1.282 0 0 1 1.279-1.286h2.624a4.592 4.592 0 0 0 3.261-1.361 4.652 4.652 0 0 0 1.351-3.28c0-1.228-.486-2.41-1.35-3.281a4.603 4.603 0 0 0-3.265-1.358H38v4.58h2.56v-2.159h3.73c.58 0 1.134.232 1.544.644a2.2 2.2 0 0 1 0 3.104c-.41.412-.964.644-1.544.644h-2.71a3.551 3.551 0 0 0-2.528 1.055 3.65 3.65 0 0 0-.776 1.166A3.54 3.54 0 0 0 38 21.259Zm11.47 3.664v-5.583c0-2.279 1.322-4.091 3.97-4.091a5.09 5.09 0 0 1 1.262.14v2.296c-.301-.02-.56-.02-.682-.02-1.402 0-2.005.646-2.005 1.955v5.303H49.47Zm5.994-4.734c0-2.802 2.104-4.937 5.033-4.937 2.929 0 5.033 2.135 5.033 4.937 0 2.802-2.104 4.957-5.033 4.957-2.929 0-5.033-2.158-5.033-4.957Zm7.558 0c0-1.592-1.064-2.722-2.525-2.722-1.465 0-2.525 1.127-2.525 2.722 0 1.612 1.063 2.722 2.525 2.722 1.464 0 2.525-1.113 2.525-2.722Zm10.646 0c0-2.802 2.104-4.937 5.032-4.937 2.926 0 5.03 2.135 5.03 4.937 0 2.802-2.104 4.957-5.03 4.957-2.928 0-5.032-2.158-5.032-4.957Zm7.554 0c0-1.592-1.063-2.722-2.524-2.722-1.462 0-2.525 1.127-2.525 2.722 0 1.612 1.063 2.722 2.525 2.722 1.461 0 2.525-1.113 2.525-2.722Zm3.831 4.734v-5.38c0-2.499 1.583-4.294 4.41-4.294 2.806 0 4.39 1.792 4.39 4.294v5.38h-2.525v-5.18c0-1.39-.623-2.259-1.865-2.259-1.243 0-1.865.867-1.865 2.259v5.18h-2.545Zm-12.147-7.436h-2.747v3.528c0 1.23.44 1.793 1.703 1.793.12 0 .42 0 .802-.02v2.075c-.52.14-.981.223-1.484.223-2.124 0-3.569-1.29-3.569-3.728v-3.87h-1.706v-2.036h.427a1.3 1.3 0 0 0 .489-.097 1.285 1.285 0 0 0 .694-.698 1.28 1.28 0 0 0 .096-.492v-1.918h2.545v3.205h2.747v2.035h.003Z"
                    />
                    <path
                        fill="var(--logo-text-product-color)"
                        d="M98.882 11.216h3.575l3.351 8.223c.299.69.554 1.393.769 2.11h.035c.215-.717.471-1.424.769-2.11l3.351-8.223h3.575V24.93h-2.59v-9.187a8.055 8.055 0 0 1 .043-.906h-.043c-.08.323-.186.64-.321.946l-3.713 8.987h-2.148l-3.724-8.987a7.46 7.46 0 0 1-.342-.946h-.04c.029.3.043.603.04.906v9.19h-2.587V11.216Zm24.283 4.666c.75.392 1.37.993 1.786 1.727a5.17 5.17 0 0 1 .652 2.614v4.706h-2.268l-.161-1.413a3.18 3.18 0 0 1-1.252 1.21 3.784 3.784 0 0 1-1.818.42 4.364 4.364 0 0 1-2.291-.62 4.476 4.476 0 0 1-1.648-1.75 5.345 5.345 0 0 1-.603-2.573 4.91 4.91 0 0 1 .655-2.514 4.702 4.702 0 0 1 1.808-1.77 5.141 5.141 0 0 1 2.553-.643 5.391 5.391 0 0 1 2.587.606Zm-.83 6.33c.494-.468.738-1.129.738-2.01a2.746 2.746 0 0 0-.706-1.958 2.455 2.455 0 0 0-.813-.56 2.446 2.446 0 0 0-.967-.198 2.465 2.465 0 0 0-1.781.758 3.05 3.05 0 0 0-.712 1.956c0 .715.253 1.407.712 1.956a2.367 2.367 0 0 0 1.786.755 2.438 2.438 0 0 0 1.743-.698Zm4.666-8.692a1.494 1.494 0 0 1-.356-.497 1.429 1.429 0 0 1-.12-.597 1.488 1.488 0 0 1 .476-1.106 1.617 1.617 0 0 1 2.269 0 1.5 1.5 0 0 1 .353.502c.08.192.123.395.12.604a1.458 1.458 0 0 1-.473 1.095 1.645 1.645 0 0 1-2.269 0Zm2.412 11.409h-2.55v-9.45h2.55v9.45Zm4.411 0h-2.553V11.216h2.553V24.93Z"
                    />
                    <defs>
                        <linearGradient
                            id={`${uid}-a`}
                            x1="10.507"
                            x2="1.116"
                            y1="23.152"
                            y2="-9.469"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#E3D9FF" />
                            <stop offset="1" stopColor="#7341FF" />
                        </linearGradient>
                        <linearGradient
                            id={`${uid}-c`}
                            x1="37.055"
                            x2="15.455"
                            y1="43.522"
                            y2="-3.075"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset=".271" stopColor="#E3D9FF" />
                            <stop offset="1" stopColor="#7341FF" />
                        </linearGradient>
                        <radialGradient
                            id={`${uid}-b`}
                            cx="0"
                            cy="0"
                            r="1"
                            gradientTransform="matrix(27.9882 0 0 26.381 23.895 13.077)"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset=".556" stopColor="#6D4AFF" />
                            <stop offset=".994" stopColor="#AA8EFF" />
                        </radialGradient>
                    </defs>
                </>
            )}

            {variant === 'wordmark-only' && (
                <>
                    <path d="M247.949 34.5744V0.251999H253.241V34.5744H247.949Z" fill="var(--logo-text-proton-color)" />
                    <path
                        d="M235.378 34.5744V10.9368H240.67V34.5744H235.378ZM235.579 5.7456C234.941 5.10721 234.622 4.31759 234.622 3.3768C234.622 2.436 234.941 1.6464 235.579 1.008C236.251 0.336001 237.075 0 238.049 0C238.99 0 239.779 0.336001 240.418 1.008C241.09 1.6464 241.426 2.436 241.426 3.3768C241.426 4.31759 241.09 5.10721 240.418 5.7456C239.779 6.38399 238.99 6.7032 238.049 6.7032C237.075 6.7032 236.251 6.38399 235.579 5.7456Z"
                        fill="var(--logo-text-proton-color)"
                    />
                    <path
                        d="M215.38 35.0784C212.289 35.0784 209.634 33.9696 207.417 31.752C205.233 29.5344 204.141 26.544 204.141 22.7808C204.141 18.984 205.233 15.9768 207.417 13.7592C209.634 11.5416 212.289 10.4328 215.38 10.4328C217.127 10.4328 218.706 10.8024 220.118 11.5416C221.529 12.2472 222.638 13.272 223.444 14.616L223.948 10.9368H228.534V34.5744H223.847L223.444 30.9456C221.764 33.7008 219.076 35.0784 215.38 35.0784ZM209.433 22.7808C209.433 25.0992 210.105 26.9472 211.449 28.3248C212.827 29.6688 214.506 30.3408 216.489 30.3408C218.371 30.3408 220 29.6688 221.378 28.3248C222.755 26.9472 223.444 25.0992 223.444 22.7808C223.444 20.5296 222.738 18.7152 221.327 17.3376C219.95 15.9264 218.337 15.2208 216.489 15.2208C214.506 15.2208 212.827 15.9096 211.449 17.2872C210.105 18.6648 209.433 20.496 209.433 22.7808Z"
                        fill="var(--logo-text-proton-color)"
                    />
                    <path
                        d="M160.833 34.5744V0.251999H168.897L177.818 22.5792C178.725 24.7968 179.347 26.4936 179.683 27.6696H179.784C180.052 26.5944 180.657 24.8976 181.598 22.5792L190.519 0.251999H198.583V34.5744H193.19V9.1728C193.19 8.1648 193.224 7.32481 193.291 6.6528H193.19C193.089 6.98879 192.803 7.77841 192.333 9.0216L182.152 34.1712H177.264L167.083 9.0216C166.612 7.77841 166.327 6.98879 166.226 6.6528H166.125C166.192 7.32481 166.226 8.1648 166.226 9.1728V34.5744H160.833Z"
                        fill="var(--logo-text-proton-color)"
                    />
                    <path
                        d="M120.804 20.8152C120.804 17.724 121.745 15.2208 123.627 13.3056C125.509 11.3904 128.079 10.4328 131.338 10.4328C134.597 10.4328 137.168 11.3904 139.049 13.3056C140.931 15.2208 141.872 17.724 141.872 20.8152V34.5744H136.58V21.2184C136.58 19.3368 136.126 17.8752 135.219 16.8336C134.345 15.7584 133.052 15.2208 131.338 15.2208C129.624 15.2208 128.314 15.7584 127.407 16.8336C126.533 17.8752 126.096 19.3368 126.096 21.2184V34.5744H120.804V20.8152Z"
                        fill="var(--logo-text-proton-color)"
                    />
                    <path
                        d="M103.589 35.0784C100.061 35.0784 97.1208 33.9024 94.7689 31.5504C92.417 29.1984 91.2409 26.2752 91.2409 22.7808C91.2409 19.2864 92.417 16.3632 94.7689 14.0112C97.1208 11.6256 100.061 10.4328 103.589 10.4328C107.15 10.4328 110.107 11.6256 112.459 14.0112C114.811 16.3632 115.987 19.2864 115.987 22.7808C115.987 26.2752 114.811 29.1984 112.459 31.5504C110.107 33.9024 107.15 35.0784 103.589 35.0784ZM96.5329 22.7808C96.5329 24.9648 97.1881 26.7792 98.4985 28.224C99.8424 29.6352 101.539 30.3408 103.589 30.3408C105.638 30.3408 107.335 29.6352 108.679 28.224C110.023 26.7792 110.695 24.9648 110.695 22.7808C110.695 20.5632 110.023 18.7488 108.679 17.3376C107.335 15.8928 105.638 15.1704 103.589 15.1704C101.539 15.1704 99.8424 15.8928 98.4985 17.3376C97.1881 18.7488 96.5329 20.5632 96.5329 22.7808Z"
                        fill="var(--logo-text-proton-color)"
                    />
                    <path
                        d="M84.2303 34.9272C81.7438 34.9272 79.7108 34.188 78.1319 32.7096C76.586 31.1976 75.8135 29.1144 75.8135 26.46V15.3216H71.5295V10.9368H75.7631V3.024H81.1055V10.9368H88.0103V15.3216H81.1055V25.8048C81.1055 27.384 81.4583 28.5096 82.1639 29.1816C82.903 29.82 84.0791 30.1392 85.6919 30.1392C86.2628 30.1392 86.8846 30.1224 87.5567 30.0888V34.4736C86.3806 34.776 85.2718 34.9272 84.2303 34.9272Z"
                        fill="var(--logo-text-proton-color)"
                    />
                    <path
                        d="M56.8843 35.0784C53.3563 35.0784 50.4162 33.9024 48.0643 31.5504C45.7124 29.1984 44.5363 26.2752 44.5363 22.7808C44.5363 19.2864 45.7124 16.3632 48.0643 14.0112C50.4162 11.6256 53.3563 10.4328 56.8843 10.4328C60.4458 10.4328 63.4028 11.6256 65.7547 14.0112C68.1066 16.3632 69.2827 19.2864 69.2827 22.7808C69.2827 26.2752 68.1066 29.1984 65.7547 31.5504C63.4028 33.9024 60.4458 35.0784 56.8843 35.0784ZM49.8283 22.7808C49.8283 24.9648 50.4835 26.7792 51.7939 28.224C53.1378 29.6352 54.8348 30.3408 56.8843 30.3408C58.9338 30.3408 60.6308 29.6352 61.9747 28.224C63.3186 26.7792 63.9907 24.9648 63.9907 22.7808C63.9907 20.5632 63.3186 18.7488 61.9747 17.3376C60.6308 15.8928 58.9338 15.1704 56.8843 15.1704C54.8348 15.1704 53.1378 15.8928 51.7939 17.3376C50.4835 18.7488 49.8283 20.5632 49.8283 22.7808Z"
                        fill="var(--logo-text-proton-color)"
                    />
                    <path
                        d="M29.167 20.0592C29.167 17.136 29.9902 14.8008 31.6366 13.0536C33.3166 11.3064 35.5678 10.4328 38.3904 10.4328C39.2303 10.4328 40.171 10.5504 41.2128 10.7856V15.624C40.9104 15.5904 40.3056 15.5736 39.3984 15.5736C37.7518 15.5736 36.5087 15.9936 35.6686 16.8336C34.8622 17.6736 34.459 19.0512 34.459 20.9664V34.5744H29.167V20.0592Z"
                        fill="var(--logo-text-proton-color)"
                    />
                    <path
                        d="M0 34.5744V0.251999H13.7592C16.884 0.251999 19.488 1.2264 21.5712 3.1752C23.688 5.12399 24.7464 7.6104 24.7464 10.6344C24.7464 13.6584 23.688 16.1616 21.5712 18.144C19.488 20.0928 16.884 21.0672 13.7592 21.0672H5.3928V34.5744H0ZM5.3928 16.0272H12.7512C14.868 16.0272 16.4808 15.5232 17.5896 14.5152C18.6984 13.5072 19.2528 12.2136 19.2528 10.6344C19.2528 9.05519 18.6984 7.77841 17.5896 6.804C16.5144 5.796 14.9352 5.292 12.852 5.292H5.3928V16.0272Z"
                        fill="var(--logo-text-proton-color)"
                    />
                </>
            )}
        </svg>
    );
};

export default MailLogo;

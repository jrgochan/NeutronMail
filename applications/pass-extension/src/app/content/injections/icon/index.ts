import {
    ICON_MAX_HEIGHT,
    ICON_MIN_HEIGHT,
    ICON_PADDING,
    INPUT_BASE_STYLES_ATTR,
} from 'proton-pass-extension/app/content/constants.static';
import { type ProtonPassControl } from 'proton-pass-extension/app/content/injections/custom-elements/ProtonPassControl';
import type { FieldHandle } from 'proton-pass-extension/app/content/types';

import {
    type BoundComputeStyles,
    createStyleCompute,
    getComputedHeight,
    pixelEncoder,
    pixelParser,
} from '@proton/pass/utils/dom/computed-styles';
import { createElement } from '@proton/pass/utils/dom/create-element';
import { repaint } from '@proton/pass/utils/dom/repaint';

type InjectionElements = {
    form: HTMLElement;
    input: HTMLInputElement;
    inputBox: HTMLElement;
    icon: HTMLButtonElement;
    control: ProtonPassControl;
};

type InjectionOptions = {
    inputBox: HTMLElement;
    getInputStyle: BoundComputeStyles;
    getBoxStyle: BoundComputeStyles;
};

/* input styles we may override */
type InputInitialStyles = { ['padding-right']?: string };

/** Calculates the maximum horizontal shift required for injected elements.
 * Determines the optimal positioning to avoid overlap with existing elements */
const getOverlayShift = (options: {
    x: number;
    y: number;
    inputBox: HTMLElement;
    input: HTMLElement;
    form: HTMLElement;
}): number => {
    try {
        const { x, y, form, input, inputBox } = options;
        const maxWidth = inputBox.offsetWidth;
        const maxShift = maxWidth * 0.5; /* Maximum allowed shift */

        if (Number.isNaN(x) || Number.isNaN(y)) return 0;
        const overlays = document.elementsFromPoint(x, y);

        let maxDx: number = 0;

        for (const el of overlays) {
            if (el === input || el === inputBox) break; /* Stop at target elements */
            if (!(el instanceof HTMLElement)) continue; /* Skip non-HTMLElements */
            if (el.tagName.startsWith('PROTONPASS')) continue; /* Skip injected pass elements */
            if (!form.contains(el)) continue; /* Skip elements outside form */
            if (el.matches('svg *')) continue; /* Skip SVG subtrees */
            if (el.innerText.length > 0 && el.offsetWidth >= maxWidth * 0.8) continue; /* Skip large text elements */

            const style = getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') continue; /* Skip hidden elements */

            const { left } = el.getBoundingClientRect();
            const dx = Math.max(0, x - left);
            if (dx > maxDx && dx < maxShift) maxDx = dx;
        }

        return maxDx;
    } catch (e) {
        return 0;
    }
};

/* Force re-render/re-paint of the input element
 * before computing the icon injection styles in
 * order to avoid certain browser rendering optimisations
 * which cause incorrect DOMRect / styles to be resolved.
 * ie: check amazon sign-in page without repaint to
 * reproduce issue */
const computeIconInjectionStyles = (
    { input, control, form }: Omit<InjectionElements, 'icon'>,
    { getInputStyle, getBoxStyle, inputBox }: InjectionOptions
) => {
    repaint(input, control);

    const { right: inputRight, top: inputTop, height: inputHeight } = input.getBoundingClientRect();
    const { top: boxTop, height: boxMaxHeight } = inputBox.getBoundingClientRect();
    const { top: controlTop, right: controlRight } = control.getBoundingClientRect();

    /* If inputBox is not the input element in the case we
     * resolved a bounding element : compute inner height
     * without offsets in order to correctly position icon
     * if bounding element has some padding-top/border-top */
    const boxed = inputBox !== input;
    const { value: boxHeight, offset: boxOffset } = getComputedHeight(getBoxStyle, {
        node: inputBox,
        mode: boxed ? 'inner' : 'outer',
    });

    const size = Math.max(Math.min(boxMaxHeight - ICON_PADDING, ICON_MAX_HEIGHT), ICON_MIN_HEIGHT);
    const pl = getInputStyle('padding-left', pixelParser);
    const pr = getInputStyle('padding-right', pixelParser);
    const iconPaddingLeft = size / 5; /* dynamic "responsive" padding */
    const iconPaddingRight = Math.max(Math.min(pl, pr) / 1.5, iconPaddingLeft);

    /* look for any overlayed elements if we were to inject
     * the icon on the right hand-side of the input element
     * accounting for icon size and padding  */
    let overlayDx = getOverlayShift({
        x: inputRight - (iconPaddingRight + size / 2),
        y: inputTop + inputHeight / 2,
        inputBox,
        input,
        form,
    });

    overlayDx = overlayDx !== 0 ? overlayDx + iconPaddingLeft + size / 2 : 0;

    /* Compute the new input padding :
     * Take into account the input element's current padding as it
     * may already cover the necessary space to inject the icon without
     * the need to mutate the input's padding style. Account for potential
     * overlayed element offset */
    const newPaddingRight = Math.max(pr, size + iconPaddingLeft + iconPaddingRight + overlayDx);

    /* `mt` represents the vertical offset needed to align the
     * center of the injected icon with the top-most part of
     * the bounding box :
     * mt = boxTop - boxOffset.top - controlTop - size / 2
     * top = mt + boxHeight / 2 */

    const top = boxTop - controlTop + boxOffset.top + (boxHeight - size) / 2;
    const right = controlRight - inputRight + iconPaddingRight + overlayDx;

    return {
        input: {
            paddingRight: pixelEncoder(newPaddingRight),
        },
        icon: {
            top: pixelEncoder(top),
            right: pixelEncoder(right),
            size: pixelEncoder(size),
            fontSize: size / 2.5,
        },
    };
};

export const getInputInitialStyles = (el: HTMLElement): InputInitialStyles => {
    const initialStyles = el.getAttribute(INPUT_BASE_STYLES_ATTR);
    return initialStyles ? JSON.parse(initialStyles) : {};
};

export const cleanupInputInjectedStyles = (input: HTMLInputElement) => {
    Object.entries(getInputInitialStyles(input)).forEach(
        ([prop, value]) =>
            Boolean(value)
                ? input.style.setProperty(prop, value) /* if has initial style -> reset */
                : input.style.removeProperty(prop) /* else remove override */
    );

    input.removeAttribute(INPUT_BASE_STYLES_ATTR);
};

export const cleanupInjectionStyles = ({ control, input }: Pick<InjectionElements, 'control' | 'input'>) => {
    control.style.removeProperty('float');
    control.style.removeProperty('max-width');
    control.style.removeProperty('margin-left');
    cleanupInputInjectedStyles(input);
};

const applyIconInjectionStyles = (elements: InjectionElements, options: InjectionOptions) => {
    const { icon, input } = elements;
    const styles = computeIconInjectionStyles(elements, options);

    /* Handle a specific scenario where input has transitions or
     * animations set, which could affect width change detection
     * and repositioning triggers. To avoid unwanted side-effects
     * when applying the injection style, temporarily disable these
     * properties */
    const { transition, animation } = input.style;
    input.style.setProperty('transition', 'none');
    input.style.setProperty('animation', 'none');

    /* Get the width of the input element before applying the injection styles */
    const widthBefore = input.getBoundingClientRect().width;

    icon.style.top = styles.icon.top;
    icon.style.right = styles.icon.right;
    icon.style.width = styles.icon.size;
    icon.style.height = styles.icon.size;
    icon.style.setProperty(`--control-lineheight`, styles.icon.size);
    icon.style.setProperty(`--control-fontsize`, pixelEncoder(styles.icon.fontSize));

    /* Store the original input styles to handle potential clean-up
     * on extension updates or code hot-reload. */
    input.setAttribute(INPUT_BASE_STYLES_ATTR, JSON.stringify({ 'padding-right': input.style.paddingRight }));

    input.style.setProperty('padding-right', styles.input.paddingRight, 'important');
    const widthAfter = input.getBoundingClientRect().width;

    /* If the input width has increased due to padding, remove the override
     * and set it back to its original value (This can hapen on `content-box
     * box-sized elements or certain flexbox edge-cases ) */
    if (widthAfter !== widthBefore) {
        input.style.removeProperty('padding-right');
        input.style.setProperty('padding-right', input.style.paddingRight);
    }

    /* Restore transition and animation properties in the next rendering frame
     * to ensure they work as expected. */
    requestAnimationFrame(() => {
        input.style.setProperty('transition', transition);
        input.style.setProperty('animation', animation);
    });
};

/* The injection styles application is a two pass process :
 * - First correctly position the control element by computing
 *   its possible margin left offset + max width
 * - Use the re-renderer control element for positioning the icon
 * + Pre-compute shared styles and DOMRects between two passes */
export const applyInjectionStyles = (elements: InjectionElements) => {
    const { input, inputBox } = elements;
    cleanupInputInjectedStyles(input);

    const options = {
        inputBox,
        getInputStyle: createStyleCompute(input),
        getBoxStyle: createStyleCompute(inputBox),
    };

    applyIconInjectionStyles(elements, options);
};

export const createIcon = (field: FieldHandle, controlTag: string): InjectionElements => {
    const input = field.element as HTMLInputElement;
    const inputBox = field.boxElement;

    const control = createElement<ProtonPassControl>({ type: controlTag });
    const icon = createElement<HTMLButtonElement>({ type: 'button', classNames: [] });

    icon.tabIndex = -1;
    icon.style.zIndex = field.zIndex.toString();
    icon.setAttribute('type', 'button');

    const elements = { icon, control, input, inputBox, form: field.getFormHandle().element };
    const boxed = input !== inputBox;

    if (boxed) inputBox.insertBefore(control, inputBox.firstElementChild);
    else input.parentElement!.insertBefore(control, input);

    control.shadowRoot?.appendChild(icon);

    return elements;
};

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { c } from 'ttag';

import {
    FeatureCode,
    HotkeyTuple,
    Icon,
    SidebarList,
    SidebarListItemHeaderLink,
    SimpleSidebarListItemHeader,
    useConversationCounts,
    useFeature,
    useFolders,
    useHotkeys,
    useLabels,
    useLocalState,
    useMailSettings,
    useMessageCounts,
    useModalState,
    useUser,
} from '@proton/components';
import EditLabelModal from '@proton/components/containers/labels/modals/EditLabelModal';
import { APPS, MAILBOX_LABEL_IDS, SHOW_MOVED } from '@proton/shared/lib/constants';
import { scrollIntoView } from '@proton/shared/lib/helpers/dom';
import { buildTreeview } from '@proton/shared/lib/helpers/folder';
import { getItem, setItem } from '@proton/shared/lib/helpers/storage';
import { Folder, FolderWithSubFolders } from '@proton/shared/lib/interfaces/Folder';
import isTruthy from '@proton/utils/isTruthy';

import { getCounterMap } from '../../helpers/elements';
import { isConversationMode } from '../../helpers/mailSettings';
import { useDeepMemo } from '../../hooks/useDeepMemo';
import SidebarFolders from './SidebarFolders';
import SidebarItem from './SidebarItem';
import SidebarLabels from './SidebarLabels';

export type UnreadCounts = { [labelID: string]: number | undefined };

interface Props {
    labelID: string;
}

const formatFolderID = (folderID: string): string => `folder_expanded_state_${folderID}`;

const MailSidebarList = ({ labelID: currentLabelID }: Props) => {
    const location = useLocation();
    const [user] = useUser();
    const [conversationCounts] = useConversationCounts();
    const [messageCounts] = useMessageCounts();
    const [mailSettings] = useMailSettings();
    const [labels] = useLabels();
    const [folders, loadingFolders] = useFolders();
    const numFolders = folders?.length || 0;
    const numLabels = labels?.length || 0;
    // Use user.ID or item because in the tests user ID is undefined
    const [displayFolders, toggleFolders] = useLocalState(numFolders > 0, `${user.ID || 'item'}-display-folders`);
    const [displayLabels, toggleLabels] = useLocalState(numLabels > 0, `${user.ID || 'item'}-display-labels`);
    const [displayMoreItems, toggleDisplayMoreItems] = useLocalState(false, `${user.ID || 'item'}-display-more-items`);

    const { feature: scheduledFeature } = useFeature(FeatureCode.ScheduledSend);

    const sidebarRef = useRef<HTMLDivElement>(null);

    const [focusedItem, setFocusedItem] = useState<string | null>(null);

    const [foldersUI, setFoldersUI] = useState<Folder[]>([]);

    const [labelType, setLabelType] = useState<'label' | 'folder'>();
    const [editLabelProps, setEditLabelModalOpen] = useModalState();

    const foldersTreeview = useMemo(() => buildTreeview(foldersUI), [foldersUI]);

    useEffect(() => {
        if (folders) {
            setFoldersUI(
                folders.map((folder) => ({
                    ...folder,
                    Expanded: getItem(formatFolderID(folder.ID)) === 'false' ? 0 : 1,
                }))
            );
        }
    }, [folders]);

    const handleToggleFolder = useCallback(
        (folder: Folder, expanded: boolean) => {
            // Update view
            setFoldersUI(
                foldersUI.map((folderItem: Folder) => {
                    if (folderItem.ID === folder.ID) {
                        return {
                            ...folderItem,
                            Expanded: expanded ? 1 : 0,
                        };
                    }
                    return folderItem;
                })
            );

            // Save expanded state locally
            setItem(formatFolderID(folder.ID), `${expanded}`);
        },
        [foldersUI]
    );

    const treeviewReducer = (acc: string[], folder: FolderWithSubFolders) => {
        acc.push(folder.ID);

        if (folder.Expanded) {
            folder.subfolders?.forEach((folder) => treeviewReducer(acc, folder));
        }

        return acc;
    };

    const reduceFolderTreeview = useMemo(
        () => foldersTreeview.reduce((acc: string[], folder: FolderWithSubFolders) => treeviewReducer(acc, folder), []),
        [foldersTreeview]
    );

    const updateFocusItem = useCallback((item: string) => {
        setFocusedItem(item);
        const element = sidebarRef?.current?.querySelector(`[data-shortcut-target~="${item}"]`) as HTMLElement;
        // If the active element is already contained inside the item, don't re-focus the parent. This can happen when there's a button
        // inside the item which we want to take focus instead of the parent.
        if (document.activeElement === element || element.contains(document.activeElement)) {
            return;
        }
        element?.focus();
        scrollIntoView(element, { block: 'nearest' });
    }, []);

    const { ShowMoved } = mailSettings || { ShowMoved: 0 };

    const isConversation = isConversationMode(currentLabelID, mailSettings, location);

    const counterMap = useDeepMemo(() => {
        if (!mailSettings || !labels || !folders || !conversationCounts || !messageCounts) {
            return {};
        }

        const all = [...labels, ...folders];
        const labelCounterMap = getCounterMap(all, conversationCounts, messageCounts, mailSettings, location);
        const unreadCounterMap = Object.entries(labelCounterMap).reduce<UnreadCounts>((acc, [id, labelCount]) => {
            acc[id] = labelCount?.Unread;
            return acc;
        }, {});
        return unreadCounterMap;
    }, [mailSettings, labels, folders, conversationCounts, messageCounts, location]);

    const totalMessagesMap = useDeepMemo(() => {
        if (!mailSettings || !labels || !folders || !conversationCounts || !messageCounts) {
            return {};
        }

        const all = [...labels, ...folders];
        const labelCounterMap = getCounterMap(all, conversationCounts, messageCounts, mailSettings, location);
        const unreadCounterMap = Object.entries(labelCounterMap).reduce<UnreadCounts>((acc, [id, labelCount]) => {
            acc[id] = labelCount?.Total;
            return acc;
        }, {});
        return unreadCounterMap;
    }, [messageCounts, conversationCounts, labels, folders, mailSettings, location]);

    // show scheduled in sidebar if the user has scheduled messages
    const showScheduled = scheduledFeature?.Value && (totalMessagesMap[MAILBOX_LABEL_IDS.SCHEDULED] || 0) > 0;

    const getCommonProps = (labelID: string) => ({
        currentLabelID,
        labelID,
        isConversation,
        unreadCount: counterMap[labelID],
        totalMessagesCount: totalMessagesMap[labelID] || 0,
    });

    const handleOpenLabelModal = (labelType: 'label' | 'folder') => {
        setLabelType(labelType);
        setEditLabelModalOpen(true);
    };
    const sidebarListItems = useMemo(() => {
        const foldersArray = folders?.length ? reduceFolderTreeview : ['add-folder'];
        const labelsArray = labels?.length ? labels.map((f) => f.ID) : ['add-label'];

        return [
            'inbox',
            'drafts',
            showScheduled && 'scheduled',
            'sent',
            'starred',
            'toggle-more-items',
            displayMoreItems && ['archive', 'spam', 'trash', 'allmail'],
            'toggle-folders',
            displayFolders && foldersArray,
            'toggle-labels',
            displayLabels && labelsArray,
        ]
            .flat(1)
            .filter(isTruthy);
    }, [reduceFolderTreeview, folders, labels, showScheduled, displayFolders, displayLabels, displayMoreItems]);

    const shortcutHandlers: HotkeyTuple[] = [
        [
            'ArrowUp',
            (e) => {
                e.preventDefault();
                const currentIndex = sidebarListItems.indexOf(focusedItem || '');
                const previousIndex = currentIndex !== -1 ? Math.max(0, currentIndex - 1) : sidebarListItems.length - 1;
                updateFocusItem(sidebarListItems[previousIndex]);
            },
        ],
        [
            ['Meta', 'ArrowUp'],
            (e) => {
                e.preventDefault();
                updateFocusItem(sidebarListItems[0]);
            },
        ],
        [
            'ArrowDown',
            (e) => {
                e.preventDefault();
                const currentIndex = sidebarListItems.indexOf(focusedItem || '');
                const nextIndex = currentIndex !== -1 ? Math.min(sidebarListItems.length - 1, currentIndex + 1) : 0;
                updateFocusItem(sidebarListItems[nextIndex]);
            },
        ],
        [
            ['Meta', 'ArrowDown'],
            (e) => {
                e.preventDefault();
                updateFocusItem(sidebarListItems[sidebarListItems.length - 1]);
            },
        ],
        [
            'ArrowRight',
            () => {
                const element =
                    (document.querySelector(
                        '[data-shortcut-target="item-container"][data-shortcut-target-selected="true"]'
                    ) as HTMLElement) ||
                    (document.querySelector('[data-shortcut-target="item-container"]') as HTMLElement);
                element?.focus();
            },
        ],
    ];

    useHotkeys(sidebarRef, shortcutHandlers);

    return (
        <div ref={sidebarRef} tabIndex={-1} className="outline-none">
            <SidebarList>
                <SidebarItem
                    {...getCommonProps(MAILBOX_LABEL_IDS.INBOX)}
                    icon="inbox"
                    text={c('Link').t`Inbox`}
                    shortcutText="[G] [I]"
                    isFolder
                    id="inbox"
                    onFocus={setFocusedItem}
                />
                <SidebarItem
                    {...getCommonProps(
                        ShowMoved & SHOW_MOVED.DRAFTS ? MAILBOX_LABEL_IDS.ALL_DRAFTS : MAILBOX_LABEL_IDS.DRAFTS
                    )}
                    icon="file-lines"
                    text={c('Link').t`Drafts`}
                    shortcutText="[G] [D]"
                    isFolder
                    id="drafts"
                    onFocus={setFocusedItem}
                />
                {showScheduled ? (
                    <SidebarItem
                        {...getCommonProps(MAILBOX_LABEL_IDS.SCHEDULED)}
                        icon="clock"
                        text={c('Link').t`Scheduled`}
                        isFolder
                        id="scheduled"
                        onFocus={setFocusedItem}
                    />
                ) : null}
                <SidebarItem
                    {...getCommonProps(
                        ShowMoved & SHOW_MOVED.SENT ? MAILBOX_LABEL_IDS.ALL_SENT : MAILBOX_LABEL_IDS.SENT
                    )}
                    icon="paper-plane"
                    text={c('Link').t`Sent`}
                    shortcutText="[G] [E]"
                    isFolder
                    id="sent"
                    onFocus={setFocusedItem}
                />
                <SidebarItem
                    {...getCommonProps(MAILBOX_LABEL_IDS.STARRED)}
                    icon="star"
                    text={c('Link').t`Starred`}
                    shortcutText="[G] [*]"
                    isFolder={false}
                    id="starred"
                    onFocus={setFocusedItem}
                />
                <SimpleSidebarListItemHeader
                    toggle={displayMoreItems}
                    onToggle={(display: boolean) => toggleDisplayMoreItems(display)}
                    text={displayMoreItems ? c('Link').t`Less` : c('Link').t`More`}
                    title={displayMoreItems ? c('Link').t`Less` : c('Link').t`More`}
                    id="toggle-more-items"
                    onFocus={setFocusedItem}
                />
                {displayMoreItems && (
                    <>
                        <SidebarItem
                            {...getCommonProps(MAILBOX_LABEL_IDS.ARCHIVE)}
                            icon="archive-box"
                            text={c('Link').t`Archive`}
                            shortcutText="[G] [A]"
                            isFolder
                            id="archive"
                            onFocus={setFocusedItem}
                        />
                        <SidebarItem
                            {...getCommonProps(MAILBOX_LABEL_IDS.SPAM)}
                            icon="fire"
                            text={c('Link').t`Spam`}
                            shortcutText="[G] [S]"
                            isFolder
                            id="spam"
                            onFocus={setFocusedItem}
                        />
                        <SidebarItem
                            {...getCommonProps(MAILBOX_LABEL_IDS.TRASH)}
                            icon="trash"
                            text={c('Link').t`Trash`}
                            shortcutText="[G] [T]"
                            isFolder
                            id="trash"
                            onFocus={setFocusedItem}
                        />
                        <SidebarItem
                            {...getCommonProps(MAILBOX_LABEL_IDS.ALL_MAIL)}
                            icon="envelopes"
                            text={c('Link').t`All mail`}
                            shortcutText="[G] [M]"
                            isFolder
                            id="allmail"
                            onFocus={setFocusedItem}
                        />
                    </>
                )}
                <SimpleSidebarListItemHeader
                    toggle={displayFolders}
                    onToggle={(display: boolean) => toggleFolders(display)}
                    text={c('Link').t`Folders`}
                    title={c('Link').t`Folders`}
                    id="toggle-folders"
                    onFocus={setFocusedItem}
                    right={
                        displayFolders ? (
                            <div className="flex flex-align-items-center">
                                <button
                                    type="button"
                                    className="flex navigation-link-header-group-control flex-item-noshrink"
                                    onClick={() => handleOpenLabelModal('folder')}
                                    title={c('Action').t`Create a new folder`}
                                    data-testid="navigation-link:add-folder"
                                >
                                    <Icon name="plus" alt={c('Action').t`Create a new folder`} />
                                </button>
                                <SidebarListItemHeaderLink
                                    to="/mail/folders-labels"
                                    toApp={APPS.PROTONACCOUNT}
                                    icon="cog-wheel"
                                    title={c('Info').t`Manage your folders`}
                                    info={c('Link').t`Manage your folders`}
                                    target="_self"
                                    data-testid="navigation-link:folders-settings"
                                />
                            </div>
                        ) : undefined
                    }
                />
                {displayFolders && (
                    <SidebarFolders
                        currentLabelID={currentLabelID}
                        counterMap={counterMap}
                        folders={folders || []}
                        loadingFolders={loadingFolders}
                        updateFocusItem={updateFocusItem}
                        handleToggleFolder={handleToggleFolder}
                        foldersTreeview={foldersTreeview}
                    />
                )}
                <SimpleSidebarListItemHeader
                    toggle={displayLabels}
                    onToggle={(display: boolean) => toggleLabels(display)}
                    text={c('Link').t`Labels`}
                    title={c('Link').t`Labels`}
                    id="toggle-labels"
                    onFocus={setFocusedItem}
                    right={
                        displayLabels ? (
                            <div className="flex flex-align-items-center">
                                <button
                                    type="button"
                                    className="flex navigation-link-header-group-control flex-item-noshrink"
                                    onClick={() => handleOpenLabelModal('label')}
                                    title={c('Action').t`Create a new label`}
                                    data-testid="navigation-link:add-label"
                                >
                                    <Icon name="plus" alt={c('Action').t`Create a new label`} />
                                </button>
                                <SidebarListItemHeaderLink
                                    to="/mail/folders-labels"
                                    toApp={APPS.PROTONACCOUNT}
                                    icon="cog-wheel"
                                    title={c('Info').t`Manage your labels`}
                                    info={c('Link').t`Manage your labels`}
                                    target="_self"
                                    data-testid="navigation-link:labels-settings"
                                />
                            </div>
                        ) : undefined
                    }
                />
                {displayLabels && (
                    <SidebarLabels
                        currentLabelID={currentLabelID}
                        counterMap={counterMap}
                        labels={labels || []}
                        updateFocusItem={updateFocusItem}
                    />
                )}
            </SidebarList>

            <EditLabelModal type={labelType} {...editLabelProps} />
        </div>
    );
};

export default MailSidebarList;

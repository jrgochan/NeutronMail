/**
 * Feature flag list from Unleash
 * Format should be FeatureFlagName = 'FeatureFlagName'
 */
enum CommonFeatureFlag {
    ColorPerEventWeb = 'ColorPerEventWeb',
    AutoReloadPage = 'AutoReloadPage',
    DisableElectronMail = 'DisableElectronMail',
    KeyTransparencyShowUI = 'KeyTransparencyShowUI',
    KeyTransparencyLogOnly = 'KeyTransparencyLogOnly',
    CryptoDisableUndecryptableKeys = 'CryptoDisableUndecryptableKeys',
    CryptoCanaryOpenPGPjsV6 = 'CryptoCanaryOpenPGPjsV6',
    BreachesSecurityCenter = 'BreachesSecurityCenter',
    LockedState = 'LockedState',
    InboxUpsellFlow = 'InboxUpsellFlow',
    ABTestInboxUpsellStep = 'ABTestInboxUpsellStep',
    ABTestSubscriptionReminder = 'ABTestSubscriptionReminder',
    CalendarBusyTimeSlots = 'CalendarBusyTimeSlots',
    InboxDesktopMultiAccountSupport = 'InboxDesktopMultiAccountSupport',
}

enum AccountFlag {
    OrganizationIdentity = 'OrganizationIdentity',
    MailTrialOffer = 'MailTrialOffer',
    DriveTrialOffer = 'DriveTrialOffer',
    MaintenanceImporter = 'MaintenanceImporter',
    VisionarySignup = 'VisionarySignup',
    Chargebee = 'Chargebee',
    ChargebeeSignups = 'ChargebeeSignups',
    ChargebeeMigration = 'ChargebeeMigration',
    ChargebeeFreeToPaid = 'ChargebeeFreeToPaid',
    BreachesAccountDashboard = 'BreachesAccountDashboard',
    AddressDeletion = 'AddressDeletion',
    ScimTenantCreation = 'ScimTenantCreation',
    InboxDesktopInAppPayments = 'InboxDesktopInAppPayments',
    InboxDesktopThemeSelection = 'InboxDesktopThemeSelection',
    LightLabellingFeatureModal = 'LightLabellingFeatureModal',
    NewCancellationFlow = 'NewCancellationFlow',
    DisableLoginPageBugReport = 'DisableLoginPageBugReport',
    ShowNoRecoveryMethodFlow = 'ShowNoRecoveryMethodFlow',
    ForgotRecoveryMethodStep = 'ForgotRecoveryMethodStep',
}

enum CalendarFeatureFlag {
    EditSingleOccurrenceWeb = 'EditSingleOccurrenceWeb',
    // CancelSingleOccurrenceWeb = 'CancelSingleOccurrenceWeb', removed with proton-calendar@5.0.21.0, can be removed from Unleash when FU'd
}

enum DriveFeatureFlag {
    DrivePhotos = 'DrivePhotos',
    DrivePhotosUploadDisabled = 'DrivePhotosUploadDisabled',
    DriveSharingDevelopment = 'DriveSharingDevelopment',
    DriveDownloadScan = 'DriveDownloadScan',
    DriveDownloadScanDisabled = 'DriveDownloadScanDisabled',
    DriveWebOptimisticUploadEnabled = 'DriveWebOptimisticUploadEnabled',
    DriveDocs = 'DriveDocs',
    DriveDocsDisabled = 'DriveDocsDisabled',
    DocsAppSwitcher = 'DocsAppSwitcher',
}

enum MailFeatureFlag {
    AttachmentThumbnails = 'AttachmentThumbnails',
    WebMailPageSizeSetting = 'WebMailPageSizeSetting',
    SelectAll = 'SelectAll',
    SelectAllOptimistic = 'SelectAllOptimistic',
    ComposerAssistant = 'ComposerAssistant',
}

export type FeatureFlag =
    | `${CommonFeatureFlag}`
    | `${AccountFlag}`
    | `${CalendarFeatureFlag}`
    | `${DriveFeatureFlag}`
    | `${MailFeatureFlag}`;

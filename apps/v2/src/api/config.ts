// apps/v2/src/api/config.ts

/**
 * Config API Functions
 * Provides HTTP operations for fetching client and server configuration
 *
 * @module api/config
 */

//#region Imports

import { apiClient } from "./client";
import { getClientConfigUrl, getServerConfigUrl } from "./urls";

//#endregion

//#region Types

/**
 * Client configuration returned from the server
 * Contains version info, feature flags, and client-specific settings
 */
export type IClientConfig = {
  Version: string;
  BuildNumber: string;
  BuildDate: string;
  BuildHash: string;
  BuildHashEnterprise: string;
  BuildEnterpriseReady: string;
  SiteName: string;
  SiteURL: string;
  EnableCustomEmoji: string;
  EnableEmojiPicker: string;
  EnableGifPicker: string;
  GiphySdkKey: string;
  EnablePublicLink: string;
  EnableSVGs: string;
  EnableLatex: string;
  EnableInlineLatex: string;
  EnableMarketplace: string;
  EnableOpenTracing: string;
  EnableDiagnostics: string;
  EnableUserAccessTokens: string;
  EnableUserTypingMessages: string;
  EnableChannelViewedMessages: string;
  EnableCustomBrand: string;
  CustomBrandText: string;
  CustomDescriptionText: string;
  EnableLdap: string;
  EnableSaml: string;
  EnableSignUpWithEmail: string;
  EnableSignUpWithGitLab: string;
  EnableSignUpWithGoogle: string;
  EnableSignUpWithOffice365: string;
  EnableSignUpWithOpenId: string;
  EnableOAuthServiceProvider: string;
  EnableMultifactorAuthentication: string;
  EnforceMultifactorAuthentication: string;
  EnableComplianceExport: string;
  EnablePreviewFeatures: string;
  EnableTutorial: string;
  ExperimentalEnableDefaultChannelLeaveJoinMessages: string;
  ExperimentalGroupUnreadChannels: string;
  ExperimentalTimezone: string;
  LockTeammateNameDisplay: string;
  TeammateNameDisplay: string;
  PasswordMinimumLength: string;
  PasswordRequireLowercase: string;
  PasswordRequireUppercase: string;
  PasswordRequireNumber: string;
  PasswordRequireSymbol: string;
  CustomUrlSchemes: string;
  DiagnosticId: string;
  DiagnosticsEnabled: string;
  PluginsEnabled: string;
  HasImageProxy: string;
  CollapsedThreads: string;
  PostEditTimeLimit: string;
  CloseUnusedDirectMessages: string;
  EnableJoinLeaveMessageByDefault: string;
  EnablePostUsernameOverride: string;
  EnablePostIconOverride: string;
  ExperimentalChannelOrganization: string;
  ExperimentalChannelSidebarOrganization: string;
  SQLDriverName: string;
  HelpLink: string;
  TermsOfServiceLink: string;
  PrivacyPolicyLink: string;
  AboutLink: string;
  SupportEmail: string;
  ReportAProblemLink: string;
  EnableFileAttachments: string;
  EnableMobileFileDownload: string;
  EnableMobileFileUpload: string;
  MaxFileSize: string;
  MaxPostSize: string;
  WebsocketPort: string;
  WebsocketSecurePort: string;
  WebsocketURL: string;
  AllowCorsFrom: string;
  EnableBotAccountCreation: string;
  EnableUserDeactivation: string;
  RestrictDirectMessage: string;
  ExperimentalEnableAutomaticReplies: string;
  DefaultClientLocale: string;
  AvailableLocales: string;
  NativeAppSettings: IClientNativeAppSettings;
  FeatureFlags: Record<string, string>;
};

/**
 * Native app settings within client config
 */
export type IClientNativeAppSettings = {
  AppDownloadLink: string;
  AndroidAppDownloadLink: string;
  IosAppDownloadLink: string;
};

/**
 * Server configuration (admin only)
 * Contains full server settings and sensitive configuration
 */
export type IServerConfig = {
  ServiceSettings: IServiceSettings;
  TeamSettings: ITeamSettings;
  SqlSettings: ISqlSettings;
  LogSettings: ILogSettings;
  NotificationLogSettings: INotificationLogSettings;
  PasswordSettings: IPasswordSettings;
  FileSettings: IFileSettings;
  EmailSettings: IEmailSettings;
  RateLimitSettings: IRateLimitSettings;
  PrivacySettings: IPrivacySettings;
  SupportSettings: ISupportSettings;
  AnnouncementSettings: IAnnouncementSettings;
  ThemeSettings: IThemeSettings;
  LocalizationSettings: ILocalizationSettings;
  SamlSettings: ISamlSettings;
  NativeAppSettings: INativeAppSettings;
  ClusterSettings: IClusterSettings;
  MetricsSettings: IMetricsSettings;
  AnalyticsSettings: IAnalyticsSettings;
  ComplianceSettings: IComplianceSettings;
  LdapSettings: ILdapSettings;
  PluginSettings: IPluginSettings;
  DataRetentionSettings: IDataRetentionSettings;
  MessageExportSettings: IMessageExportSettings;
  JobSettings: IJobSettings;
  ElasticsearchSettings: IElasticsearchSettings;
  BleveSettings: IBleveSettings;
  ExperimentalSettings: IExperimentalSettings;
  DisplaySettings: IDisplaySettings;
  GuestAccountsSettings: IGuestAccountsSettings;
  ImageProxySettings: IImageProxySettings;
  FeatureFlags: Record<string, string>;
};

/**
 * Service settings subset of server config
 */
export type IServiceSettings = {
  SiteURL: string;
  WebsocketURL: string;
  LicenseFileLocation: string;
  ListenAddress: string;
  ConnectionSecurity: string;
  TLSCertFile: string;
  TLSKeyFile: string;
  UseLetsEncrypt: boolean;
  LetsEncryptCertificateCacheFile: string;
  Forward80To443: boolean;
  ReadTimeout: number;
  WriteTimeout: number;
  MaximumLoginAttempts: number;
  GoogleDeveloperKey: string;
  EnableOAuthServiceProvider: boolean;
  EnableIncomingWebhooks: boolean;
  EnableOutgoingWebhooks: boolean;
  EnableCommands: boolean;
  EnablePostUsernameOverride: boolean;
  EnablePostIconOverride: boolean;
  EnableBotAccountCreation: boolean;
  EnableUserAccessTokens: boolean;
  EnableLinkPreviews: boolean;
  EnableTesting: boolean;
  EnableDeveloper: boolean;
  EnableSecurityFixAlert: boolean;
  EnableInsecureOutgoingConnections: boolean;
  AllowedUntrustedInternalConnections: string;
  EnableMultifactorAuthentication: boolean;
  EnforceMultifactorAuthentication: boolean;
  EnableUserStatuses: boolean;
  SessionLengthWebInDays: number;
  SessionLengthMobileInDays: number;
  SessionLengthSSOInDays: number;
  SessionCacheInMinutes: number;
  SessionIdleTimeoutInMinutes: number;
  WebsocketSecurePort: number;
  WebsocketPort: number;
  AllowCorsFrom: string;
  CorsExposedHeaders: string;
  AllowCookiesForSubdomains: boolean;
  SessionLengthWebInHours: number;
  SessionLengthMobileInHours: number;
  SessionLengthSSOInHours: number;
  ExtendSessionLengthWithActivity: boolean;
  TerminateSessionsOnPasswordChange: boolean;
  TimeBetweenUserTypingUpdatesMilliseconds: number;
  EnablePostSearch: boolean;
  MinimumHashtagLength: number;
  EnableUserTypingMessages: boolean;
  EnableChannelViewedMessages: boolean;
  ClusterLogTimeoutMilliseconds: number;
  EnablePreviewFeatures: boolean;
  CloseUnusedDirectMessages: boolean;
  EnableTutorial: boolean;
  ExperimentalEnableDefaultChannelLeaveJoinMessages: boolean;
  ExperimentalGroupUnreadChannels: string;
  EnableAPITeamDeletion: boolean;
  ExperimentalEnableHardenedMode: boolean;
  ExperimentalStrictCSRFEnforcement: boolean;
  EnableEmailInvitations: boolean;
  DisableBotsWhenOwnerIsDeactivated: boolean;
  RestrictLinkPreviews: string;
  EnableSVGs: boolean;
  EnableLatex: boolean;
  EnableInlineLatex: boolean;
  EnableLocalMode: boolean;
  LocalModeSocketLocation: string;
  ThreadAutoFollow: boolean;
  CollapsedThreads: string;
  ManagedResourcePaths: string;
  EnableCustomGroups: boolean;
};

/**
 * Team settings subset of server config
 */
export type ITeamSettings = {
  SiteName: string;
  MaxUsersPerTeam: number;
  EnableTeamCreation: boolean;
  EnableUserCreation: boolean;
  EnableOpenServer: boolean;
  RestrictCreationToDomains: string;
  EnableCustomBrand: boolean;
  CustomBrandText: string;
  CustomDescriptionText: string;
  RestrictDirectMessage: string;
  UserStatusAwayTimeout: number;
  MaxChannelsPerTeam: number;
  MaxNotificationsPerChannel: number;
  EnableConfirmNotificationsToChannel: boolean;
  TeammateNameDisplay: string;
  ExperimentalViewArchivedChannels: boolean;
  ExperimentalEnableAutomaticReplies: boolean;
  ExperimentalHideTownSquareinLHS: boolean;
  ExperimentalTownSquareIsReadOnly: boolean;
  LockTeammateNameDisplay: boolean;
  ExperimentalPrimaryTeam: string;
  ExperimentalDefaultChannels: string[];
};

/**
 * SQL settings subset of server config
 */
export type ISqlSettings = {
  DriverName: string;
  DataSource: string;
  DataSourceReplicas: string[];
  DataSourceSearchReplicas: string[];
  MaxIdleConns: number;
  ConnMaxLifetimeMilliseconds: number;
  ConnMaxIdleTimeMilliseconds: number;
  MaxOpenConns: number;
  Trace: boolean;
  AtRestEncryptKey: string;
  QueryTimeout: number;
  DisableDatabaseSearch: boolean;
  ReplicaLagSettings: unknown[];
};

/**
 * Log settings subset of server config
 */
export type ILogSettings = {
  EnableConsole: boolean;
  ConsoleLevel: string;
  ConsoleJson: boolean;
  EnableColor: boolean;
  EnableFile: boolean;
  FileLevel: string;
  FileJson: boolean;
  FileLocation: string;
  EnableWebhookDebugging: boolean;
  EnableDiagnostics: boolean;
  VerboseDiagnostics: boolean;
  AdvancedLoggingJSON: string;
  AdvancedLoggingConfig: string;
  MaxFieldSize: number;
};

/**
 * Notification log settings subset of server config
 */
export type INotificationLogSettings = {
  EnableConsole: boolean;
  ConsoleLevel: string;
  ConsoleJson: boolean;
  EnableColor: boolean;
  EnableFile: boolean;
  FileLevel: string;
  FileJson: boolean;
  FileLocation: string;
  AdvancedLoggingJSON: string;
  AdvancedLoggingConfig: string;
};

/**
 * Password settings subset of server config
 */
export type IPasswordSettings = {
  MinimumLength: number;
  Lowercase: boolean;
  Number: boolean;
  Uppercase: boolean;
  Symbol: boolean;
};

/**
 * File settings subset of server config
 */
export type IFileSettings = {
  EnableFileAttachments: boolean;
  EnableMobileUpload: boolean;
  EnableMobileDownload: boolean;
  MaxFileSize: number;
  MaxImageResolution: number;
  MaxImageDecoderConcurrency: number;
  DriverName: string;
  Directory: string;
  EnablePublicLink: boolean;
  ExtractContent: boolean;
  ArchiveRecursion: boolean;
  PublicLinkSalt: string;
  InitialFont: string;
  AmazonS3AccessKeyId: string;
  AmazonS3SecretAccessKey: string;
  AmazonS3Bucket: string;
  AmazonS3PathPrefix: string;
  AmazonS3Region: string;
  AmazonS3Endpoint: string;
  AmazonS3SSL: boolean;
  AmazonS3SignV2: boolean;
  AmazonS3SSE: boolean;
  AmazonS3Trace: boolean;
  AmazonS3RequestTimeoutMilliseconds: number;
};

/**
 * Email settings subset of server config
 */
export type IEmailSettings = {
  EnableSignUpWithEmail: boolean;
  EnableSignInWithEmail: boolean;
  EnableSignInWithUsername: boolean;
  SendEmailNotifications: boolean;
  UseChannelInEmailNotifications: boolean;
  RequireEmailVerification: boolean;
  FeedbackName: string;
  FeedbackEmail: string;
  ReplyToAddress: string;
  FeedbackOrganization: string;
  EnableSMTPAuth: boolean;
  SMTPUsername: string;
  SMTPPassword: string;
  SMTPServer: string;
  SMTPPort: string;
  SMTPServerTimeout: number;
  ConnectionSecurity: string;
  SendPushNotifications: boolean;
  PushNotificationServer: string;
  PushNotificationContents: string;
  PushNotificationBuffer: number;
  EnableEmailBatching: boolean;
  EmailBatchingBufferSize: number;
  EmailBatchingInterval: number;
  EnablePreviewModeBanner: boolean;
  SkipServerCertificateVerification: boolean;
  EmailNotificationContentsType: string;
  LoginButtonColor: string;
  LoginButtonBorderColor: string;
  LoginButtonTextColor: string;
};

/**
 * Rate limit settings subset of server config
 */
export type IRateLimitSettings = {
  Enable: boolean;
  PerSec: number;
  MaxBurst: number;
  MemoryStoreSize: number;
  VaryByRemoteAddr: boolean;
  VaryByUser: boolean;
  VaryByHeader: string;
};

/**
 * Privacy settings subset of server config
 */
export type IPrivacySettings = {
  ShowEmailAddress: boolean;
  ShowFullName: boolean;
};

/**
 * Support settings subset of server config
 */
export type ISupportSettings = {
  TermsOfServiceLink: string;
  PrivacyPolicyLink: string;
  AboutLink: string;
  HelpLink: string;
  ReportAProblemLink: string;
  SupportEmail: string;
  CustomTermsOfServiceEnabled: boolean;
  CustomTermsOfServiceReAcceptancePeriod: number;
  EnableAskCommunityLink: boolean;
};

/**
 * Announcement settings subset of server config
 */
export type IAnnouncementSettings = {
  EnableBanner: boolean;
  BannerText: string;
  BannerColor: string;
  BannerTextColor: string;
  AllowBannerDismissal: boolean;
  AdminNoticesEnabled: boolean;
  UserNoticesEnabled: boolean;
  NoticesURL: string;
  NoticesFetchFrequency: number;
  NoticesSkipCache: boolean;
};

/**
 * Theme settings subset of server config
 */
export type IThemeSettings = {
  EnableThemeSelection: boolean;
  DefaultTheme: string;
  AllowCustomThemes: boolean;
  AllowedThemes: string[];
};

/**
 * Localization settings subset of server config
 */
export type ILocalizationSettings = {
  DefaultServerLocale: string;
  DefaultClientLocale: string;
  AvailableLocales: string;
};

/**
 * SAML settings subset of server config
 */
export type ISamlSettings = {
  Enable: boolean;
  EnableSyncWithLdap: boolean;
  EnableSyncWithLdapIncludeAuth: boolean;
  IgnoreGuestsLdapSync: boolean;
  Verify: boolean;
  Encrypt: boolean;
  SignRequest: boolean;
  IdpUrl: string;
  IdpDescriptorUrl: string;
  IdpMetadataUrl: string;
  ServiceProviderIdentifier: string;
  AssertionConsumerServiceURL: string;
  SignatureAlgorithm: string;
  CanonicalAlgorithm: string;
  ScopingIDPProviderId: string;
  ScopingIDPName: string;
  IdpCertificateFile: string;
  PublicCertificateFile: string;
  PrivateKeyFile: string;
  IdAttribute: string;
  GuestAttribute: string;
  EnableAdminAttribute: boolean;
  AdminAttribute: string;
  FirstNameAttribute: string;
  LastNameAttribute: string;
  EmailAttribute: string;
  UsernameAttribute: string;
  NicknameAttribute: string;
  LocaleAttribute: string;
  PositionAttribute: string;
  LoginButtonText: string;
  LoginButtonColor: string;
  LoginButtonBorderColor: string;
  LoginButtonTextColor: string;
};

/**
 * Native app settings subset of server config
 */
export type INativeAppSettings = {
  AppCustomURLSchemes: string[];
  AppDownloadLink: string;
  AndroidAppDownloadLink: string;
  IosAppDownloadLink: string;
};

/**
 * Cluster settings subset of server config
 */
export type IClusterSettings = {
  Enable: boolean;
  ClusterName: string;
  OverrideHostname: string;
  NetworkInterface: string;
  BindAddress: string;
  AdvertiseAddress: string;
  UseIpAddress: boolean;
  EnableGossipCompression: boolean;
  EnableExperimentalGossipEncryption: boolean;
  ReadOnlyConfig: boolean;
  GossipPort: number;
  StreamingPort: number;
  MaxIdleConns: number;
  MaxIdleConnsPerHost: number;
  IdleConnTimeoutMilliseconds: number;
};

/**
 * Metrics settings subset of server config
 */
export type IMetricsSettings = {
  Enable: boolean;
  BlockProfileRate: number;
  ListenAddress: string;
};

/**
 * Analytics settings subset of server config
 */
export type IAnalyticsSettings = {
  MaxUsersForStatistics: number;
};

/**
 * Compliance settings subset of server config
 */
export type IComplianceSettings = {
  Enable: boolean;
  Directory: string;
  EnableDaily: boolean;
  BatchSize: number;
};

/**
 * LDAP settings subset of server config
 */
export type ILdapSettings = {
  Enable: boolean;
  EnableSync: boolean;
  LdapServer: string;
  LdapPort: number;
  ConnectionSecurity: string;
  BaseDN: string;
  BindUsername: string;
  BindPassword: string;
  UserFilter: string;
  GroupFilter: string;
  GuestFilter: string;
  EnableAdminFilter: boolean;
  AdminFilter: string;
  GroupDisplayNameAttribute: string;
  GroupIdAttribute: string;
  FirstNameAttribute: string;
  LastNameAttribute: string;
  EmailAttribute: string;
  UsernameAttribute: string;
  NicknameAttribute: string;
  IdAttribute: string;
  PositionAttribute: string;
  LoginIdAttribute: string;
  PictureAttribute: string;
  SyncIntervalMinutes: number;
  SkipCertificateVerification: boolean;
  PublicCertificateFile: string;
  PrivateKeyFile: string;
  QueryTimeout: number;
  MaxPageSize: number;
  LoginFieldName: string;
  LoginButtonColor: string;
  LoginButtonBorderColor: string;
  LoginButtonTextColor: string;
  Trace: boolean;
};

/**
 * Plugin settings subset of server config
 */
export type IPluginSettings = {
  Enable: boolean;
  EnableUploads: boolean;
  AllowInsecureDownloadUrl: boolean;
  EnableHealthCheck: boolean;
  Directory: string;
  ClientDirectory: string;
  Plugins: Record<string, unknown>;
  PluginStates: Record<string, { Enable: boolean }>;
  EnableMarketplace: boolean;
  EnableRemoteMarketplace: boolean;
  AutomaticPrepackagedPlugins: boolean;
  RequirePluginSignature: boolean;
  MarketplaceUrl: string;
  SignaturePublicKeyFiles: string[];
  ChimeraOAuthProxyUrl: string;
};

/**
 * Data retention settings subset of server config
 */
export type IDataRetentionSettings = {
  EnableMessageDeletion: boolean;
  EnableFileDeletion: boolean;
  EnableBoardsDeletion: boolean;
  MessageRetentionDays: number;
  FileRetentionDays: number;
  BoardsRetentionDays: number;
  DeletionJobStartTime: string;
  BatchSize: number;
  TimeBetweenBatchesMilliseconds: number;
  RetentionIdsBatchSize: number;
};

/**
 * Message export settings subset of server config
 */
export type IMessageExportSettings = {
  EnableExport: boolean;
  ExportFormat: string;
  DailyRunTime: string;
  ExportFromTimestamp: number;
  BatchSize: number;
  DownloadExportResults: boolean;
  GlobalRelaySettings: IGlobalRelaySettings;
};

/**
 * Global relay settings for message export
 */
export type IGlobalRelaySettings = {
  CustomerType: string;
  SmtpUsername: string;
  SmtpPassword: string;
  EmailAddress: string;
  SMTPServerTimeout: number;
};

/**
 * Job settings subset of server config
 */
export type IJobSettings = {
  RunJobs: boolean;
  RunScheduler: boolean;
  CleanupJobsThresholdDays: number;
  CleanupConfigThresholdDays: number;
};

/**
 * Elasticsearch settings subset of server config
 */
export type IElasticsearchSettings = {
  ConnectionUrl: string;
  Username: string;
  Password: string;
  EnableIndexing: boolean;
  EnableSearching: boolean;
  EnableAutocomplete: boolean;
  Sniff: boolean;
  PostIndexReplicas: number;
  PostIndexShards: number;
  ChannelIndexReplicas: number;
  ChannelIndexShards: number;
  UserIndexReplicas: number;
  UserIndexShards: number;
  AggregatePostsAfterDays: number;
  PostsAggregatorJobStartTime: string;
  IndexPrefix: string;
  LiveIndexingBatchSize: number;
  BulkIndexingTimeWindowSeconds: number;
  RequestTimeoutSeconds: number;
  SkipTLSVerification: boolean;
  CA: string;
  ClientCert: string;
  ClientKey: string;
  Trace: string;
};

/**
 * Bleve settings subset of server config
 */
export type IBleveSettings = {
  IndexDir: string;
  EnableIndexing: boolean;
  EnableSearching: boolean;
  EnableAutocomplete: boolean;
  BulkIndexingTimeWindowSeconds: number;
};

/**
 * Experimental settings subset of server config
 */
export type IExperimentalSettings = {
  ClientSideCertEnable: boolean;
  ClientSideCertCheck: string;
  LinkMetadataTimeoutMilliseconds: number;
  RestrictSystemAdmin: boolean;
  UseNewSAMLLibrary: boolean;
  CloudUserLimit: number;
  CloudBilling: boolean;
  EnableSharedChannels: boolean;
  EnableRemoteClusterService: boolean;
  DelayChannelAutocomplete: boolean;
  DisableAppBar: boolean;
  PatchPluginsReactDOM: boolean;
};

/**
 * Display settings subset of server config
 */
export type IDisplaySettings = {
  ExperimentalTimezone: boolean;
  CustomUrlSchemes: string[];
};

/**
 * Guest accounts settings subset of server config
 */
export type IGuestAccountsSettings = {
  Enable: boolean;
  AllowEmailAccounts: boolean;
  EnforceMultifactorAuthentication: boolean;
  RestrictCreationToDomains: string;
};

/**
 * Image proxy settings subset of server config
 */
export type IImageProxySettings = {
  Enable: boolean;
  ImageProxyType: string;
  RemoteImageProxyURL: string;
  RemoteImageProxyOptions: string;
};

//#endregion

//#region API Functions

/**
 * Fetch client configuration
 * Available to all authenticated users
 * @returns Client configuration object
 */
export async function getClientConfig(): Promise<IClientConfig> {
  return apiClient.get<IClientConfig>(getClientConfigUrl());
}

/**
 * Fetch server configuration (admin only)
 * Requires system admin permissions
 * @returns Full server configuration object
 */
export async function getServerConfig(): Promise<IServerConfig> {
  return apiClient.get<IServerConfig>(getServerConfigUrl());
}

//#endregion

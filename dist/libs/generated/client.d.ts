import { GraphQLClient } from "graphql-request";
export declare type Maybe<T> = T | null;
export declare type Exact<T extends {
    [key: string]: unknown;
}> = {
    [K in keyof T]: T[K];
};
export declare type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
export declare type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    /** ISO-8601 Format DateTime */
    Date: any;
    /** The `Upload` scalar type represents a file upload. */
    Upload: any;
    /** [Int] Limitation of query results. range is 1..50 */
    first: any;
    /** [Int] offset of query results. range is 0<= */
    skip: any;
}
export interface DeviceDeleteAccessTokenInput {
    obniz?: Maybe<DeviceDeleteAccessTokenInputDevice>;
}
export interface DeviceDeleteAccessTokenInputDevice {
    /** obnizID */
    id: Scalars["String"];
}
export interface DeviceGenerateAccessTokenInput {
    obniz?: Maybe<DeviceGenerateAccessTokenInputDevice>;
}
export interface DeviceGenerateAccessTokenInputDevice {
    /** obnizID */
    id: Scalars["String"];
}
/** Root of api.obniz.com graphql api endpoint mutations */
export interface Mutation {
    __typename?: "Mutation";
    /** Create New Event */
    createEvent?: Maybe<Event>;
    /** Update Exist Event */
    updateEvent?: Maybe<Event>;
    /** Delete Exist Event */
    deleteEvent: Scalars["ID"];
    /** Create New Device */
    createDevice?: Maybe<Device>;
    /** Registration New Device */
    registrateDevice?: Maybe<Device>;
    /** Update Device */
    updateDevice?: Maybe<Device>;
    /** Generate Device Access Token */
    generateDeviceAccessToken?: Maybe<Device>;
    /** Delete Device Access Token */
    deleteDeviceAccessToken?: Maybe<Device>;
    /** Edit Settings For Installed App */
    updateDeviceSettingsForInstalledApp?: Maybe<Device>;
    /** Install App To Device */
    installApp?: Maybe<Device>;
    /** Install App To Device */
    uninstallApp?: Maybe<Device>;
    updateStatusOperationSetting?: Maybe<UpdateStatusOperationSettingResult>;
    createOperationResult?: Maybe<OperationResult>;
    removeOperationResult?: Maybe<RemoveOperationResultResponse>;
}
/** Root of api.obniz.com graphql api endpoint mutations */
export interface MutationCreateEventArgs {
    event: EventCreateInput;
}
/** Root of api.obniz.com graphql api endpoint mutations */
export interface MutationUpdateEventArgs {
    event: EventUpdateInput;
}
/** Root of api.obniz.com graphql api endpoint mutations */
export interface MutationDeleteEventArgs {
    id: Scalars["ID"];
}
/** Root of api.obniz.com graphql api endpoint mutations */
export interface MutationCreateDeviceArgs {
    device: DeviceCreateInput;
}
/** Root of api.obniz.com graphql api endpoint mutations */
export interface MutationRegistrateDeviceArgs {
    device: DeviceRegistrateInput;
}
/** Root of api.obniz.com graphql api endpoint mutations */
export interface MutationUpdateDeviceArgs {
    device: DeviceUpdateInput;
}
/** Root of api.obniz.com graphql api endpoint mutations */
export interface MutationGenerateDeviceAccessTokenArgs {
    device: DeviceGenerateAccessTokenInput;
}
/** Root of api.obniz.com graphql api endpoint mutations */
export interface MutationDeleteDeviceAccessTokenArgs {
    device: DeviceDeleteAccessTokenInput;
}
/** Root of api.obniz.com graphql api endpoint mutations */
export interface MutationUpdateDeviceSettingsForInstalledAppArgs {
    edit: DeviceInstalledAppSettingsInput;
}
/** Root of api.obniz.com graphql api endpoint mutations */
export interface MutationInstallAppArgs {
    install: AppInstallInput;
}
/** Root of api.obniz.com graphql api endpoint mutations */
export interface MutationUninstallAppArgs {
    uninstall: AppUninstallInput;
}
/** Root of api.obniz.com graphql api endpoint mutations */
export interface MutationUpdateStatusOperationSettingArgs {
    operationSettingId: Scalars["ID"];
}
/** Root of api.obniz.com graphql api endpoint mutations */
export interface MutationCreateOperationResultArgs {
    operationResult: CreateOperationResultInput;
}
/** Root of api.obniz.com graphql api endpoint mutations */
export interface MutationRemoveOperationResultArgs {
    operationSettingId: Scalars["ID"];
}
/** Root of api.obniz.com graphql api endpoint queries */
export interface Query {
    __typename?: "Query";
    /** My WebApp Configration on obniz.com regarding accessToken. */
    webapp?: Maybe<Webapp>;
    /** My App Configration on obniz.com regarding accessToken. */
    app?: Maybe<App>;
    /** User information which is authorized for current Access Token. */
    user?: Maybe<User>;
    /** Devices a user has */
    devices?: Maybe<DeviceConnection>;
    /** User Configured Serverless Events */
    events?: Maybe<EventConnection>;
    /** Registrated obniz hardware list on obniz Cloud */
    hardwares: Array<Maybe<Hardware>>;
    /** obnizOS versions on obniz Cloud for queried hardware */
    os: Array<Maybe<Os>>;
    /** Query App event history. */
    appEvents?: Maybe<AppEvents>;
    operations?: Maybe<OperationsConnection>;
    operationSettings?: Maybe<OperationSettingsConnection>;
    operationResults?: Maybe<OperationResultsConnection>;
    /** Token permission. */
    token?: Maybe<Token>;
}
/** Root of api.obniz.com graphql api endpoint queries */
export interface QueryDevicesArgs {
    first?: Maybe<Scalars["first"]>;
    skip?: Maybe<Scalars["skip"]>;
    id?: Maybe<Scalars["String"]>;
    hw?: Maybe<Scalars["String"]>;
    app?: Maybe<Scalars["Int"]>;
    status?: Maybe<Scalars["String"]>;
    created?: Maybe<Scalars["String"]>;
    sort?: Maybe<Scalars["String"]>;
    order?: Maybe<Scalars["String"]>;
}
/** Root of api.obniz.com graphql api endpoint queries */
export interface QueryEventsArgs {
    first?: Maybe<Scalars["first"]>;
    skip?: Maybe<Scalars["skip"]>;
}
/** Root of api.obniz.com graphql api endpoint queries */
export interface QueryOsArgs {
    hardware: Scalars["String"];
}
/** Root of api.obniz.com graphql api endpoint queries */
export interface QueryAppEventsArgs {
    first?: Maybe<Scalars["first"]>;
    skip?: Maybe<Scalars["skip"]>;
}
/** Root of api.obniz.com graphql api endpoint queries */
export interface QueryOperationsArgs {
    id?: Maybe<Scalars["Int"]>;
    facilityName?: Maybe<Scalars["String"]>;
}
/** Root of api.obniz.com graphql api endpoint queries */
export interface QueryOperationSettingsArgs {
    first?: Maybe<Scalars["first"]>;
    operationId?: Maybe<Scalars["ID"]>;
    status?: Maybe<Scalars["Int"]>;
}
/** Root of api.obniz.com graphql api endpoint queries */
export interface QueryOperationResultsArgs {
    first?: Maybe<Scalars["first"]>;
    operationId?: Maybe<Scalars["ID"]>;
    operationSettingId?: Maybe<Scalars["ID"]>;
}
/** App object. This contains app information which created on obniz.com as App */
export interface App {
    __typename?: "app";
    /** Unique Identifier of app */
    id: Scalars["ID"];
    /** English Title of app */
    title: Scalars["String"];
    /** English Description */
    short_body: Scalars["String"];
    /** Type of app. */
    type: Scalars["String"];
    /** Current Status on obniz.com app on explore */
    store_status: Scalars["String"];
    /** Query Installs for an App. */
    installs?: Maybe<AppInstallConnection>;
}
/** App object. This contains app information which created on obniz.com as App */
export interface AppInstallsArgs {
    first?: Maybe<Scalars["first"]>;
    skip?: Maybe<Scalars["skip"]>;
}
export interface AppConfigInput {
    key: Scalars["String"];
    value: Scalars["String"];
}
/** This contains information that was sent by the webhook in the past. */
export interface AppEvent {
    __typename?: "appEvent";
    /** Unique Identifier of webhook for webapp */
    id: Scalars["Int"];
    /** The date and time the webhook was sent. */
    createdAt: Scalars["String"];
    /** Type of event, */
    type: Scalars["String"];
    app: AppEventApp;
    payload: AppEventPayload;
}
export interface AppEventApp {
    __typename?: "appEventApp";
    /** Unique Identifier of webapp */
    id: Scalars["ID"];
}
/** Contains any of the following objects. */
export interface AppEventPayload {
    __typename?: "appEventPayload";
    user?: Maybe<User>;
    device?: Maybe<Device>;
}
/** Connection of Device */
export interface AppEvents {
    __typename?: "appEvents";
    /** Total Count of device edges */
    totalCount: Scalars["Int"];
    /** Page Information */
    pageInfo: PageInfo;
    /** Events */
    events: Array<Maybe<AppEvent>>;
}
/** Connection of Install */
export interface AppInstallConnection {
    __typename?: "appInstallConnection";
    /** Total Count of device edges */
    totalCount: Scalars["Int"];
    /** Page Information */
    pageInfo: PageInfo;
    /** Edges */
    edges: Array<Maybe<AppInstallEdge>>;
}
/** Install Edge */
export interface AppInstallEdge {
    __typename?: "appInstallEdge";
    /** Cursor */
    node?: Maybe<Installed_Device>;
}
export interface AppInstallInput {
    obniz?: Maybe<AppInstallInputDevice>;
    app?: Maybe<AppInstallInputApp>;
}
export interface AppInstallInputApp {
    /** appID */
    id: Scalars["ID"];
    config: AppConfigInput[];
}
export interface AppInstallInputDevice {
    /** obnizID */
    id: Scalars["ID"];
}
export interface AppUninstallInput {
    obniz?: Maybe<AppUninstallInputDevice>;
}
export interface AppUninstallInputDevice {
    /** obnizID */
    id: Scalars["String"];
}
export interface CreateOperationResultInput {
    /** Operation setting ID. */
    operationSettingId: Scalars["ID"];
    /** Obniz ID. Format can be both xxxx-xxxx and xxxxxxxx. */
    obnizId?: Maybe<Scalars["String"]>;
    /** Time when a device setting is written onto an obniz. */
    successfullyWrittenAt?: Maybe<Scalars["Date"]>;
    /** Time when an obniz became online. */
    becomeOnlineAt?: Maybe<Scalars["Date"]>;
    /** Binary data of operation picture. */
    picBinary?: Maybe<Scalars["Upload"]>;
    /** Location note. */
    locationNote?: Maybe<Scalars["String"]>;
    /**
     * Type of operation error. Possibities:
     *
     *             - No error -> 0
     *             - Gateway not found -> 1
     *             - Found multi gateway -> 2
     *             - Cannot connect to gateway -> 3
     *             - Gateway cannot connect the wifi -> 4
     *
     *             - Invalid ssid or password -> 5
     *             - Cannot resolve dns -> 6
     *             - Cannot go out to the internet -> 7
     *             - Cannot communicate with gateway -> 8
     */
    typeError: Scalars["Int"];
}
/** Device information */
export interface Device {
    __typename?: "device";
    /** Unique Identifier like "0000-0000" */
    id: Scalars["ID"];
    /** Access Token */
    access_token?: Maybe<Scalars["String"]>;
    /**
     * Description
     *
     *       Same value are exist on metadata.description
     */
    description: Scalars["String"];
    /**
     * User Defined Metadata JSON string
     *
     *       Useful for labeling device location or attached machine.
     */
    metadata: Scalars["String"];
    /**
     * DeviceKey
     *
     *       String representation of DeviceKey which installed or to be installed on the device.
     */
    devicekey?: Maybe<Scalars["String"]>;
    /**
     * Hardware Identifier
     *
     *       'obnizb1': obniz Board
     *
     *       'obnizb2': obniz Board 1Y
     *
     *       'm5stickc': M5StickC
     *
     *       'esp32w': obnizOS for ESP32
     *
     *       'esp32p': obnizOS for ESP32 on ESP32-PICO
     *
     *       'encored': obniz BLE/Wi-Fi Gateway
     */
    hardware: Scalars["String"];
    /**
     * OS Identifier
     *
     *       'obnizb1': obniz Board
     *
     *       'obnizb2': obniz Board 1Y
     *
     *       'm5stickc': M5StickC
     *
     *       'esp32w': obnizOS for ESP32
     *
     *       'encored': obniz BLE/Wi-Fi Gateway
     */
    os: Scalars["String"];
    /** Last time recognized os version like '1.0.0' */
    osVersion: Scalars["String"];
    /**
     * Server Region
     *
     *       'jp': Japan(East Asia)
     *
     *       'us': United States of America(West-America)
     */
    region: Scalars["String"];
    /**
     * Status
     *
     *       'active': activated
     *
     *       'inactive': inactivated
     */
    status: Scalars["String"];
    /** Installed time */
    createdAt: Scalars["Date"];
    /** User information which is authorized for current Access Token. */
    user?: Maybe<User>;
    /** JSON Representation of Installed app configration */
    configs: Scalars["String"];
}
/** Connection of Device */
export interface DeviceConnection {
    __typename?: "deviceConnection";
    /** Total Count of device edges */
    totalCount: Scalars["Int"];
    /** Page Information */
    pageInfo: PageInfo;
    /** Edges */
    edges: Array<Maybe<DeviceEdge>>;
}
export interface DeviceCreateInput {
    /**
     * Hardware Identifier
     *
     *       'esp32w': obnizOS for ESP32
     *
     *       'esp32p': obnizOS for ESP32 on ESP32-PICO
     */
    hardware: Scalars["String"];
    /**
     * Server Region
     *
     *       'jp': Japan(East Asia)
     *
     *       'us': United States of America(West-America)
     */
    region?: Maybe<Scalars["String"]>;
    /**
     * Description
     *
     *       User Defined Metadata. Useful for labeling device location or attached machine.
     */
    description?: Maybe<Scalars["String"]>;
    /**
     * Description
     *
     *       Option for manufacturer
     */
    serialdata?: Maybe<Scalars["String"]>;
}
/** Device Edge */
export interface DeviceEdge {
    __typename?: "deviceEdge";
    /** Cursor */
    node?: Maybe<Device>;
}
export interface DeviceInstalledAppSettingsInput {
    obniz?: Maybe<DeviceInstalledAppSettingsInputDevice>;
    app?: Maybe<DeviceInstalledAppSettingsInputApp>;
}
export interface DeviceInstalledAppSettingsInputApp {
    config: AppConfigInput[];
}
export interface DeviceInstalledAppSettingsInputDevice {
    /** obnizID */
    id: Scalars["ID"];
}
export interface DeviceRegistrateInput {
    /** It can be obtained from the QR Code on the device. */
    registrateUrl: Scalars["String"];
}
export interface DeviceUpdateInput {
    /** obnizID */
    id: Scalars["ID"];
    /**
     * Server Region
     *
     *       'jp': Japan(East Asia)
     *
     *       'us': United States of America(West-America)
     */
    region?: Maybe<Scalars["String"]>;
    /**
     * Use Defined Description
     *
     *       Same value are exist on metadata.description
     */
    description?: Maybe<Scalars["String"]>;
    /**
     * User Defined Metadata key-value JSON string
     *
     *       Only key:string and value:string is accepted
     *       Useful for labeling device location or attached machine.
     */
    metadata?: Maybe<Scalars["String"]>;
    /**
     * Status
     *
     *       'active': activated
     *
     *       'inactive': inactivated
     */
    status?: Maybe<Scalars["String"]>;
}
/** ServerlessEvent */
export interface Event {
    __typename?: "event";
    /** Unique Identifier */
    id: Scalars["ID"];
    /** User named */
    name: Scalars["String"];
    /**
     * Event trigger as string.
     *
     *       'webhook': webhook
     *
     *       'everyday/{hour}:{time}': timing on a day
     *
     *       'every/{time}{minutes or hours}': interval
     *
     *       'device/{obniz_id}/switch_state_push': device event switch pressed.
     *
     *       'device/{obniz_id}/online': device event online.
     */
    trigger: Scalars["String"];
    /**
     * Action uri
     *
     *       '{filename_in_repo}':
     *
     *       'webapp://{install_id}/run': installed webapp
     */
    action: Scalars["String"];
    /** webhook Endpoint if trigger is webhook. */
    webhookUri?: Maybe<Scalars["String"]>;
    /** Created time */
    createdAt: Scalars["Date"];
}
/** Connection of Event */
export interface EventConnection {
    __typename?: "eventConnection";
    /** Total Count of device edges */
    totalCount: Scalars["Int"];
    /** Page Information */
    pageInfo: PageInfo;
    /** Edges */
    edges: Array<Maybe<EventEdge>>;
}
export interface EventCreateInput {
    /** The Event name */
    name: Scalars["String"];
    /**
     * Event trigger as string.
     *
     *       'webhook': webhook
     *
     *       'everyday/{hour}:{time}': timing on a day
     *
     *       'every/{time}{minutes or hours}': interval
     *
     *       'device/{obniz_id}/switch_state_push': device event switch pressed.
     *
     *       'device/{obniz_id}/online': device event online.
     */
    trigger: Scalars["String"];
    /**
     * Action uri
     *
     *       '{filename_in_repo}':
     *
     *       'webapp://{install_id}/run': installed webapp
     */
    action: Scalars["String"];
}
/** Event Edge */
export interface EventEdge {
    __typename?: "eventEdge";
    /** Cursor */
    node?: Maybe<Event>;
}
export interface EventUpdateInput {
    /** Unique Identifier */
    id: Scalars["ID"];
    /** The Event name */
    name: Scalars["String"];
    /**
     * Event trigger as string.
     *
     *       'webhook': webhook
     *
     *       'everyday/{hour}:{time}': timing on a day
     *
     *       'every/{time}{minutes or hours}': interval
     *
     *       'device/{obniz_id}/switch_state_push': device event switch pressed.
     *
     *       'device/{obniz_id}/online': device event online.
     */
    trigger: Scalars["String"];
    /**
     * Action uri
     *       '{filename_in_repo}':
     *       'webapp://{install_id}/run': installed webapp
     */
    action: Scalars["String"];
}
/** Hardware Information. This indicate related os information for each hardware */
export interface Hardware {
    __typename?: "hardware";
    /** Hardware Identifier  */
    hardware: Scalars["String"];
    /** OS identifier for hardware. */
    os: Scalars["String"];
}
/** Installed WebApp object. This contains user installed webapp configration */
export interface Install {
    __typename?: "install";
    /** Unique Identifier of install */
    id: Scalars["ID"];
    /** User information which is authorized for current Access Token. */
    user?: Maybe<User>;
    /** Installed time */
    createdAt: Scalars["Date"];
    /** Updated time */
    updatedAt: Scalars["Date"];
    /** JSON Representation of Installed app configration */
    configs: Scalars["String"];
}
/** Connection of Install */
export interface InstallConnection {
    __typename?: "installConnection";
    /** Total Count of device edges */
    totalCount: Scalars["Int"];
    /** Page Information */
    pageInfo: PageInfo;
    /** Edges */
    edges: Array<Maybe<InstallEdge>>;
}
/** Install Edge */
export interface InstallEdge {
    __typename?: "installEdge";
    /** Cursor */
    node?: Maybe<Install>;
}
/** Device information */
export interface Installed_Device {
    __typename?: "installed_device";
    /** Unique Identifier like "0000-0000" */
    id: Scalars["ID"];
    /** Access Token */
    access_token?: Maybe<Scalars["String"]>;
    /**
     * Description
     *
     *       Same value are exist on metadata.description
     */
    description: Scalars["String"];
    /**
     * User Defined Metadata JSON string
     *
     *       Useful for labeling device location or attached machine.
     */
    metadata: Scalars["String"];
    /**
     * DeviceKey
     *
     *       String representation of DeviceKey which installed or to be installed on the device.
     */
    devicekey?: Maybe<Scalars["String"]>;
    /**
     * Hardware Identifier
     *
     *       'obnizb1': obniz Board
     *
     *       'obnizb2': obniz Board 1Y
     *
     *       'm5stickc': M5StickC
     *
     *       'esp32w': obnizOS for ESP32
     *
     *       'esp32p': obnizOS for ESP32 on ESP32-PICO
     *
     *       'encored': obniz BLE/Wi-Fi Gateway
     */
    hardware: Scalars["String"];
    /**
     * OS Identifier
     *
     *       'obnizb1': obniz Board
     *
     *       'obnizb2': obniz Board 1Y
     *
     *       'm5stickc': M5StickC
     *
     *       'esp32w': obnizOS for ESP32
     *
     *       'encored': obniz BLE/Wi-Fi Gateway
     */
    os: Scalars["String"];
    /** Last time recognized os version like '1.0.0' */
    osVersion: Scalars["String"];
    /**
     * Server Region
     *
     *       'jp': Japan(East Asia)
     *
     *       'us': United States of America(West-America)
     */
    region: Scalars["String"];
    /**
     * Status
     *
     *       'active': activated
     *
     *       'inactive': inactivated
     */
    status: Scalars["String"];
    /** Installed time */
    createdAt: Scalars["Date"];
    /** User information which is authorized for current Access Token. */
    user?: Maybe<User>;
    /** JSON Representation of Installed app configration */
    configs: Scalars["String"];
}
/** operation. */
export interface Operation {
    __typename?: "operation";
    /** Unique identifier. */
    id: Scalars["ID"];
    /** Name of operation. */
    name: Scalars["String"];
    /** Facility ID which the operation targets at. */
    facilityId: Scalars["Int"];
    /** Criteria of completion. 0: written, 1: online. */
    completionLevel: Scalars["Int"];
    /** Evidence picture of completion is required if this param is true. */
    needPicEvidence: Scalars["Boolean"];
    /** Need to specify the exact device location if this param is true. */
    needLocationNote: Scalars["Boolean"];
    /** Time when the operation will be carried out. */
    dueDate?: Maybe<Scalars["Date"]>;
    /** Token that is going to be inclued in the operation URL on Android APP. */
    operationKey: Scalars["String"];
    /** Time when the facility created at */
    createdAt: Scalars["Date"];
}
/** operation edge */
export interface OperationEdge {
    __typename?: "operationEdge";
    /** Cursor. */
    node?: Maybe<Operation>;
    /** Facility name. */
    facilityName?: Maybe<Scalars["String"]>;
    /** The amount of devices that are going to be set. */
    amountExpectedDevices?: Maybe<Scalars["Int"]>;
    /** The amount of devices that have already been set. */
    amountOperatedDevices?: Maybe<Scalars["Int"]>;
    /** The amount of reports including both error and information. */
    amountReport?: Maybe<Scalars["Int"]>;
    /** Indicates whether or not error occurred and its error level if any. NoPrombelm Error. */
    errorLevelReport?: Maybe<Scalars["String"]>;
}
/** Operation result. */
export interface OperationResult {
    __typename?: "operationResult";
    /** Unique identifier. */
    id: Scalars["ID"];
    /** Operation Setting Id. */
    operationSettingId: Scalars["ID"];
    /** Indication Id. */
    indicationId: Scalars["String"];
    /** Obniz Id. */
    obnizId?: Maybe<Scalars["Int"]>;
    /** Time when operation setting has been written. */
    successfullyWrittenAt?: Maybe<Scalars["Date"]>;
    /** Time when a device became online. */
    becomeOnlineAt?: Maybe<Scalars["Date"]>;
    /** Url of evidence picture. */
    picUrl?: Maybe<Scalars["String"]>;
    /** Note about where a device has been set. */
    locationNote?: Maybe<Scalars["String"]>;
    /** Error code of operation failure. */
    typeError?: Maybe<Scalars["Int"]>;
}
/** Operation result edge. */
export interface OperationResultEdge {
    __typename?: "operationResultEdge";
    /** Cursor */
    node?: Maybe<OperationResult>;
}
/** Operation result. */
export interface OperationResultForOperationSetting {
    __typename?: "operationResultForOperationSetting";
    /** Obniz Id. */
    obnizId?: Maybe<Scalars["Int"]>;
    /** Time when operation setting has been written. */
    successfullyWrittenAt?: Maybe<Scalars["Date"]>;
    /** Time when a device became online. */
    becomeOnlineAt?: Maybe<Scalars["Date"]>;
    /** Url of evidence picture. */
    picUrl?: Maybe<Scalars["String"]>;
    /** Note about where a device has been set. */
    locationNote?: Maybe<Scalars["String"]>;
    /** Error code of operation failure. */
    typeError?: Maybe<Scalars["Int"]>;
}
/** Connection of operation results. */
export interface OperationResultsConnection {
    __typename?: "operationResultsConnection";
    /** Total count of operation results edges */
    totalCount: Scalars["Int"];
    /** Edges. */
    edges: Array<Maybe<OperationResultEdge>>;
}
/** Operation setting */
export interface OperationSetting {
    __typename?: "operationSetting";
    /** Unique identifier. */
    id: Scalars["ID"];
    /** Operation ID */
    operationId: Scalars["ID"];
    /** Indication ID. */
    indicationId: Scalars["String"];
    /** String representation of network config. Please see https://obniz.com/ja/doc/reference/obnizos-for-esp32/settings/setting-json */
    networkConfigs: Scalars["String"];
    /** App ID. This field will be null when app is not selected. */
    appId?: Maybe<Scalars["Int"]>;
    /** String representation of app config object. Will be empty object when no app is selected. */
    appConfigs: Scalars["String"];
    /** When no description is set, this field will be an empty string. */
    description: Scalars["String"];
    /** 0: not operated yet, 1: in progress, 2: finished */
    status: Scalars["Int"];
}
/** Operation setting edge. */
export interface OperationSettingEdge {
    __typename?: "operationSettingEdge";
    /** Cursor. */
    node?: Maybe<OperationSetting>;
    /** Operation result of the specific setting ID if any. */
    operationResult?: Maybe<OperationResultForOperationSetting>;
}
/** Connection of operation settings */
export interface OperationSettingsConnection {
    __typename?: "operationSettingsConnection";
    /** Total count of operation settings edges */
    totalCount: Scalars["Int"];
    /** Edges. */
    edges: Array<Maybe<OperationSettingEdge>>;
}
/** Connection of operations. */
export interface OperationsConnection {
    __typename?: "operationsConnection";
    /** Edges. */
    edges: Array<Maybe<OperationEdge>>;
}
/** OS Information. Return value may different in user. */
export interface Os {
    __typename?: "os";
    /** version string */
    version: Scalars["String"];
    /** Binary URL for application */
    app_url: Scalars["String"];
    /** Binary URL for bootloader */
    bootloader_url: Scalars["String"];
    /** Binary URL for partition table */
    partition_url: Scalars["String"];
}
/** Pagenation */
export interface PageInfo {
    __typename?: "pageInfo";
    /** result has next page */
    hasNextPage: Scalars["Boolean"];
    /** result has previous page */
    hasPreviousPage: Scalars["Boolean"];
}
export interface RemoveOperationResultResponse {
    __typename?: "removeOperationResultResponse";
    removed?: Maybe<Scalars["Boolean"]>;
}
/** Token object. This contains token information */
export interface Token {
    __typename?: "token";
    /** Token type. app_token / oauth / api_key */
    type: Scalars["String"];
    /** user permission. none / read / full  */
    user: Scalars["String"];
    /** device permission. none / read / full  */
    device: Scalars["String"];
    /** event permission. none / read / full  */
    event: Scalars["String"];
    /** device_control permission. none / read / full  */
    device_control: Scalars["String"];
    /** facility permission. none / read / full  */
    facility: Scalars["String"];
}
export interface UpdateStatusOperationSettingResult {
    __typename?: "updateStatusOperationSettingResult";
    updated: Scalars["Boolean"];
}
/** User information */
export interface User {
    __typename?: "user";
    /** Unique Identifier */
    id: Scalars["ID"];
    /** user name */
    name?: Maybe<Scalars["String"]>;
    /** email address */
    email?: Maybe<Scalars["String"]>;
    /** url for user icon */
    picture?: Maybe<Scalars["String"]>;
    /** User Plan on obniz.com */
    plan: Scalars["String"];
    /** Credit Point user has */
    credit: Scalars["String"];
    /** Installed time */
    createdAt: Scalars["Date"];
}
/** WebApp object. This contains webapp information which created on obniz.com as WebApp */
export interface Webapp {
    __typename?: "webapp";
    /** Unique Identifier of webapp */
    id: Scalars["ID"];
    /** English Title of WebApp */
    title: Scalars["String"];
    /** English Description */
    short_body: Scalars["String"];
    /** Type of WebApp. */
    type: Scalars["String"];
    /** Current Status on obniz.com Explore App */
    store_status: Scalars["String"];
    /** Query Installed Apps for WebApp. */
    installs?: Maybe<InstallConnection>;
}
/** WebApp object. This contains webapp information which created on obniz.com as WebApp */
export interface WebappInstallsArgs {
    first?: Maybe<Scalars["first"]>;
    skip?: Maybe<Scalars["skip"]>;
}
export declare type CreateDeviceMutationVariables = Exact<{
    createDeviceDevice: DeviceCreateInput;
}>;
export declare type CreateDeviceMutation = {
    __typename?: "Mutation";
} & {
    createDevice?: Maybe<{
        __typename?: "device";
    } & Pick<Device, "id" | "createdAt" | "devicekey" | "region" | "hardware" | "description">>;
};
export declare type GetDeviceByIdQueryVariables = Exact<{
    deviceId?: Maybe<Scalars["String"]>;
}>;
export declare type GetDeviceByIdQuery = {
    __typename?: "Query";
} & {
    devices?: Maybe<{
        __typename?: "deviceConnection";
    } & Pick<DeviceConnection, "totalCount"> & {
        pageInfo: {
            __typename?: "pageInfo";
        } & Pick<PageInfo, "hasNextPage" | "hasPreviousPage">;
        edges: Array<Maybe<{
            __typename?: "deviceEdge";
        } & {
            node?: Maybe<{
                __typename?: "device";
            } & Pick<Device, "id" | "createdAt" | "description" | "devicekey" | "hardware" | "status">>;
        }>>;
    }>;
};
export declare type CreateOperationResultMutationVariables = Exact<{
    createOperationResultOperationResult: CreateOperationResultInput;
}>;
export declare type CreateOperationResultMutation = {
    __typename?: "Mutation";
} & {
    createOperationResult?: Maybe<{
        __typename?: "operationResult";
    } & Pick<OperationResult, "id" | "operationSettingId" | "indicationId" | "obnizId" | "successfullyWrittenAt" | "becomeOnlineAt" | "picUrl" | "locationNote" | "typeError">>;
};
export declare type GetOperationQueryVariables = Exact<{
    operationsId?: Maybe<Scalars["Int"]>;
}>;
export declare type GetOperationQuery = {
    __typename?: "Query";
} & {
    operations?: Maybe<{
        __typename?: "operationsConnection";
    } & {
        edges: Array<Maybe<{
            __typename?: "operationEdge";
        } & Pick<OperationEdge, "facilityName" | "amountExpectedDevices" | "amountOperatedDevices" | "amountReport" | "errorLevelReport"> & {
            node?: Maybe<{
                __typename?: "operation";
            } & Pick<Operation, "name" | "id" | "facilityId" | "completionLevel" | "needPicEvidence" | "needLocationNote" | "dueDate" | "operationKey" | "createdAt">>;
        }>>;
    }>;
};
export declare type GetOperationSettingsQueryVariables = Exact<{
    operationSettingsOperationId?: Maybe<Scalars["ID"]>;
}>;
export declare type GetOperationSettingsQuery = {
    __typename?: "Query";
} & {
    operationSettings?: Maybe<{
        __typename?: "operationSettingsConnection";
    } & Pick<OperationSettingsConnection, "totalCount"> & {
        edges: Array<Maybe<{
            __typename?: "operationSettingEdge";
        } & {
            node?: Maybe<{
                __typename?: "operationSetting";
            } & Pick<OperationSetting, "operationId" | "id" | "indicationId" | "networkConfigs" | "appId" | "appConfigs" | "description" | "status">>;
            operationResult?: Maybe<{
                __typename?: "operationResultForOperationSetting";
            } & Pick<OperationResultForOperationSetting, "obnizId" | "successfullyWrittenAt" | "becomeOnlineAt" | "picUrl" | "locationNote" | "typeError">>;
        }>>;
    }>;
};
export declare type GetOperationsQueryVariables = Exact<{
    [key: string]: never;
}>;
export declare type GetOperationsQuery = {
    __typename?: "Query";
} & {
    operations?: Maybe<{
        __typename?: "operationsConnection";
    } & {
        edges: Array<Maybe<{
            __typename?: "operationEdge";
        } & Pick<OperationEdge, "facilityName" | "amountExpectedDevices" | "amountOperatedDevices" | "amountReport" | "errorLevelReport"> & {
            node?: Maybe<{
                __typename?: "operation";
            } & Pick<Operation, "name" | "id" | "facilityId" | "completionLevel" | "needPicEvidence" | "needLocationNote" | "dueDate" | "operationKey" | "createdAt">>;
        }>>;
    }>;
};
export declare type RemoveOperationResultMutationVariables = Exact<{
    removeOperationResultOperationSettingId: Scalars["ID"];
}>;
export declare type RemoveOperationResultMutation = {
    __typename?: "Mutation";
} & {
    removeOperationResult?: Maybe<{
        __typename?: "removeOperationResultResponse";
    } & Pick<RemoveOperationResultResponse, "removed">>;
};
export declare type UpdateOperationSettingStatusMutationVariables = Exact<{
    updateStatusOperationSettingOperationSettingId: Scalars["ID"];
}>;
export declare type UpdateOperationSettingStatusMutation = {
    __typename?: "Mutation";
} & {
    updateStatusOperationSetting?: Maybe<{
        __typename?: "updateStatusOperationSettingResult";
    } & Pick<UpdateStatusOperationSettingResult, "updated">>;
};
export declare type GetTokenPermissionQueryVariables = Exact<{
    [key: string]: never;
}>;
export declare type GetTokenPermissionQuery = {
    __typename?: "Query";
} & {
    token?: Maybe<{
        __typename?: "token";
    } & Pick<Token, "device" | "device_control" | "event" | "facility" | "type" | "user">>;
};
export declare type CurrentUserQueryVariables = Exact<{
    [key: string]: never;
}>;
export declare type CurrentUserQuery = {
    __typename?: "Query";
} & {
    user?: Maybe<{
        __typename?: "user";
    } & Pick<User, "id" | "name" | "email">>;
};
export declare const CreateDeviceDocument: import("graphql").DocumentNode;
export declare const GetDeviceByIdDocument: import("graphql").DocumentNode;
export declare const CreateOperationResultDocument: import("graphql").DocumentNode;
export declare const GetOperationDocument: import("graphql").DocumentNode;
export declare const GetOperationSettingsDocument: import("graphql").DocumentNode;
export declare const GetOperationsDocument: import("graphql").DocumentNode;
export declare const RemoveOperationResultDocument: import("graphql").DocumentNode;
export declare const UpdateOperationSettingStatusDocument: import("graphql").DocumentNode;
export declare const GetTokenPermissionDocument: import("graphql").DocumentNode;
export declare const CurrentUserDocument: import("graphql").DocumentNode;
export declare type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;
export declare function getSdk(client: GraphQLClient, withWrapper?: SdkFunctionWrapper): {
    createDevice(variables: CreateDeviceMutationVariables): Promise<CreateDeviceMutation>;
    getDeviceById(variables?: Exact<{
        deviceId?: string | null | undefined;
    }> | undefined): Promise<GetDeviceByIdQuery>;
    createOperationResult(variables: CreateOperationResultMutationVariables): Promise<CreateOperationResultMutation>;
    getOperation(variables?: Exact<{
        operationsId?: number | null | undefined;
    }> | undefined): Promise<GetOperationQuery>;
    getOperationSettings(variables?: Exact<{
        operationSettingsOperationId?: string | null | undefined;
    }> | undefined): Promise<GetOperationSettingsQuery>;
    getOperations(variables?: Exact<{
        [key: string]: never;
    }> | undefined): Promise<GetOperationsQuery>;
    removeOperationResult(variables: RemoveOperationResultMutationVariables): Promise<RemoveOperationResultMutation>;
    updateOperationSettingStatus(variables: UpdateOperationSettingStatusMutationVariables): Promise<UpdateOperationSettingStatusMutation>;
    getTokenPermission(variables?: Exact<{
        [key: string]: never;
    }> | undefined): Promise<GetTokenPermissionQuery>;
    currentUser(variables?: Exact<{
        [key: string]: never;
    }> | undefined): Promise<CurrentUserQuery>;
};
export declare type Sdk = ReturnType<typeof getSdk>;

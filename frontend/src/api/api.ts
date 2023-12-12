/* tslint:disable */
/* eslint-disable */
/**
 * Webconsole Backend API
 * free5GC webconsole backend API
 *
 * The version of the OpenAPI document: v1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import type { Configuration } from './configuration';
import type { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios';
import globalAxios from 'axios';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from './common';
import type { RequestArgs } from './base';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, BaseAPI, RequiredError } from './base';

/**
 * 
 * @export
 * @interface ANInformation
 */
export interface ANInformation {
    /**
     * 
     * @type {string}
     * @memberof ANInformation
     */
    'IPAddress'?: string;
    /**
     * 
     * @type {number}
     * @memberof ANInformation
     */
    'TEID'?: number;
}
/**
 * 
 * @export
 * @interface AccessAndMobilitySubscriptionData
 */
export interface AccessAndMobilitySubscriptionData {
    /**
     * 
     * @type {Array<string>}
     * @memberof AccessAndMobilitySubscriptionData
     */
    'gpsis'?: Array<string>;
    /**
     * 
     * @type {SubscribedUeAmbr}
     * @memberof AccessAndMobilitySubscriptionData
     */
    'subscribedUeAmbr'?: SubscribedUeAmbr;
    /**
     * 
     * @type {DefaultSingleNssais}
     * @memberof AccessAndMobilitySubscriptionData
     */
    'nssai'?: DefaultSingleNssais;
}
/**
 * 
 * @export
 * @interface AmPolicyData
 */
export interface AmPolicyData {
    /**
     * 
     * @type {Array<string>}
     * @memberof AmPolicyData
     */
    'subscCats'?: Array<string>;
}
/**
 * 
 * @export
 * @interface Arp
 */
export interface Arp {
    /**
     * 
     * @type {number}
     * @memberof Arp
     */
    'priorityLevel'?: number;
    /**
     * 
     * @type {string}
     * @memberof Arp
     */
    'preemptCap'?: string;
    /**
     * 
     * @type {string}
     * @memberof Arp
     */
    'preemptVuln'?: string;
}
/**
 * 
 * @export
 * @interface AuthenticationSubscription
 */
export interface AuthenticationSubscription {
    /**
     * 
     * @type {string}
     * @memberof AuthenticationSubscription
     */
    'authenticationMethod'?: string;
    /**
     * 
     * @type {PermanentKey}
     * @memberof AuthenticationSubscription
     */
    'permanentKey'?: PermanentKey;
    /**
     * 
     * @type {string}
     * @memberof AuthenticationSubscription
     */
    'sequenceNumber'?: string;
    /**
     * 
     * @type {string}
     * @memberof AuthenticationSubscription
     */
    'authenticationManagementField'?: string;
    /**
     * 
     * @type {Milenage}
     * @memberof AuthenticationSubscription
     */
    'milenage'?: Milenage;
    /**
     * 
     * @type {Opc}
     * @memberof AuthenticationSubscription
     */
    'opc'?: Opc;
}
/**
 * 
 * @export
 * @interface DefaultSingleNssais
 */
export interface DefaultSingleNssais {
    /**
     * 
     * @type {Array<Nssai>}
     * @memberof DefaultSingleNssais
     */
    'defaultSingleNssais'?: Array<Nssai>;
    /**
     * 
     * @type {Array<Nssai>}
     * @memberof DefaultSingleNssais
     */
    'singleNssais'?: Array<Nssai>;
}
/**
 * 
 * @export
 * @interface Dnn
 */
export interface Dnn {
    /**
     * 
     * @type {string}
     * @memberof Dnn
     */
    'dnn'?: string;
}
/**
 * 
 * @export
 * @interface DnnConfiguration
 */
export interface DnnConfiguration {
    /**
     * 
     * @type {PduSessionTypes}
     * @memberof DnnConfiguration
     */
    'pduSessionTypes'?: PduSessionTypes;
    /**
     * 
     * @type {SscModes}
     * @memberof DnnConfiguration
     */
    'sscModes'?: SscModes;
    /**
     * 
     * @type {Model5gQosProfile}
     * @memberof DnnConfiguration
     */
    '5gQosProfile'?: Model5gQosProfile;
    /**
     * 
     * @type {SessionAmbr}
     * @memberof DnnConfiguration
     */
    'sessionAmbr'?: SessionAmbr;
    /**
     * 
     * @type {UpSecurity}
     * @memberof DnnConfiguration
     */
    'upSecurity'?: UpSecurity;
}
/**
 * 
 * @export
 * @interface FlowRules
 */
export interface FlowRules {
    /**
     * 
     * @type {string}
     * @memberof FlowRules
     */
    'filter'?: string;
    /**
     * 
     * @type {number}
     * @memberof FlowRules
     */
    'precedence'?: number;
    /**
     * 
     * @type {string}
     * @memberof FlowRules
     */
    'snssai'?: string;
    /**
     * 
     * @type {string}
     * @memberof FlowRules
     */
    'dnn'?: string;
    /**
     * 
     * @type {number}
     * @memberof FlowRules
     */
    'qosRef'?: number;
}
/**
 * 
 * @export
 * @interface Meta
 */
export interface Meta {
    /**
     * 
     * @type {string}
     * @memberof Meta
     */
    'next'?: string;
    /**
     * 
     * @type {string}
     * @memberof Meta
     */
    'prev'?: string;
    /**
     * 
     * @type {number}
     * @memberof Meta
     */
    'limit'?: number;
    /**
     * 
     * @type {number}
     * @memberof Meta
     */
    'total'?: number;
}
/**
 * 
 * @export
 * @interface Milenage
 */
export interface Milenage {
    /**
     * 
     * @type {MilenageOp}
     * @memberof Milenage
     */
    'op'?: MilenageOp;
}
/**
 * 
 * @export
 * @interface MilenageOp
 */
export interface MilenageOp {
    /**
     * 
     * @type {string}
     * @memberof MilenageOp
     */
    'opValue'?: string;
    /**
     * 
     * @type {number}
     * @memberof MilenageOp
     */
    'encryptionKey'?: number;
    /**
     * 
     * @type {number}
     * @memberof MilenageOp
     */
    'encryptionAlgorithm'?: number;
}
/**
 * 
 * @export
 * @interface Model5gQosProfile
 */
export interface Model5gQosProfile {
    /**
     * 
     * @type {number}
     * @memberof Model5gQosProfile
     */
    '5qi'?: number;
    /**
     * 
     * @type {Arp}
     * @memberof Model5gQosProfile
     */
    'arp'?: Arp;
    /**
     * 
     * @type {number}
     * @memberof Model5gQosProfile
     */
    'priorityLevel'?: number;
}
/**
 * 
 * @export
 * @interface Nssai
 */
export interface Nssai {
    /**
     * 
     * @type {number}
     * @memberof Nssai
     */
    'sst'?: number;
    /**
     * 
     * @type {string}
     * @memberof Nssai
     */
    'sd'?: string;
}
/**
 * 
 * @export
 * @interface Opc
 */
export interface Opc {
    /**
     * 
     * @type {string}
     * @memberof Opc
     */
    'opcValue'?: string;
    /**
     * 
     * @type {number}
     * @memberof Opc
     */
    'encryptionKey'?: number;
    /**
     * 
     * @type {number}
     * @memberof Opc
     */
    'encryptionAlgorithm'?: number;
}
/**
 * 
 * @export
 * @interface PduSession
 */
export interface PduSession {
    /**
     * 
     * @type {string}
     * @memberof PduSession
     */
    'Dnn'?: string;
    /**
     * 
     * @type {string}
     * @memberof PduSession
     */
    'PduSessionId'?: string;
    /**
     * 
     * @type {string}
     * @memberof PduSession
     */
    'Sd'?: string;
    /**
     * 
     * @type {string}
     * @memberof PduSession
     */
    'SmContextRef'?: string;
    /**
     * 
     * @type {string}
     * @memberof PduSession
     */
    'Sst'?: string;
}
/**
 * 
 * @export
 * @interface PduSessionInfo
 */
export interface PduSessionInfo {
    /**
     * 
     * @type {string}
     * @memberof PduSessionInfo
     */
    'AnType'?: string;
    /**
     * 
     * @type {string}
     * @memberof PduSessionInfo
     */
    'Dnn'?: string;
    /**
     * 
     * @type {string}
     * @memberof PduSessionInfo
     */
    'LocalSEID'?: string;
    /**
     * 
     * @type {string}
     * @memberof PduSessionInfo
     */
    'PDUAddress'?: string;
    /**
     * 
     * @type {string}
     * @memberof PduSessionInfo
     */
    'PDUSessionID'?: string;
    /**
     * 
     * @type {string}
     * @memberof PduSessionInfo
     */
    'RemoteSEID'?: string;
    /**
     * 
     * @type {string}
     * @memberof PduSessionInfo
     */
    'Sd'?: string;
    /**
     * 
     * @type {SessionRule}
     * @memberof PduSessionInfo
     */
    'SessionRule'?: SessionRule;
    /**
     * 
     * @type {string}
     * @memberof PduSessionInfo
     */
    'Sst'?: string;
    /**
     * 
     * @type {string}
     * @memberof PduSessionInfo
     */
    'Supi'?: string;
    /**
     * 
     * @type {Tunnel}
     * @memberof PduSessionInfo
     */
    'Tunnel'?: Tunnel;
    /**
     * 
     * @type {string}
     * @memberof PduSessionInfo
     */
    'UpCnxState'?: string;
}
/**
 * 
 * @export
 * @interface PduSessionTypes
 */
export interface PduSessionTypes {
    /**
     * 
     * @type {string}
     * @memberof PduSessionTypes
     */
    'defaultSessionType'?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof PduSessionTypes
     */
    'allowedSessionTypes'?: Array<string>;
}
/**
 * 
 * @export
 * @interface PermanentKey
 */
export interface PermanentKey {
    /**
     * 
     * @type {string}
     * @memberof PermanentKey
     */
    'permanentKeyValue'?: string;
    /**
     * 
     * @type {number}
     * @memberof PermanentKey
     */
    'encryptionKey'?: number;
    /**
     * 
     * @type {number}
     * @memberof PermanentKey
     */
    'encryptionAlgorithm'?: number;
}
/**
 * 
 * @export
 * @interface QosFlows
 */
export interface QosFlows {
    /**
     * 
     * @type {string}
     * @memberof QosFlows
     */
    'snssai'?: string;
    /**
     * 
     * @type {string}
     * @memberof QosFlows
     */
    'dnn'?: string;
    /**
     * 
     * @type {number}
     * @memberof QosFlows
     */
    'qosRef'?: number;
    /**
     * 
     * @type {number}
     * @memberof QosFlows
     */
    '5qi'?: number;
    /**
     * 
     * @type {string}
     * @memberof QosFlows
     */
    'mbrUL'?: string;
    /**
     * 
     * @type {string}
     * @memberof QosFlows
     */
    'mbrDL'?: string;
    /**
     * 
     * @type {string}
     * @memberof QosFlows
     */
    'gbrUL'?: string;
    /**
     * 
     * @type {string}
     * @memberof QosFlows
     */
    'gbrDL'?: string;
}
/**
 * 
 * @export
 * @interface SessionAmbr
 */
export interface SessionAmbr {
    /**
     * 
     * @type {string}
     * @memberof SessionAmbr
     */
    'uplink'?: string;
    /**
     * 
     * @type {string}
     * @memberof SessionAmbr
     */
    'downlink'?: string;
}
/**
 * 
 * @export
 * @interface SessionManagementSubscriptionData
 */
export interface SessionManagementSubscriptionData {
    /**
     * 
     * @type {Nssai}
     * @memberof SessionManagementSubscriptionData
     */
    'singleNssai'?: Nssai;
    /**
     * 
     * @type {{ [key: string]: DnnConfiguration; }}
     * @memberof SessionManagementSubscriptionData
     */
    'dnnConfigurations'?: { [key: string]: DnnConfiguration; };
}
/**
 * 
 * @export
 * @interface SessionRule
 */
export interface SessionRule {
    /**
     * 
     * @type {string}
     * @memberof SessionRule
     */
    'sessRuleId'?: string;
}
/**
 * 
 * @export
 * @interface SmPolicyData
 */
export interface SmPolicyData {
    /**
     * 
     * @type {{ [key: string]: SmPolicySnssai; }}
     * @memberof SmPolicyData
     */
    'smPolicySnssaiData'?: { [key: string]: SmPolicySnssai; };
}
/**
 * 
 * @export
 * @interface SmPolicySnssai
 */
export interface SmPolicySnssai {
    /**
     * 
     * @type {Nssai}
     * @memberof SmPolicySnssai
     */
    'snssai'?: Nssai;
    /**
     * 
     * @type {{ [key: string]: Dnn; }}
     * @memberof SmPolicySnssai
     */
    'smPolicyDnnData'?: { [key: string]: Dnn; };
}
/**
 * 
 * @export
 * @interface SmfSelectionSubscriptionData
 */
export interface SmfSelectionSubscriptionData {
    /**
     * 
     * @type {{ [key: string]: SubscribedSnssaiInfo; }}
     * @memberof SmfSelectionSubscriptionData
     */
    'subscribedSnssaiInfos'?: { [key: string]: SubscribedSnssaiInfo; };
}
/**
 * 
 * @export
 * @interface SscModes
 */
export interface SscModes {
    /**
     * 
     * @type {string}
     * @memberof SscModes
     */
    'defaultSscMode'?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof SscModes
     */
    'allowedSscModes'?: Array<string>;
}
/**
 * 
 * @export
 * @interface SubscribedSnssaiInfo
 */
export interface SubscribedSnssaiInfo {
    /**
     * 
     * @type {Array<Dnn>}
     * @memberof SubscribedSnssaiInfo
     */
    'dnnInfos'?: Array<Dnn>;
}
/**
 * 
 * @export
 * @interface SubscribedUeAmbr
 */
export interface SubscribedUeAmbr {
    /**
     * 
     * @type {string}
     * @memberof SubscribedUeAmbr
     */
    'uplink'?: string;
    /**
     * 
     * @type {string}
     * @memberof SubscribedUeAmbr
     */
    'downlink'?: string;
}
/**
 * 
 * @export
 * @interface Subscriber
 */
export interface Subscriber {
    /**
     * 
     * @type {string}
     * @memberof Subscriber
     */
    'plmnID'?: string;
    /**
     * 
     * @type {string}
     * @memberof Subscriber
     */
    'ueId'?: string;
}
/**
 * 
 * @export
 * @interface Subscription
 */
export interface Subscription {
    /**
     * 
     * @type {number}
     * @memberof Subscription
     */
    'userNumber'?: number;
    /**
     * 
     * @type {string}
     * @memberof Subscription
     */
    'plmnID'?: string;
    /**
     * 
     * @type {string}
     * @memberof Subscription
     */
    'ueId'?: string;
    /**
     * 
     * @type {AuthenticationSubscription}
     * @memberof Subscription
     */
    'AuthenticationSubscription'?: AuthenticationSubscription;
    /**
     * 
     * @type {AccessAndMobilitySubscriptionData}
     * @memberof Subscription
     */
    'AccessAndMobilitySubscriptionData'?: AccessAndMobilitySubscriptionData;
    /**
     * 
     * @type {Array<SessionManagementSubscriptionData>}
     * @memberof Subscription
     */
    'SessionManagementSubscriptionData'?: Array<SessionManagementSubscriptionData>;
    /**
     * 
     * @type {SmfSelectionSubscriptionData}
     * @memberof Subscription
     */
    'SmfSelectionSubscriptionData'?: SmfSelectionSubscriptionData;
    /**
     * 
     * @type {AmPolicyData}
     * @memberof Subscription
     */
    'AmPolicyData'?: AmPolicyData;
    /**
     * 
     * @type {SmPolicyData}
     * @memberof Subscription
     */
    'SmPolicyData'?: SmPolicyData;
    /**
     * 
     * @type {Array<FlowRules>}
     * @memberof Subscription
     */
    'FlowRules'?: Array<FlowRules>;
    /**
     * 
     * @type {Array<QosFlows>}
     * @memberof Subscription
     */
    'QosFlows'?: Array<QosFlows>;
    /**
     * 
     * @type {Array<ChargingData>}
     * @memberof Subscription
     */
     'ChargingDatas'?: Array<ChargingData>;
}
/**
 * 
 * @export
 * @interface Tenant
 */
export interface Tenant {
    /**
     * 
     * @type {string}
     * @memberof Tenant
     */
    'tenantId'?: string;
    /**
     * 
     * @type {string}
     * @memberof Tenant
     */
    'tenantName'?: string;
}
/**
 * 
 * @export
 * @interface ChargingData
 */
 export interface ChargingData {
    /**
     * 
     * @type {string}
     * @memberof Tenant
     */
     'snssai'?: string;
     /**
      * 
      * @type {string}
      * @memberof ChargingData
      */
     'dnn'?: string;
     /**
      * 
      * @type {number}
      * @memberof ChargingData
      */
     'qosRef'?: number;
     /**
     * 
     * @type {string}
     * @memberof ChargingData
     */
    'filter'?: string;
    /**
     * 
     * @type {string}
     * @memberof ChargingData
     */
    'chargingMethod'?: string;
    /**
     * 
     * @type {string}
     * @memberof ChargingData
     */
     'quota'?: string;
    /**
     * 
     * @type {string}
     * @memberof ChargingData
     */
    'unitCost'?: string;
}
/**
 *
 * @export
 * @interface FlowChargingRecord
 */
export interface FlowChargingRecord {
    /**
     *
     * @type {string}
     * @memberof flowChargingRecord
     */
    'Supi'?: string;
    /**
     *
     * @type {string}
     * @memberof flowChargingRecord
     */
    'Snssai'?: string;
    /**
     *
     * @type {string}
     * @memberof flowChargingRecord
     */
    'Dnn'?: string;
    /**
     *
     * @type {string}
     * @memberof flowChargingRecord
     */
    'Filter'?: string;
    /**
    *
    * @type {string}
    * @memberof flowChargingRecord
    */
   'QuotaLeft'?: string;
   /**
    *
    * @type {string}
    * @memberof flowChargingRecord
    */
   'TotalVol'?: string;
   /**
    *
    * @type {string}
    * @memberof flowChargingRecord
    */
   'UlVol'?: string;
    /**
    *
    * @type {string}
    * @memberof flowChargingRecord
    */
   'DlVol'?: string;
}
/**
 *
 * @export
 * @interface Tunnel
 */
export interface Tunnel {
    /**
     * 
     * @type {ANInformation}
     * @memberof Tunnel
     */
    'ANInformation'?: ANInformation;
    /**
     * 
     * @type {string}
     * @memberof Tunnel
     */
    'DataPathPool'?: string;
    /**
     * 
     * @type {string}
     * @memberof Tunnel
     */
    'PathIDGenerator'?: string;
}
/**
 * 
 * @export
 * @interface UeContext
 */
export interface UeContext {
    /**
     * 
     * @type {string}
     * @memberof UeContext
     */
    'AccessType'?: string;
    /**
     * 
     * @type {string}
     * @memberof UeContext
     */
    'CmState'?: string;
    /**
     * 
     * @type {string}
     * @memberof UeContext
     */
    'Guti'?: string;
    /**
     * 
     * @type {string}
     * @memberof UeContext
     */
    'Mcc'?: string;
    /**
     * 
     * @type {string}
     * @memberof UeContext
     */
    'Mnc'?: string;
    /**
     * 
     * @type {Array<PduSession>}
     * @memberof UeContext
     */
    'PduSessions'?: Array<PduSession>;
    /**
     * 
     * @type {string}
     * @memberof UeContext
     */
    'Supi'?: string;
    /**
     * 
     * @type {string}
     * @memberof UeContext
     */
    'Tac'?: string;
}
/**
 * 
 * @export
 * @interface UpSecurity
 */
export interface UpSecurity {
    /**
     * 
     * @type {string}
     * @memberof UpSecurity
     */
    'upIntegr'?: string;
    /**
     * 
     * @type {string}
     * @memberof UpSecurity
     */
    'upConfid'?: string;
}
/**
 * 
 * @export
 * @interface User
 */
export interface User {
    /**
     * 
     * @type {string}
     * @memberof User
     */
    'userId'?: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    'tenantId'?: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    'email'?: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    'encryptedPassword'?: string;
}

/**
 * WebconsoleApi - axios parameter creator
 * @export
 */
export const WebconsoleApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Returns an array of subscriber.
         * @summary Get all subscribers
         * @param {number} [limit] 
         * @param {number} [page] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        apiSubscriberGet: async (limit?: number, page?: number, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/api/subscriber`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (limit !== undefined) {
                localVarQueryParameter['limit'] = limit;
            }

            if (page !== undefined) {
                localVarQueryParameter['page'] = page;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * WebconsoleApi - functional programming interface
 * @export
 */
export const WebconsoleApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = WebconsoleApiAxiosParamCreator(configuration)
    return {
        /**
         * Returns an array of subscriber.
         * @summary Get all subscribers
         * @param {number} [limit] 
         * @param {number} [page] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async apiSubscriberGet(limit?: number, page?: number, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<Subscriber>>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.apiSubscriberGet(limit, page, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * WebconsoleApi - factory interface
 * @export
 */
export const WebconsoleApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = WebconsoleApiFp(configuration)
    return {
        /**
         * Returns an array of subscriber.
         * @summary Get all subscribers
         * @param {number} [limit] 
         * @param {number} [page] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        apiSubscriberGet(limit?: number, page?: number, options?: any): AxiosPromise<Array<Subscriber>> {
            return localVarFp.apiSubscriberGet(limit, page, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * WebconsoleApi - object-oriented interface
 * @export
 * @class WebconsoleApi
 * @extends {BaseAPI}
 */
export class WebconsoleApi extends BaseAPI {
    /**
     * Returns an array of subscriber.
     * @summary Get all subscribers
     * @param {number} [limit] 
     * @param {number} [page] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof WebconsoleApi
     */
    public apiSubscriberGet(limit?: number, page?: number, options?: AxiosRequestConfig) {
        return WebconsoleApiFp(this.configuration).apiSubscriberGet(limit, page, options).then((request) => request(this.axios, this.basePath));
    }
}



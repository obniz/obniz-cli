"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSdk = exports.CurrentUserDocument = exports.GetTokenPermissionDocument = exports.UpdateOperationSettingStatusDocument = exports.RemoveOperationResultDocument = exports.GetOperationsDocument = exports.GetOperationSettingsDocument = exports.GetOperationDocument = exports.CreateOperationResultDocument = exports.GetDeviceByIdDocument = exports.CreateDeviceDocument = void 0;
const graphql_1 = require("graphql");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.CreateDeviceDocument = graphql_tag_1.default `
  mutation createDevice($createDeviceDevice: deviceCreateInput!) {
    createDevice(device: $createDeviceDevice) {
      id
      createdAt
      devicekey
      region
      hardware
      description
    }
  }
`;
exports.GetDeviceByIdDocument = graphql_tag_1.default `
  query getDeviceById($deviceId: String) {
    devices(id: $deviceId) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      edges {
        node {
          id
          createdAt
          description
          devicekey
          hardware
          status
        }
      }
    }
  }
`;
exports.CreateOperationResultDocument = graphql_tag_1.default `
  mutation createOperationResult($createOperationResultOperationResult: createOperationResultInput!) {
    createOperationResult(operationResult: $createOperationResultOperationResult) {
      id
      operationSettingId
      indicationId
      obnizId
      successfullyWrittenAt
      becomeOnlineAt
      picUrl
      locationNote
      typeError
    }
  }
`;
exports.GetOperationDocument = graphql_tag_1.default `
  query getOperation($operationsId: Int) {
    operations(id: $operationsId) {
      edges {
        node {
          name
          id
          facilityId
          completionLevel
          needPicEvidence
          needLocationNote
          dueDate
          operationKey
          createdAt
        }
        facilityName
        amountExpectedDevices
        amountOperatedDevices
        amountReport
        errorLevelReport
      }
    }
  }
`;
exports.GetOperationSettingsDocument = graphql_tag_1.default `
  query getOperationSettings($operationSettingsOperationId: ID) {
    operationSettings(operationId: $operationSettingsOperationId) {
      totalCount
      edges {
        node {
          operationId
          id
          indicationId
          networkConfigs
          appId
          appConfigs
          description
          status
        }
        operationResult {
          obnizId
          successfullyWrittenAt
          becomeOnlineAt
          picUrl
          locationNote
          typeError
        }
      }
    }
  }
`;
exports.GetOperationsDocument = graphql_tag_1.default `
  query getOperations {
    operations {
      edges {
        node {
          name
          id
          facilityId
          completionLevel
          needPicEvidence
          needLocationNote
          dueDate
          operationKey
          createdAt
        }
        facilityName
        amountExpectedDevices
        amountOperatedDevices
        amountReport
        errorLevelReport
      }
    }
  }
`;
exports.RemoveOperationResultDocument = graphql_tag_1.default `
  mutation removeOperationResult($removeOperationResultOperationSettingId: ID!) {
    removeOperationResult(operationSettingId: $removeOperationResultOperationSettingId) {
      removed
    }
  }
`;
exports.UpdateOperationSettingStatusDocument = graphql_tag_1.default `
  mutation updateOperationSettingStatus($updateStatusOperationSettingOperationSettingId: ID!) {
    updateStatusOperationSetting(operationSettingId: $updateStatusOperationSettingOperationSettingId) {
      updated
    }
  }
`;
exports.GetTokenPermissionDocument = graphql_tag_1.default `
  query getTokenPermission {
    token {
      device
      device_control
      event
      facility
      type
      user
    }
  }
`;
exports.CurrentUserDocument = graphql_tag_1.default `
  query currentUser {
    user {
      id
      name
      email
    }
  }
`;
const defaultWrapper = (sdkFunction) => sdkFunction();
function getSdk(client, withWrapper = defaultWrapper) {
    return {
        createDevice(variables) {
            return withWrapper(() => client.request(graphql_1.print(exports.CreateDeviceDocument), variables));
        },
        getDeviceById(variables) {
            return withWrapper(() => client.request(graphql_1.print(exports.GetDeviceByIdDocument), variables));
        },
        createOperationResult(variables) {
            return withWrapper(() => client.request(graphql_1.print(exports.CreateOperationResultDocument), variables));
        },
        getOperation(variables) {
            return withWrapper(() => client.request(graphql_1.print(exports.GetOperationDocument), variables));
        },
        getOperationSettings(variables) {
            return withWrapper(() => client.request(graphql_1.print(exports.GetOperationSettingsDocument), variables));
        },
        getOperations(variables) {
            return withWrapper(() => client.request(graphql_1.print(exports.GetOperationsDocument), variables));
        },
        removeOperationResult(variables) {
            return withWrapper(() => client.request(graphql_1.print(exports.RemoveOperationResultDocument), variables));
        },
        updateOperationSettingStatus(variables) {
            return withWrapper(() => client.request(graphql_1.print(exports.UpdateOperationSettingStatusDocument), variables));
        },
        getTokenPermission(variables) {
            return withWrapper(() => client.request(graphql_1.print(exports.GetTokenPermissionDocument), variables));
        },
        currentUser(variables) {
            return withWrapper(() => client.request(graphql_1.print(exports.CurrentUserDocument), variables));
        },
    };
}
exports.getSdk = getSdk;
//# sourceMappingURL=client.js.map
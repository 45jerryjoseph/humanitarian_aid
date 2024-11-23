export async function createDeliveryDetails(deliveryDetails) {
    return window.canister.aidChain.createDeliveryDetails(deliveryDetails);
  }

  // addItemToDeliveryDetails
  export async function addItemToDeliveryDetails(deliveryId, itemId) {
    return window.canister.aidChain.addItemToDeliveryDetails(deliveryId, itemId);
  }

  // addDriverIdToDeliveryDetails
  export async function addDriverIdToDeliveryDetails(deliveryId, driverId) {
    return window.canister.aidChain.addDriverIdToDeliveryDetails(deliveryId, driverId);
  }

  // updateDeliveryDate
  export async function updateDeliveryDate(deliveryId, deliveryDate) {
    return window.canister.aidChain.updateDeliveryDate(deliveryId, deliveryDate);
  }
  
  export async function getAllDeliveryDetails() {
    try {
      return await window.canister.aidChain.getAllDeliveryDetails();
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }
  
  export async function getDeliveryDetails(id) {
    try {
      return await window.canister.aidChain.getDeliveryDetails(id);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
  }
  
  export async function updateDeliveryDetails(id,deliveryDetails) {
    try {
      return await window.canister.aidChain.updateDeliveryDetails(id,deliveryDetails);
    }  catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
  }

  // getActiveDeliveryDetails
  export async function getActiveDeliveryDetails() {
    try {
      return await window.canister.aidChain.getActiveDeliveryDetails();
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

  // getNewDeliveryDetailsInDistributorsCompany
  export async function getNewDeliveryDetailsInDistributorsCompany(companyId) {
    try {
      return await window.canister.aidChain.getNewDeliveryDetailsInDistributorsCompany(companyId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

  // getNewDeliveryDetailsForWarehouseManager
  export async function getNewDeliveryDetailsForWarehouseManager(managerId) {
    try {
      return await window.canister.aidChain.getNewDeliveryDetailsForWarehouseManager(managerId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

  // getTenderedDeliveryDetailsForWarehouseManager
  export async function getTenderedDeliveryDetailsForWarehouseManager(managerId) {
    try {
      return await window.canister.aidChain.getTenderedDeliveryDetailsForWarehouseManager(managerId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }


  // getTenderedDeliveryDetailsInDistributorsCompany
  export async function getTenderedDeliveryDetailsInDistributorsCompany(companyId) {
    try {
      return await window.canister.aidChain.getTenderedDeliveryDetailsInDistributorsCompany(companyId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

  // getCompletedDeliveryDetailsForWarehouseManager
  export async function getCompletedDeliveryDetailsForWarehouseManager(managerId) {
    try {
      return await window.canister.aidChain.getCompletedDeliveryDetailsForWarehouseManager(managerId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

  // getCompletedDeliveryDetailsInDistributorsCompany
  export async function getCompletedDeliveryDetailsInDistributorsCompany(companyId) {
    try {
      return await window.canister.aidChain.getCompletedDeliveryDetailsInDistributorsCompany(companyId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

  // getAcceptedDeliveryDetailsInDistributorsCompany

  export async function getAcceptedDeliveryDetailsInDistributorsCompany(companyId) {
    try {
      return await window.canister.aidChain.getAcceptedDeliveryDetailsInDistributorsCompany(companyId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

  // getDeliveryDetailsAssignedToDriver
  export async function getDeliveryDetailsAssignedToDriver(driverId) {
    try {
      return await window.canister.aidChain.getDeliveryDetailsAssignedToDriver(driverId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }
  // markDeliveryDetailsAsPicked
  export async function markDeliveryDetailsAsPicked(deliveryId) {
    return window.canister.aidChain.markDeliveryDetailsAsPicked(deliveryId);
  }

  // getDeliveryDetailsPickedUp
  export async function getDeliveryDetailsPickedUp(driverId) {
    try {
      return await window.canister.aidChain.getDeliveryDetailsPickedUp(driverId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

  // getDeliveryDetailsPickedUpForDistributorCompany
  export async function getDeliveryDetailsPickedUpForDistributorCompany(companyId) {
    try {
      return await window.canister.aidChain.getDeliveryDetailsPickedUpForDistributorCompany(companyId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }
  // getRecentDeliveryDetailsAssignedToDriver
  export async function getRecentDeliveryDetailsAssignedToDriver(driverId) {
    try {
      return await window.canister.aidChain.getRecentDeliveryDetailsAssignedToDriver(driverId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

  // markDeliveryDetailsAsCompleted
  export async function markDeliveryDetailsAsCompleted(deliveryId) {
    return window.canister.aidChain.markDeliveryDetailsAsCompleted(deliveryId);
  }

  // getCompletedDeliveryDetailsForDriver
  export async function getCompletedDeliveryDetailsForDriver(driverId) {
    try {
      return await window.canister.aidChain.getCompletedDeliveryDetailsForDriver(driverId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

  // getCompletedDeliveryDetailsForWarehouseManager
  export async function getCompletedDeliveryDetailsForWarehouseManager(managerId) {
    try {
      return await window.canister.aidChain.getCompletedDeliveryDetailsForWarehouseManager(managerId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

  // getCompletedDeliveryDetailsForDistributorCompany
  export async function getCompletedDeliveryDetailsForDistributorCompany(companyId) {
    try {
      return await window.canister.aidChain.getCompletedDeliveryDetailsForDistributorCompany(companyId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }



  // Additional functions eg updateDeliveryStatus, updateDeliveryLocation, updateDeliveryTime, searchDeliveryByStatus, searchDeliveryByLocation, searchDeliveryByTime

  
  
export async function createDeliveryDetails(deliveryDetails) {
    return window.canister.agroChain.createDeliveryDetails(deliveryDetails);
  }

  // addProductToDeliveryDetails
  export async function addProductToDeliveryDetails(deliveryId, productId) {
    return window.canister.agroChain.addProductToDeliveryDetails(deliveryId, productId);
  }

  // addDriverIdToDeliveryDetails
  export async function addDriverIdToDeliveryDetails(deliveryId, driverId) {
    return window.canister.agroChain.addDriverIdToDeliveryDetails(deliveryId, driverId);
  }

  // updateDeliveryDate
  export async function updateDeliveryDate(deliveryId, deliveryDate) {
    return window.canister.agroChain.updateDeliveryDate(deliveryId, deliveryDate);
  }
  
  export async function getAllDeliveryDetails() {
    try {
      return await window.canister.agroChain.getAllDeliveryDetails();
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
      return await window.canister.agroChain.getDeliveryDetails(id);
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
      return await window.canister.agroChain.updateDeliveryDetails(id,deliveryDetails);
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
      return await window.canister.agroChain.getActiveDeliveryDetails();
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
      return await window.canister.agroChain.getNewDeliveryDetailsInDistributorsCompany(companyId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

  // getNewDeliveryDetailsInProcessingCompany
  export async function getNewDeliveryDetailsInProcessingCompany(companyId) {
    try {
      return await window.canister.agroChain.getNewDeliveryDetailsInProcessingCompany(companyId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

  // getTenderedDeliveryDetailsInProcessingCompany
  export async function getTenderedDeliveryDetailsInProcessingCompany(companyId) {
    try {
      return await window.canister.agroChain.getTenderedDeliveryDetailsInProcessingCompany(companyId);
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
      return await window.canister.agroChain.getTenderedDeliveryDetailsInDistributorsCompany(companyId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

  // getCompletedDeliveryDetailsInProcessingCompany
  export async function getCompletedDeliveryDetailsInProcessingCompany(companyId) {
    try {
      return await window.canister.agroChain.getCompletedDeliveryDetailsInProcessingCompany(companyId);
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
      return await window.canister.agroChain.getCompletedDeliveryDetailsInDistributorsCompany(companyId);
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
      return await window.canister.agroChain.getAcceptedDeliveryDetailsInDistributorsCompany(companyId);
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
      return await window.canister.agroChain.getDeliveryDetailsAssignedToDriver(driverId);
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
    return window.canister.agroChain.markDeliveryDetailsAsPicked(deliveryId);
  }

  // getDeliveryDetailsPickedUp
  export async function getDeliveryDetailsPickedUp(driverId) {
    try {
      return await window.canister.agroChain.getDeliveryDetailsPickedUp(driverId);
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
      return await window.canister.agroChain.getDeliveryDetailsPickedUpForDistributorCompany(companyId);
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
      return await window.canister.agroChain.getRecentDeliveryDetailsAssignedToDriver(driverId);
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
    return window.canister.agroChain.markDeliveryDetailsAsCompleted(deliveryId);
  }

  // getCompletedDeliveryDetailsForDriver
  export async function getCompletedDeliveryDetailsForDriver(driverId) {
    try {
      return await window.canister.agroChain.getCompletedDeliveryDetailsForDriver(driverId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

  // getCompletedDeliveryDetailsForProcessingCompany
  export async function getCompletedDeliveryDetailsForProcessingCompany(companyId) {
    try {
      return await window.canister.agroChain.getCompletedDeliveryDetailsForProcessingCompany(companyId);
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
      return await window.canister.agroChain.getCompletedDeliveryDetailsForDistributorCompany(companyId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }



  // Additional functions eg updateDeliveryStatus, updateDeliveryLocation, updateDeliveryTime, searchDeliveryByStatus, searchDeliveryByLocation, searchDeliveryByTime

  
  
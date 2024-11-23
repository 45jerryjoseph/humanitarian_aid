export async function createDeliveryTender(tenderPayload) {
  try {
    return await window.canister.aidChain.createDeliveryTender(tenderPayload);
  } catch (err) {
    console.log(err);
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return {};
  }
}

// acceptDeliveryTender
export async function acceptDeliveryTender(tenderId) {
  try {
    return await window.canister.aidChain.acceptDeliveryTender(tenderId);
  } catch (err) {
    console.log(err);
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
  }
}

export async function getDeliveryTender(id) {
  try {
    return await window.canister.aidChain.getDeliveryTender(id);
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return {};
  }
}

export async function getAllDeliveryTenders() {
  try {
    return await window.canister.aidChain.getAllDeliveryTenders();
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}

// updateDeliveryTender
export async function updateDeliveryTender(id, deliveryTender) {
  try {
    return await window.canister.aidChain.updateDeliveryTender(id, deliveryTender);
  } catch (err) {
    console.log(err);
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
  }
}


// getDeliveryTendersOfWarehouseManager
export async function getDeliveryTendersOfWarehouseManager(warehouseManagerId) {
  try {
    return await window.canister.aidChain.getDeliveryTendersOfWarehouseManager(warehouseManagerId);
  } catch
  (err) {
    console.log(err);
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}

// getDeliveryTendersOfDistributorCompany
export async function getDeliveryTendersOfDistributorCompany(companyId) {
  try {
    return await window.canister.aidChain.getDeliveryTendersOfDistributorCompany(companyId);
  } catch
  (err) {
    console.log(err);
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}

// getTenderedDeliveryDetailsForDistributorCompany
export async function getTenderForDeliveryDetailsForDistributorCompany(companyId,deliveryDetailsId) {
  try {
    return await window.canister.aidChain.getTenderForDeliveryDetailsForDistributorCompany(companyId,deliveryDetailsId);
  } catch
  (err) {
    console.log(err);
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}

// getTenderForDeliveryDetailsForWarehouseManager
export async function getTenderForDeliveryDetailsForWarehouseManager(managerId,deliveryDetailsId) {
  try {
    return await window.canister.aidChain.getTenderForDeliveryDetailsForWarehouseManager(managerId,deliveryDetailsId);
  } catch
  (err) {
    console.log(err);
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}




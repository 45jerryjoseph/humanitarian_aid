export async function createDeliveryTender(tenderPayload) {
  try {
    return await window.canister.agroChain.createDeliveryTender(tenderPayload);
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
    return await window.canister.agroChain.acceptDeliveryTender(tenderId);
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
    return await window.canister.agroChain.getDeliveryTender(id);
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
    return await window.canister.agroChain.getAllDeliveryTenders();
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
    return await window.canister.agroChain.updateDeliveryTender(id, deliveryTender);
  } catch (err) {
    console.log(err);
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
  }
}

// getDeliveryTendersOfProcessingCompany
export async function getDeliveryTendersOfProcessingCompany(companyId) {
  try {
    return await window.canister.agroChain.getDeliveryTendersOfProcessingCompany(companyId);
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
    return await window.canister.agroChain.getDeliveryTendersOfDistributorCompany(companyId);
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
    return await window.canister.agroChain.getTenderForDeliveryDetailsForDistributorCompany(companyId,deliveryDetailsId);
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

// getTenderForDeliveryDetailsForProcessingCompany
export async function getTenderForDeliveryDetailsForProcessingCompany(companyId,deliveryDetailsId) {
  try {
    return await window.canister.agroChain.getTenderForDeliveryDetailsForProcessingCompany(companyId,deliveryDetailsId);
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




export async function createFarmerSalesAdvert(advertPayload) {
    try {
      return await window.canister.agroChain.createFarmerSalesAdvert(advertPayload);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
  }

//   getAllFarmerSalesAdverts
export async function getAllFarmerSalesAdverts() {
    try {
      return await window.canister.agroChain.getAllFarmerSalesAdverts();
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// getFarmerSalesAdvert
export async function getFarmerSalesAdvert(id) {
    try {
      return await window.canister.agroChain.getFarmerSalesAdvert(id);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
}

// updateFarmerSalesAdvert
export async function updateFarmerSalesAdvert(id, advertPayload) {
    try {
      return await window.canister.agroChain.updateFarmerSalesAdvert(id, advertPayload);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// getFarmerSalesAdvertsOfFarmer
export async function getFarmerSalesAdvertsOfFarmer(farmerId) {
    try {
      return await window.canister.agroChain.getFarmerSalesAdvertsOfFarmer(farmerId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}


// getFarmerSalesAdvertsOfProduct
export async function getFarmerSalesAdvertsOfProduct(productId) {
    try {
      return await window.canister.agroChain.getFarmerSalesAdvertsOfProduct(productId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// getFarmerSalesAdvertsOfProcessorCompany
export async function getFarmerSalesAdvertsOfProcessorCompany(processorCompanyId) {
    try {
      return await window.canister.agroChain.getFarmerSalesAdvertsOfProcessorCompany(processorCompanyId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// markFarmerSalesAdvertAsApproved
export async function markFarmerSalesAdvertAsApproved(id) {
    try {
      return await window.canister.agroChain.markFarmerSalesAdvertAsApproved(id);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// getFarmerSalesAdvertsApprovedByProcessorCompany

export async function getFarmerSalesAdvertsApprovedByProcessorCompany(processorCompanyId) {
    try {
      return await window.canister.agroChain.getFarmerSalesAdvertsApprovedByProcessorCompany(processorCompanyId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// getFarmerSalesAdvertsApprovedForFarmer
export async function getFarmerSalesAdvertsApprovedForFarmer(farmerId) {
    try {
      return await window.canister.agroChain.getFarmerSalesAdvertsApprovedForFarmer(farmerId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// getPaidAdverts
export async function getPaidAdverts(processorCompanyId) {
    try {
      return await window.canister.agroChain.getPaidAdverts(processorCompanyId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// getFarmerSalesAdvertsCompletedForFarmer
export async function getFarmerSalesAdvertsCompletedForFarmer(farmerId) {
    try {
      return await window.canister.agroChain.getFarmerSalesAdvertsCompletedForFarmer(farmerId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// markFarmerSalesAdvertAsFarmerPaid
export async function markFarmerSalesAdvertAsFarmerPaid(id) {
    try {
      return await window.canister.agroChain.markFarmerSalesAdvertAsFarmerPaid(id);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// checkIfProductPickedUp
export async function checkIfProductPickedUp(id) {
    try {
      return await window.canister.agroChain.checkIfProductPickedUp(id);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}
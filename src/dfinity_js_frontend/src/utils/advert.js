export async function createAdminProcessingAdvert(advertPayload) {
    try {
      return await window.canister.aidChain.createAdminProcessingAdvert(advertPayload);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
  }

//   getAllAdminProcessingAdverts
export async function getAllAdminProcessingAdverts() {
    try {
      return await window.canister.aidChain.getAllAdminProcessingAdverts();
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// getAdminProcessingAdvert
export async function getAdminProcessingAdvert(id) {
    try {
      return await window.canister.aidChain.getAdminProcessingAdvert(id);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
}

// updateAdminProcessingAdvert
export async function updateAdminProcessingAdvert(id, advertPayload) {
    try {
      return await window.canister.aidChain.updateAdminProcessingAdvert(id, advertPayload);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}


// getAdminProcessingAdvertsOfAdmin
export async function getAdminProcessingAdvertsOfAdmin(adminId) {
    try {
      return await window.canister.aidChain.getAdminProcessingAdvertsOfAdmin(adminId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}


// getAdminProcessingAdvertsOfItem
export async function getAdminProcessingAdvertsOfItem(itemId) {
    try {
      return await window.canister.aidChain.getAdminProcessingAdvertsOfItem(itemId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// getAdminProcessingAdvertsOfWarehouseManager
export async function getAdminProcessingAdvertsOfWarehouseManager(warehouseManagerId) {
    try {
      return await window.canister.aidChain.getAdminProcessingAdvertsOfWarehouseManager(warehouseManagerId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// markAdminProcessingAdvertAsApproved
export async function markAdminProcessingAdvertAsApproved(id) {
    try {
      return await window.canister.aidChain.markAdminProcessingAdvertAsApproved(id);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// getAdminProcessingAdvertsApprovedByWarehouseManager

export async function getAdminProcessingAdvertsApprovedByWarehouseManager(warehouseManagerId) {
    try {
      return await window.canister.aidChain.getAdminProcessingAdvertsApprovedByWarehouseManager(warehouseManagerId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// getAdminProcessingAdvertsApprovedForAdmin
export async function getAdminProcessingAdvertsApprovedForAdmin(adminId) {
    try {
      return await window.canister.aidChain.getAdminProcessingAdvertsApprovedForAdmin(adminId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// getPaidAdminProcessingAdverts
export async function getPaidAdminProcessingAdverts(warehouseManagerId) {
    try {
      return await window.canister.aidChain.getPaidAdminProcessingAdverts(warehouseManagerId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// getAdminProcessingAdvertCompletedForAdmin
export async function getAdminProcessingAdvertCompletedForAdmin(adminId) {
    try {
      return await window.canister.aidChain.getAdminProcessingAdvertCompletedForAdmin(adminId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// markAdminProcessingAdvertAsAdminPaid
export async function markAdminProcessingAdvertAsAdminPaid(id) {
    try {
      return await window.canister.aidChain.markAdminProcessingAdvertAsAdminPaid(id);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// checkIfItemPickedUp
export async function checkIfItemPickedUp(id) {
    try {
      return await window.canister.aidChain.checkIfItemPickedUp(id);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}
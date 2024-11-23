export async function createItem(itemPayload,id) {
    try {
      return await window.canister.aidChain.createItem(itemPayload, id);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
}

// gradeItem
export async function gradeItem(payload) {
    try {
      return await window.canister.aidChain.gradeItem(payload);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// getAllItems
export async function getAllItems() {
    try {
      return await window.canister.aidChain.getAllItems();
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// getItemById
export async function getItemById(id) {
    try {
      return await window.canister.aidChain.getItemById(id);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
}

// updateItem
export async function updateItem(id, itemPayload) {
    try {
      return await window.canister.aidChain.updateItem(id, itemPayload);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// addPackagedDetailsToItem
export async function addPackagedDetailsToItem(itemId, packagedDetails) {
    try {
      return await window.canister.aidChain.addPackagedDetailsToItem(itemId, packagedDetails);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// markItemAsPickedUp
export async function markItemAsPickedUp(itemId) {
    try {
      return await window.canister.aidChain.markItemAsPickedUp(itemId);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// getNewItemsForOwner
export async function getNewItemsForOwner(adminId) {
    try {
      return await window.canister.aidChain.getNewItemsForOwner(adminId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// getGradedItemsForOwner
export async function getGradedItemsForOwner(adminId) {
    try {
      return await window.canister.aidChain.getGradedItemsForOwner(adminId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// getPackagedItemsForOwner
export async function getPackagedItemsForOwner(adminId) {
    try {
      return await window.canister.aidChain.getPackagedItemsForOwner(adminId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}




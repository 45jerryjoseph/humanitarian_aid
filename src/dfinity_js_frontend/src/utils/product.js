export async function createProduct(productPayload,id) {
    try {
      return await window.canister.agroChain.createProduct(productPayload, id);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
}

// gradeProduct
export async function gradeProduct(payload) {
    try {
      return await window.canister.agroChain.gradeProduct(payload);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// getAllProducts
export async function getAllProducts() {
    try {
      return await window.canister.agroChain.getAllProducts();
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// getProduct
export async function getProduct(id) {
    try {
      return await window.canister.agroChain.getProduct(id);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
}

// updateProduct
export async function updateProduct(id, productPayload) {
    try {
      return await window.canister.agroChain.updateProduct(id, productPayload);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// addPackagedDetails
export async function addPackagedDetails(productId, packagedDetails) {
    try {
      return await window.canister.agroChain.addPackagedDetails(productId, packagedDetails);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// markProductAsPickedUp
export async function markProductAsPickedUp(productId) {
    try {
      return await window.canister.agroChain.markProductAsPickedUp(productId);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// getNewProductsForFarmer
export async function getNewProductsForFarmer(farmerId) {
    try {
      return await window.canister.agroChain.getNewProductsForFarmer(farmerId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// getGradedProductsForFarmer
export async function getGradedProductsForFarmer(farmerId) {
    try {
      return await window.canister.agroChain.getGradedProductsForFarmer(farmerId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// getPackagedProductsForFarmer
export async function getPackagedProductsForFarmer(farmerId) {
    try {
      return await window.canister.agroChain.getPackagedProductsForFarmer(farmerId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}




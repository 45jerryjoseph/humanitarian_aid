export async function createFarmer(farmerPayload) {
    try {
      return await window.canister.agroChain.createFarmer(farmerPayload);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
  }

//   getAllFarmers
export async function getAllFarmers() {
    try {
      return await window.canister.agroChain.getAllFarmers();
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

//   getFarmer
export async function getFarmer(id) {
    try {
      return await window.canister.agroChain.getFarmer(id);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
  }

  // getFarmerByOwner
export async function getFarmerByOwner() {
    try {
      return await window.canister.agroChain.getFarmerByOwner();
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
  }
//   updateFarmer
export async function updateFarmer(id, farmerPayload) {
    try {
      return await window.canister.agroChain.updateFarmer(id, farmerPayload);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// addFarmProduct
export async function addFarmProduct(farmerId, productId) {
    try {
      return await window.canister.agroChain.addFarmProduct(farmerId, productId);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// addPickedUpProduct
export async function addPickedUpProduct(farmerId, productId) {
    try {
      return await window.canister.agroChain.addPickedUpProduct(farmerId, productId);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// markProductAsFarmerSold
export async function markProductAsFarmerSold(productId) {
    try {
      return await window.canister.agroChain.markProductAsFarmerSold(productId);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// getFarmerSoldProducts
export async function getFarmerSoldProducts(farmerId) {
    try {
      return await window.canister.agroChain.getFarmerSoldProducts(farmerId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

// updateFarmerRating
export async function updateFarmerRating(farmerId) {
    try {
      return await window.canister.agroChain.updateFarmerRating(farmerId);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// addCertification
export async function addCertification(farmerId, certification) {
    try {
      return await window.canister.agroChain.addCertification(farmerId, certification);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

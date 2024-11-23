export async function createVehicle(vehiclePayload,id) {
    try {
      return await window.canister.aidChain.createVehicle(vehiclePayload,id);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
  }

//   getAllVehicles
export async function getAllVehicles() {
    try {
      return await window.canister.aidChain.getAllVehicles();
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

// getVehicle
export async function getVehicle(vehicleId) {
    try {
      return await window.canister.aidChain.getVehicle(vehicleId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
  }

  // updateVehicle
export async function updateVehicle(vehicleId, vehiclePayload) {
    try {
      return await window.canister.aidChain.updateVehicle(vehicleId, vehiclePayload);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
  }

  // getVehiclesByDistributorCompany
export async function getVehiclesByDistributorCompany(distributorId) {
    try {
      return await window.canister.aidChain.getVehiclesByDistributorCompany(distributorId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }
  
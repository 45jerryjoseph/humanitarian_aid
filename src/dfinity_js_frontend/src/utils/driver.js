export async function createDriver(driver) {
  return window.canister.aidChain.createDriver(driver);
}

export async function getDriverByOwner() {
  return window.canister.aidChain.getDriverByOwner();
}

export async function getDriverByOwnerFilter() {
  return window.canister.aidChain.getDriverByOwnerFilter();
}

export async function getAllDrivers() {
  try {
    return await window.canister.aidChain.getAllDrivers();
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}

export async function getDriver(id) {
  try {
    return await window.canister.aidChain.getDriver(id);
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return {};
  }
}

// getDriverActiveDelivery
export async function getDriverActiveDelivery(driverId) {
  try {
    return await window.canister.aidChain.getDriverActiveDelivery(driverId);
  } catch (err) {
    console.log(err);
    return {};
  }
}

// getDriverCompleteDelivery
export async function getDriverCompleteDelivery(driverId) {
  try {
    return await window.canister.aidChain.getDriverCompleteDelivery(driverId);
  } catch (err) {
    console.log(err);
    return {};
  }
}

// updateDriver
export async function updateDriver(driverId,payload) {
  try {
    return await window.canister.aidChain.updateDriver(driverId,payload);
  } catch (err) {
    console.log(err);
    return {};
  }
}

// addQualification
export async function addQualification(driverId,qualification) {
  try {
    return await window.canister.aidChain.addQualification(driverId,qualification);
  } catch (err) {
    console.log(err);
    return {};
  }
}

// assignVehicle
export async function assignVehicle(driverId,vehicleId) {
  try {
    return await window.canister.aidChain.assignVehicle(driverId,vehicleId);
  } catch (err) {
    console.log(err);
    return {};
  }
}

// Additional Functions Sort driver by Rating



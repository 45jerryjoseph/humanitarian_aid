import { Principal } from "@dfinity/principal";
import { transferICP } from "./ledger";

export async function createDistributorsCompany(distributorsCompany) {
  return window.canister.aidChain.createDistributorsCompany(distributorsCompany);
}

export async function getAllDistributorsCompany() {
  try {
    return await window.canister.aidChain.getAllDistributorsCompany();
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}

export async function getDistributorsCompany(id) {
  try {
    return await window.canister.aidChain.getDistributorsCompany(id);
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return {};
  }
}


export async function updateDistributorsCompany(id, distributorsCompany) {
  try {
    return await window.canister.aidChain.updateDistributorsCompany(
      id,
      distributorsCompany
    );
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return {};
  }
}

// addDriverToDistributorCompany
export async function addDriverToDistributorCompany(companyId, driverId) {
  try {
    return await window.canister.aidChain.addDriverToDistributorCompany(
      companyId,
      driverId
    );
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
  }
}

// getDriversInDistributorCompany
export async function getDriversInDistributorCompany(companyId) {
  try {
    return await window.canister.aidChain.getDriversInDistributorCompany(
      companyId
    );
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
  }
}

// addVehicleToDistributorCompany
export async function addVehicleToDistributorCompany(companyId, vehicleId) {
  try {
    return await window.canister.aidChain.addVehicleToDistributorCompany(
      companyId,
      vehicleId
    );
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
  }
}

// getVehiclesInDistributorCompany
export async function getVehiclesInDistributorCompany(companyId) {
  try {
    return await window.canister.aidChain.getVehiclesInDistributorCompany(
      companyId
    );
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
  }
}

// addCompleteItemsDistributionToDistributorCompany
export async function addCompleteItemsDistributionToDistributorCompany( companyId, productId) {
  try {
    return await window.canister.aidChain.addCompleteItemsDistributionToDistributorCompany(
      companyId,
      productId
    );
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
  }
}

// getCompleteItemsDistributionInDistributorCompany
export async function getCompleteItemsDistributionInDistributorCompany(companyId) {
  try {
    return await window.canister.aidChain.getCompleteItemsDistributionInDistributorCompany(
      companyId
    );
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
  }
}

// getDistributorsCompanyByOwner
export async function getDistributorsCompanyByOwner() {
  try {
    return await window.canister.aidChain.getDistributorsCompanyByOwner();
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return {};
  }
}



// Confirm the below Pay implementation is running correctly
// Additional func getNewDelivery, getActiveDelivery, getCompletedDelivery


export async function payDriver(deliveryTender,amount) {
  const aidChainCanister = window.canister.aidChain;
  const deliveryTenderResponse = await aidChainCanister.createReserveDriverPay(deliveryTender.deliveryTenderId,amount);
  // console.log("first response",deliveryTenderResponse)
  const driverPrincipal = Principal.from(deliveryTenderResponse.Ok.driverReciever);
  const driverAddress = await aidChainCanister.getAddressFromPrincipal(
    driverPrincipal
  );
  const block = await transferICP(
    driverAddress,
    deliveryTenderResponse.Ok.price,
    deliveryTenderResponse.Ok.memo
  );
  await aidChainCanister.completeDriverPayment(
    driverPrincipal,
    deliveryTender.deliveryTenderId,
    deliveryTenderResponse.Ok.price,
    block,
    deliveryTenderResponse.Ok.memo
  );
}


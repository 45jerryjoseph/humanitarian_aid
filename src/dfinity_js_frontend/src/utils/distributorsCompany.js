import { Principal } from "@dfinity/principal";
import { transferICP } from "./ledger";

export async function createDistributorsCompany(distributorsCompany) {
  return window.canister.agroChain.createDistributorsCompany(distributorsCompany);
}

export async function getAllDistributorsCompanies() {
  try {
    return await window.canister.agroChain.getAllDistributorsCompanies();
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
    return await window.canister.agroChain.getDistributorsCompany(id);
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
    return await window.canister.agroChain.updateDistributorsCompany(
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
    return await window.canister.agroChain.addDriverToDistributorCompany(
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
    return await window.canister.agroChain.getDriversInDistributorCompany(
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
    return await window.canister.agroChain.addVehicleToDistributorCompany(
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
    return await window.canister.agroChain.getVehiclesInDistributorCompany(
      companyId
    );
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
  }
}

// addCompleteproductsDistributionToDistributorCompany
export async function addCompleteproductsDistributionToDistributorCompany( companyId, productId) {
  try {
    return await window.canister.agroChain.addCompleteproductsDistributionToDistributorCompany(
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

// getCompleteproductsDistributionInDistributorCompany
export async function getCompleteproductsDistributionInDistributorCompany(companyId) {
  try {
    return await window.canister.agroChain.getCompleteproductsDistributionInDistributorCompany(
      companyId
    );
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
  }
}

// getDistributorCompanyByOwner
export async function getDistributorCompanyByOwner() {
  try {
    return await window.canister.agroChain.getDistributorCompanyByOwner();
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return {};
  }
}


// Additional func getNewDelivery, getActiveDelivery, getCompletedDelivery


export async function payDriver(deliveryTender,amount) {
  const agroChainCanister = window.canister.agroChain;
  const deliveryTenderResponse = await agroChainCanister.createReserveDriverPay(deliveryTender.deliveryTenderId,amount);
  // console.log("first response",deliveryTenderResponse)
  const driverPrincipal = Principal.from(deliveryTenderResponse.Ok.driverReciever);
  const driverAddress = await agroChainCanister.getAddressFromPrincipal(
    driverPrincipal
  );
  const block = await transferICP(
    driverAddress,
    deliveryTenderResponse.Ok.price,
    deliveryTenderResponse.Ok.memo
  );
  await agroChainCanister.completeDriverPayment(
    driverPrincipal,
    deliveryTender.deliveryTenderId,
    deliveryTenderResponse.Ok.price,
    block,
    deliveryTenderResponse.Ok.memo
  );
}


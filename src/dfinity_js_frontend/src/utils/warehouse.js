import { Principal } from "@dfinity/principal";
import { transferICP } from "./ledger";

export async function createWarehouseManager(warehouseManagerPayload) {
  return window.canister.aidChain.createWarehouseManager(warehouseManagerPayload);
}

export async function getAllWarehouseManagers() {
  try {
    return await window.canister.aidChain.getAllWarehouseManagers();
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  } 
}

export async function getWarehouseManager(id) {
  try {
    return await window.canister.aidChain.getWarehouseManager(id);
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return {};
  }
}

export async function updateWarehouseManager(id, warehouseManagerPayload) {
  try {
    return await window.canister.aidChain.updateWarehouseManager(
      id,
      warehouseManagerPayload
    );
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return {};
  }
}

// To be looked at 
// addItemsSuccesfulWarehousing
export async function addItemsSuccesfulWarehousing(managerId, itemId) {
  try {
    return await window.canister.aidChain.addItemsSuccesfulWarehousing(
      managerId,
      itemId
    );
  } catch (err) {
    console.log(err);
    return {};
  }
}

// getItemsSuccesfulWarehousing
export async function getItemsSuccesfulWarehousing(
  managerId
) {
  try {
    return await window.canister.aidChain.getItemsSuccesfulWarehousing(
      managerId
    );
  } catch (err) {
    console.log(err);
    return [];
  }
}

// getWarehouseManagerByOwner
export async function getWarehouseManagerByOwner() {
  try {
    return await window.canister.aidChain.getWarehouseManagerByOwner();
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return {};
  }
}



// export async function payFarmer(advert) {
//   console.log("advert", advert)
//   const aidChainCanister = window.canister.aidChain;
//   const advertResponse = await aidChainCanister.createReserveFarmerPay(advert.farmerSalesAdvertId);
//   const farmerPrincipal = Principal.from(advertResponse.Ok.farmerReciever);
//   const farmerAddress = await aidChainCanister.getAddressFromPrincipal(
//     farmerPrincipal
//   );
//   const block = await transferICP(
//     farmerAddress,
//     advertResponse.Ok.price,
//     advertResponse.Ok.memo
//   );
//   await aidChainCanister.completeFarmerPayment(
//     farmerPrincipal,
//     advert.farmerSalesAdvertId,
//     advertResponse.Ok.price,
//     block,
//     advertResponse.Ok.memo
//   );
// }

// function to pay Distributors
export async function payDistributors(deliveryTender) {
  const aidChainCanister = window.canister.aidChain;
  const deliveryTenderResponse = await aidChainCanister.createReserveDistributorPay(deliveryTender.deliveryTenderId);
  const distributorPrincipal = Principal.from(deliveryTenderResponse.Ok.distributorReciever);
  const distributorAddress = await aidChainCanister.getAddressFromPrincipal(
    distributorPrincipal
  );
  const block = await transferICP(
    distributorAddress,
    deliveryTenderResponse.Ok.price,
    deliveryTenderResponse.Ok.memo
  );
  await aidChainCanister.completeDistributorPayment(
    distributorPrincipal,
    deliveryTender.deliveryTenderId,
    deliveryTenderResponse.Ok.price,
    block,
    deliveryTenderResponse.Ok.memo
  );
}

// Additional functions Search for Company, getProcessingCompanyActiveDelivery, as well as completedDelivery

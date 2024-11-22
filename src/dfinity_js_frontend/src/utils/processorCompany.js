import { Principal } from "@dfinity/principal";
import { transferICP } from "./ledger";

export async function createProcessingCompany(processingCompany) {
  return window.canister.agroChain.createProcessingCompany(processingCompany);
}

export async function getAllProcessingCompanies() {
  try {
    return await window.canister.agroChain.getAllProcessingCompanies();
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  } 
}

export async function getProcessingCompany(id) {
  try {
    return await window.canister.agroChain.getProcessingCompany(id);
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return {};
  }
}

export async function updateProcessingCompany(id, processingCompany) {
  try {
    return await window.canister.agroChain.updateProcessingCompany(
      id,
      processingCompany
    );
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return {};
  }
}

// addProductsSuccesfulProcessing
export async function addProductsSuccesfulProcessing(companyId, productId) {
  try {
    return await window.canister.agroChain.addProductsSuccesfulProcessing(
      companyId,
      productId
    );
  } catch (err) {
    console.log(err);
    return {};
  }
}

// getProductsSuccesfulProcessingInProcessingCompany
export async function getProductsSuccesfulProcessingInProcessingCompany(
  companyId
) {
  try {
    return await window.canister.agroChain.getProductsSuccesfulProcessingInProcessingCompany(
      companyId
    );
  } catch (err) {
    console.log(err);
    return [];
  }
}

// getProcessingCompanyByOwner
export async function getProcessingCompanyByOwner() {
  try {
    return await window.canister.agroChain.getProcessingCompanyByOwner();
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return {};
  }
}



export async function payFarmer(advert) {
  console.log("advert", advert)
  const agroChainCanister = window.canister.agroChain;
  const advertResponse = await agroChainCanister.createReserveFarmerPay(advert.farmerSalesAdvertId);
  const farmerPrincipal = Principal.from(advertResponse.Ok.farmerReciever);
  const farmerAddress = await agroChainCanister.getAddressFromPrincipal(
    farmerPrincipal
  );
  const block = await transferICP(
    farmerAddress,
    advertResponse.Ok.price,
    advertResponse.Ok.memo
  );
  await agroChainCanister.completeFarmerPayment(
    farmerPrincipal,
    advert.farmerSalesAdvertId,
    advertResponse.Ok.price,
    block,
    advertResponse.Ok.memo
  );
}

export async function payDistributors(deliveryTender) {
  const agroChainCanister = window.canister.agroChain;
  const deliveryTenderResponse = await agroChainCanister.createReserveDistributorPay(deliveryTender.deliveryTenderId);
  const distributorPrincipal = Principal.from(deliveryTenderResponse.Ok.distributorReciever);
  const distributorAddress = await agroChainCanister.getAddressFromPrincipal(
    distributorPrincipal
  );
  const block = await transferICP(
    distributorAddress,
    deliveryTenderResponse.Ok.price,
    deliveryTenderResponse.Ok.memo
  );
  await agroChainCanister.completeDistributorPayment(
    distributorPrincipal,
    deliveryTender.deliveryTenderId,
    deliveryTenderResponse.Ok.price,
    block,
    deliveryTenderResponse.Ok.memo
  );
}

// Additional functions Search for Company, getProcessingCompanyActiveDelivery, as well as completedDelivery

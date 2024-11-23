export async function createAdmin(adminpayload) {
    try {
      return await window.canister.aidchain.createAdmin(adminpayload);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
  }

//   getAllAdmins
export async function getAllAdmins() {
    try {
      return await window.canister.aidchain.getAllAdmins();
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }

//getAdmin
export async function getAdmin(id) {
    try {
      return await window.canister.aidchain.getAdmin(id);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
  }

  // getAdminByOwner
export async function getAdminByOwner() {
    try {
      return await window.canister.aidchain.getAdminByOwner();
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
  }
//   updateAdmin
export async function updateAdmin(id, farmerPayload) {
    try {
      return await window.canister.aidchain.updateAdmin(id, farmerPayload);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// addItem <- This is item that is Available known by (RedCross) organisation 
export async function addAdminItem(adminId, itemId) {
    try {
      return await window.canister.aidchain.addAdminItem(adminId, itemId);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// addPickedUpProduct
export async function addPickedUpItem(adminId, itemId) {
    try {
      return await window.canister.aidchain.addPickedUpItem(adminId, itemId);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// markItemAsWarehousePaid
export async function markItemAsWarehousePaid(itemId) {
    try {
      return await window.canister.aidchain.markItemAsWarehousePaid(itemId);
    } catch (err) {
      console.log(err);
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
    }
}

// getWarehousePaidItems
export async function getWarehousePaidItems(farmerId) {
    try {
      return await window.canister.aidchain.getWarehousePaidItems(farmerId);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
}

//Enable this section below to be able to pay warehouse
// Pay Warehouse
export async function payWarehouse(advert) {
    console.log("advert", advert)
    const aidChainCanister = window.canister.aidChain;
    const advertResponse = await aidChainCanister.createReserveWarehousePay(advert.warehouseSalesAdvertId);
    const warehousePrincipal = Principal.from(advertResponse.Ok.warehouseReciever);
    const warehouseAddress = await aidChainCanister.getAddressFromPrincipal(
      warehousePrincipal
    );
    const block = await transferICP(
      warehouseAddress,
      advertResponse.Ok.price,
      advertResponse.Ok.memo
    );
    await aidChainCanister.completeWarehousePayment(
      warehousePrincipal,
      advert.warehouseSalesAdvertId,
      advertResponse.Ok.price,
      block,
      advertResponse.Ok.memo
    );
  }

// }
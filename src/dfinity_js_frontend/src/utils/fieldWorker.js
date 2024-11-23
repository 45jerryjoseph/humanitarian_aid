// createFieldWorker
export async function createFieldWorker(fieldWorker) {
    return window.canister.aidChain.createDriver(fieldWorker);
  }
  
  // getDriverByOwner
  export async function getFieldWorkerByOwnerFilter() {
    return window.canister.aidChain.getFieldWorkerByOwnerFilter();
  }
  
  // getAllFieldWorkers
  export async function getAllFieldWorkers() {
    try {
      return await window.canister.aidChain.getAllFieldWorkers();
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return [];
    }
  }
  
  // getFieldWorker
  export async function getFieldWorker(id) {
    try {
      return await window.canister.aidChain.getFieldWorker(id);
    } catch (err) {
      if (err.name === "AgentHTTPResponseError") {
        const authClient = window.auth.client;
        await authClient.logout();
      }
      return {};
    }
  }
  
  
  // updateFieldWorker
  export async function updateFieldWorker(fieldWorkerId,payload) {
    try {
      return await window.canister.aidChain.updateFieldWorker(fieldWorkerId,payload);
    } catch (err) {
      console.log(err);
      return {};
    }
  }

  
  
  
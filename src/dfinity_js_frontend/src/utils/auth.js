import { AuthClient } from "@dfinity/auth-client";

// that is the url of the webapp for the internet identity. 
const IDENTITY_PROVIDER = `http://localhost:4943/?canisterId=bd3sg-teaaa-aaaaa-qaaba-cai#authorize`; //this is for local
// https://5277e-paaaa-aaaak-akufq-cai.icp0.io/
// https://identity.ic0.app
// const IDENTITY_PROVIDER = `https://5277e-paaaa-aaaak-akufq-cai.icp0.io/?canisterId=bd3sg-teaaa-aaaaa-qaaba-cai#authorize`;
// const IDENTITY_PROVIDER = `https://identity.ic0.app`;
const MAX_TTL = 7 * 24 * 60 * 60 * 1000 * 1000 * 1000;

export async function getAuthClient() {
    return await AuthClient.create();
}

export async function login() {
    const authClient = window.auth.client;

    const isAuthenticated = await authClient.isAuthenticated();

    if (!isAuthenticated) {
        await authClient?.login({
            identityProvider: IDENTITY_PROVIDER,
            onSuccess: async () => {
                window.auth.isAuthenticated = await authClient.isAuthenticated();
                window.location.reload();
            },
            maxTimeToLive: MAX_TTL,
        });
    }
}

export async function logout() {
    const authClient = window.auth.client;
    authClient.logout();
    window.location.reload();
}
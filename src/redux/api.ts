// Stub of apps/web-app/src/redux/api.ts. The playground has no RTK Query store
// and no backend; the only thing copied components need from this module is the
// base URL, which LanguageFlagIcon uses to build <img src> for the flag assets
// the API serves.
//
// Empty string means same origin, where server/flags.ts answers /flags/<code>.svg
// the way the real backend does. Point it at a real environment if a prototype
// needs something else from the API.
export const apiBaseUrl = "";

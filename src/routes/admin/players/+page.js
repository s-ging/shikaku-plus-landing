// The players page runs in the browser only: it needs the signed-in session
// with its second factor, which the server render doesn't carry.
export const ssr = false;

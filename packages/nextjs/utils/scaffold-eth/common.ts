// To be used in JSON.stringify when a field might be bigint
// https://wagmi.sh/react/faq#bigint-serialization
export const replacer = (key: string, value: unknown) => (typeof value === "bigint" ? value.toString() : value);

export const API_ACTIONS = {
  checkPrediction: "getPrediction",
  setRange: "setRange",
  getRange: "getRange",
  getUsers: "getUsers",
};

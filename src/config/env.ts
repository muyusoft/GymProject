import Constants from "expo-constants";

interface EnvVars {
  API_URL: string;
  API_TIMEOUT: number;
  ENVIRONMENT: "development" | "preview" | "production";
}

const env: EnvVars = {
  API_URL: Constants.expoConfig?.extra?.API_URL || "http://localhost:3000",
  API_TIMEOUT: Constants.expoConfig?.extra?.API_TIMEOUT || 30000,
  ENVIRONMENT: (Constants.expoConfig?.extra?.ENVIRONMENT ||
    "development") as EnvVars["ENVIRONMENT"],
};

export default env;

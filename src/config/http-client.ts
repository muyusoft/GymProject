import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import env from "./env";
import { logger } from "./logger";

const httpClient: AxiosInstance = axios.create({
  baseURL: env.API_URL,
  timeout: env.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de request: añadir token + logger
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Log del request
    logger.debug("HTTP Request", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
    });

    // Aquí irá la lógica para añadir el token de autenticación
    // TODO: import token from auth store
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => {
    logger.error("HTTP Request Error", {
      message: error.message,
    });
    return Promise.reject(error);
  },
);

// Interceptor de response: manejar errores comunes + logger
httpClient.interceptors.response.use(
  (response) => {
    // Log del response exitoso
    logger.info("HTTP Response", {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
    });

    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();

    // Log del error
    logger.error("HTTP Error", {
      status,
      url,
      method,
      message: error.message,
      errorData: error.response?.data,
    });

    if (status === 401) {
      // Token expirado o no autenticado
      logger.warn("Unauthorized - Token expired or invalid", {
        url,
      });
      // TODO: trigger logout
      // useAuthStore.getState().logout();
    }

    if (status === 500) {
      // Error del servidor
      logger.error("Server Error", {
        url,
        data: error.response?.data,
      });
    }

    return Promise.reject(error);
  },
);

export default httpClient;

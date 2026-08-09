import axios, { type AxiosError, type AxiosInstance, type AxiosResponse } from "axios";

const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Crucial for HTTP-only cookies!
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Runs for every successful response (2xx)
    return response;
  },
  (error: AxiosError) => {
    if(error?.response?.status === 401) {
      console.error("Unauthenticated");
    }

    return Promise.reject(error);
  }
)

export default axiosClient;
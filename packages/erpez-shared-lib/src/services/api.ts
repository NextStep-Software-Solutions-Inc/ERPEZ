import axios from "axios";
export { CanceledError } from "axios";
export type { AxiosInstance, AxiosResponse, AxiosError } from "axios";

export const createAxiosInstance = (
  baseURL: string,
  timeout: number = 10000
) => {
  return axios.create({
    baseURL,
    timeout,
  });
};

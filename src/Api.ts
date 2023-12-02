import axios from "axios";

export abstract class Api {
  static async get<T>(url: string) {
    const response = await axios.get(url);
    return response.data as T;
  }
}
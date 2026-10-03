import httpClient from "@/config/http-client";

interface ExampleItem {
  id: string;
  name: string;
}

export const exampleService = {
  async getItems(): Promise<ExampleItem[]> {
    const { data } = await httpClient.get("/items");
    return data;
  },

  async getItemById(id: string): Promise<ExampleItem> {
    const { data } = await httpClient.get(`/items/${id}`);
    return data;
  },

  async createItem(item: Omit<ExampleItem, "id">): Promise<ExampleItem> {
    const { data } = await httpClient.post("/items", item);
    return data;
  },
};

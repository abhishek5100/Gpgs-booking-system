import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const apiClient = axios.create({
    baseURL: "https://fakestoreapi.com",
});

const getProduct = async () => {
    const result = await apiClient.get("/products");
    return result.data;
};

export const useProductData = () => {
    return useQuery({
        queryKey: ["product"],
        queryFn: getProduct,
    });
};

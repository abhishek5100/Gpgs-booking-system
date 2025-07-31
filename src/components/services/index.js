import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000", // make sure your Express server runs here
});

// POST request to send booking data
const addBooking = async (data) => {
  const response = await apiClient.post("/add-row", data);
  return response.data;
};

export const useAddBooking = () => {
  return useMutation({
    mutationFn: addBooking,
  });   
};

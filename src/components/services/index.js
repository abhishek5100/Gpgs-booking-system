import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://gpgs-booking-system.vercel.app/api", // make sure your Express server runs here
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



// GET request to fetch property data
const fetchPropertyData = async () => {
  const response = await apiClient.get("/properties-data");
  return response.data;
};

// React Query hook to fetch property data
export const usePropertyData = () => {
  return useQuery({
    queryKey: ["properties"],
    queryFn: fetchPropertyData,
  });
};



const fetchPropertySheetData = async (sheetId) => {
  const response = await apiClient.get(`/property-sheet-data?sheetId=${sheetId}`);
  return response.data;
};

export const usePropertySheetData = (sheetId, enabled) => {
  return useQuery({
    queryKey: ["property-sheet", sheetId],
    queryFn: () => fetchPropertySheetData(sheetId),
    enabled: !!sheetId && enabled, // Only fetch when sheetId is available
  });
};



// const fetchEmployeeDetailsData = async () => {
//   const response = await apiClient.get("/Employees-details");
//   return response.data;
// };

// // React Query hook to fetch property data
// export const useEmployeeDetails = () => {
//   return useQuery({
//     queryKey: ["EmployeeDetails"],
//     queryFn: fetchEmployeeDetailsData,
//   });
// };




import React, { useState, useCallback, memo, useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import Select from "react-select";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ConfirmationModel from './ConfirmationModel';
import { useAddBooking, useEmployeeDetails, usePropertyData, usePropertySheetData } from './services';
import LoaderPage from './LoaderPage';

// Memoized Select Component to prevent unnecessary re-renders
const MemoizedSelect = memo(({ field, options, placeholder, isDisabled, onChange, styles }) => (
  <Select
    {...field}
    value={options?.find((opt) => opt.value === (field.value?.value || field.value))}
    isDisabled={isDisabled}
    options={options}
    placeholder={placeholder}
    styles={styles}
    onChange={onChange}
  />
));

// Memoized Property Form Section
const PropertyFormSection = memo(({
  titlePrefix,
  control,
  errors,
  singleSheetData,
  isPropertySheetData,
  selectedBedNumber,
  tempSelectedBedNumber,
  handlePropertyCodeChange,
  handleBedNoChange,
  activeTab,
  register,
  setValue,
  propertyList
}) => {
  const inputClass = 'w-full px-3 py-2 mt-1 border-2 border-orange-200 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400';

  const renderError = (field) =>
    errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]?.message}</p>;

  // Use useWatch for better performance
  const watchStartDate = useWatch({
    control,
    name: `${titlePrefix}BedDOJ`,
  });
  console.log("watchStartDate", watchStartDate)
  const watchEndDate = useWatch({
    control,
    name: `${titlePrefix}BedLDt`,
  });

  const watchMonthlyRent = useWatch({
    control,
    name: `${titlePrefix}BedMonthlyFixRent`,
  });
  // Auto-calculate Rent Amount with useCallback to prevent recreation
  useEffect(() => {
    if (watchStartDate && watchMonthlyRent) {
      const start = new Date(watchStartDate);
      const end = watchEndDate ? new Date(watchEndDate) : null;

      // Normalize time
      start.setHours(0, 0, 0, 0);
      if (end) end.setHours(0, 0, 0, 0);

      if (isNaN(start.getTime())) {
        setValue(`${titlePrefix}BedRentAmt`, "");
        return;
      }

      const dailyRent = parseFloat(watchMonthlyRent) / 30;
      let totalRent = 0;

      if (end && !isNaN(end.getTime())) {
        // ✅ Case: start to end date (inclusive)
        const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        totalRent = Math.round(dailyRent * diffDays);
      } else {
        // ✅ Case: start to end of that month
        const lastDayOfMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        lastDayOfMonth.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((lastDayOfMonth.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        totalRent = Math.round(dailyRent * diffDays);
      }

      setValue(`${titlePrefix}BedRentAmt`, totalRent);
    } else {
      setValue(`${titlePrefix}BedRentAmt`, "");
    }
  }, [watchStartDate, watchEndDate, watchMonthlyRent, setValue, titlePrefix]);

  // Select styles defined outside render to prevent recreation
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      width: "100%",
      paddingTop: "0.25rem",
      paddingBottom: "0.10rem",
      paddingLeft: "0.75rem",
      paddingRight: "0.50rem",
      marginTop: "0.30rem",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: state.isFocused ? "#fb923c" : "#f97316",
      borderRadius: "0.375rem",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(251,146,60,0.5)"
        : "0 1px 2px rgba(0,0,0,0.05)",
      backgroundColor: "white",
      minHeight: "40px",
      "&:hover": { borderColor: "#fb923c" },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: 0,
    }),
    placeholder: (base) => ({
      ...base,
      color: "#000",
      marginLeft: 0,
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#fb923c"
        : state.isFocused
          ? "rgba(251,146,60,0.1)"
          : "white",
      color: state.isSelected ? "white" : "#000",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#fb923c",
        color: "white",
      },
    }),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Property Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Property Code</label>
        <Controller
          name={`${titlePrefix}PropCode`}
          control={control}
          defaultValue={null}
          render={({ field }) => {
            const options = propertyList?.data?.map((item) => ({
              value: `${item["PG Main  Sheet ID"]},${item["Bed Count"]},${item["Property Code"]}`,
              label: item["Property Code"],
            })) || [];

            return (
              <MemoizedSelect
                field={field}
                options={options}
                placeholder="Search & Select Property Code"
                styles={selectStyles}
                onChange={(selectedOption) => {
                  field.onChange(selectedOption);
                  handlePropertyCodeChange(
                    { target: { value: selectedOption?.value || "" } },
                    titlePrefix
                  );
                }}
              />
            );
          }}
        />
        {renderError(`${titlePrefix}PropCode`)}
      </div>

      {/* Bed No */}
   {activeTab == "permanent" && (
      <div className="relative">
        <label className="text-sm font-medium text-gray-700 relative after:content-['*'] after:ml-1 after:text-red-500">
          Bed No
        </label>

        {isPropertySheetData && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10 rounded">
            <LoaderPage />
          </div>
        )}

        <Controller
          name={`PermBedNo`}
          control={control}
          defaultValue={
            tempSelectedBedNumber
                ? { value: tempSelectedBedNumber, label: String(tempSelectedBedNumber) }
                : null
          }


          render={({ field }) => {
            const options = isPropertySheetData
              ? []
              : singleSheetData?.data?.length > 0
                ? singleSheetData.data.map((ele) => ({
                  value: ele.BedNo,
                  label: ele.BedNo,
                }))
                : [{ value: "", label: "No beds available", isDisabled: true }];

            return (
              <MemoizedSelect
                field={field}
                options={options}
                isDisabled={isPropertySheetData}
                placeholder="Search & Select Bed No"
                styles={selectStyles}
                onChange={(selectedOption) => {
                  field.onChange(selectedOption);
                  handleBedNoChange(
                    { target: { value: selectedOption?.value || "" } },
                    titlePrefix
                  );
                }}
              />
            );
          }}
        />
        {renderError(`${titlePrefix}BedNo`)}
      </div>
  )}

   {activeTab == "temporary" && (
      <div className="relative">
        <label className="text-sm font-medium text-gray-700 relative after:content-['*'] after:ml-1 after:text-red-500">
          Bed No
        </label>

        {isPropertySheetData && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10 rounded">
            <LoaderPage />
          </div>
        )}

        <Controller
          name={`TempBedNo`}
          control={control}
          defaultValue={
            selectedBedNumber
              ? { value: selectedBedNumber, label: String(selectedBedNumber) }
              : null
          }


          render={({ field }) => {
            const options = isPropertySheetData
              ? []
              : singleSheetData?.data?.length > 0
                ? singleSheetData.data.map((ele) => ({
                  value: ele.BedNo,
                  label: ele.BedNo,
                }))
                : [{ value: "", label: "No beds available", isDisabled: true }];

            return (
              <MemoizedSelect
                field={field}
                options={options}
                isDisabled={isPropertySheetData}
                placeholder="Search & Select Bed No"
                styles={selectStyles}
                onChange={(selectedOption) => {
                  field.onChange(selectedOption);
                  handleBedNoChange(
                    { target: { value: selectedOption?.value || "" } },
                    titlePrefix
                  );
                }}
              />
            );
          }}
        />
        {renderError(`${titlePrefix}BedNo`)}
      </div>
      )}

      {/* Room No */}
      <div>
        <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Room No</label>
        <input
          type='text'
          {...register(`${titlePrefix}RoomNo`)}
          disabled
          className={inputClass}
        />
        {renderError(`${titlePrefix}RoomNo`)}
      </div>

      {/* AC / Non AC */}
      <div>
        <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500"> AC / Non AC</label>
        <input
          type="text"
          {...register(`${titlePrefix}ACRoom`)}
          disabled
          className={inputClass}
        />
        {renderError(`${titlePrefix}ACRoom`)}
      </div>

      {/* Monthly Fixed Rent */}
      <div>
        <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500"> Monthly Fixed Rent ( ₹ )</label>
        <input
          type="number"
          {...register(`${titlePrefix}BedMonthlyFixRent`)}
          disabled
          className={inputClass}
        />
        {renderError(`${titlePrefix}BedMonthlyFixRent`)}
      </div>

      {/* Deposit Amount (only for permanent) */}
      {activeTab !== "temporary" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500"> Deposit Amount ( ₹ )</label>
          <input
            type="number"
            {...register(`${titlePrefix}BedDepositAmt`)}
            disabled
            className={inputClass}
          />
          {renderError(`${titlePrefix}BedDepositAmt`)}
        </div>
      )}

      {/* Client DOJ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Client DOJ</label>
        <input
          type="date"
          {...register(`${titlePrefix}BedDOJ`)}
          className={inputClass}
        />
        {renderError(`${titlePrefix}BedDOJ`)}
      </div>

      {/* Client Last Date */}
      {activeTab === "temporary" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Client Last Date </label>
          <input
            type="date"
            {...register(`${titlePrefix}BedLDt`)}
            className={inputClass}
          />
          {renderError(`${titlePrefix}BedLDt`)}
        </div>
      )}

      {/* Optional Client Last Date for permanent */}
      {activeTab === "permanent" && (
        <div>
          <label>Client Last Date (Optional)</label>
          <input
            type="date"
            {...register(`${titlePrefix}BedLDt`)}
            className={inputClass}
          />
          {renderError(`${titlePrefix}BedLDt`)}
        </div>
      )}

      {/* Rent Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500"> Rent Amount As Per Client DOJ ( ₹ )</label>
        <input
          type="number"
          {...register(`${titlePrefix}BedRentAmt`)}
          className={inputClass}
          disabled={true}
        />
        {renderError(`${titlePrefix}BedRentAmt`)}
      </div>

      {/* Processing Fees (only for permanent) */}
      {activeTab !== "temporary" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Processing Fees ( ₹ )</label>
          <input
            type="text"
            {...register(`ProcessingFeesAmt`)}
            className={inputClass}
          />
          {renderError(`ProcessingFeesAmt`)}
        </div>
      )}

      {/* Upcoming Rent Hike Date (only for permanent) */}
      {activeTab !== "temporary" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Upcoming Rent Hike Date</label>
          <input
            type="text"
            {...register(`${titlePrefix}UpcomingRentHikeDt`)}
            disabled
            className={inputClass}
          />
          {renderError(`${titlePrefix}UpcomingRentHikeDt`)}
        </div>
      )}

      {/* Upcoming Rent Hike Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Upcoming Rent Hike Ammount ( ₹ )</label>
        <input
          type="text"
          {...register(`${titlePrefix}UpcomingRentHikeAmt`)}
          className={inputClass}
          disabled
        />
        {renderError(`${titlePrefix}UpcomingRentHikeAmt`)}
      </div>

      {/* Comments */}
      <div>
        <label>Comments</label>
        <textarea
          type="text"
          {...register(`${titlePrefix}Comments`)}
          className={inputClass}
        />
        {renderError(`${titlePrefix}Comments`)}
      </div>
    </div>
  );
});

const BookingForm = () => {
  const [showPermanent, setShowPermanent] = useState(false);
  const [showtemporary, setShowtemporary] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formPreviewData, setFormPreviewData] = useState(null);
  const [selectedSheetId, setSelctedSheetId] = useState(null);
  const [selectedBedNumber, setSelectedBedNumber] = useState(null);
  const [tempSelectedBedNumber, settempSelectedBedNumber] = useState(null);
  const [permanentPropertyFilledChecked, setPermanentPropertyFilledChecked] = useState()

  // Validation schema
  const schema = yup.object().shape({
    // Date: yup.date().required('Date is required'),
    SalesMember: yup.string().required('Sales person is required'),
    ClientFullName: yup.string().required('Client name is required'),
    WhatsAppNo: yup
      .string()
      .matches(/^[0-9]{10}$/, 'Enter valid 10-digit WhatsApp number')
      .required('WhatsApp number is required'),
    CallingNo: yup
      .string()
      .matches(/^[0-9]{10}$/, 'Enter valid 10-digit calling number')
      .required('Calling number is required'),
    EmgyCont1FullName: yup.string().required('Emergency Contact1 Full Name is required'),
    EmgyCont1No: yup
      .string()
      .matches(/^[0-9]{10}$/, 'Enter valid 10-digit contact number'),
    EmgyCont2FullName: yup.string().required('Emergency Contact2 Full Name is required'),
    EmgyCont2No: yup
      .string()
      .matches(/^[0-9]{10}$/, 'Enter valid 10-digit contact number'),

    // Permanent
    PermPropCode: yup.string().when('$showPermanent', {
      is: true,
      then: schema => schema.required('Property code is required'),
      otherwise: schema => schema,
    }),
    PermBedNo: yup.string().when('$showPermanent', {
      is: true,
      then: schema => schema.required('Bed number is required'),
      otherwise: schema => schema,
    }),
    PermBedDOJ: yup.string().when('$showPermanent', {
      is: true,
      then: schema => schema.required('Rent start date is required'),
      otherwise: schema => schema,
    }),
    PermBedRentAmt: yup.number().when('$showPermanent', {
      is: true,
      then: schema => schema.required('Rent amount is required'),
      otherwise: schema => schema,
    }),
    ProcessingFeesAmt: yup.number().when('$showPermanent', {
      is: true,
      then: schema => schema.required('Processing fee is required'),
      otherwise: schema => schema,
    }),
    // PermUpcomingRentHikeDt: yup.date().when('$showPermanent', {
    //   is: true,
    //   then: schema => schema.required('Revision date is required'),
    //   otherwise: schema => schema,
    // }),

    // temporary
    TempPropCode: yup.string().when('$showtemporary', {
      is: true,
      then: schema => schema.required('Property code is required'),
      otherwise: schema => schema,
    }),
    TempBedNo: yup.string().when('$showtemporary', {
      is: true,
      then: schema => schema.required('Bed number is required'),
      otherwise: schema => schema,
    }),
    TempRoomNo: yup.string().when('$showtemporary', {
      is: true,
      then: schema => schema.required('Room number is required'),
      otherwise: schema => schema,
    }),
    TempBedRentAmt: yup.string().when('$showtemporary', {
      is: true,
      then: schema => schema.required('Rent amount is required'),
      otherwise: schema => schema,
    }),
  });

  const { mutate: submitBooking, isLoading: isBookingLoading } = useAddBooking();
  const { data: propertyList, isLoading: isPropertyLoading } = usePropertyData();
  const { data: EmployeeDetails } = useEmployeeDetails();
  const { data: singleSheetData, isLoading: isPropertySheetData } = usePropertySheetData(selectedSheetId);

  const {
    register,
    handleSubmit,
    setValue,
    resetField,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    context: { showPermanent, showtemporary },
  });


  const formData = watch();

  useEffect(() => {
    if (!formData) return;

    const permCount = Object.entries(formData)
      .filter(([key, value]) =>
        key.startsWith("Perm") &&
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ).length;
    setPermanentPropertyFilledChecked(permCount)
    console.log("✅ Perm data count:", permCount);
  }, [formData]);




  // console.log(watch().PermBedMonthlyFixRent)
  // Memoized handlers to prevent recreation on each render
  const resetTabFields = useCallback((prefix) => {
    const fieldsToReset = [
      "PropCode",
      "BedNo",
      "RoomNo",
      "ACRoom",
      "BedMonthlyFixRent",
      "BedDepositAmt",
      "BedDOJ",
      "BedLDt",
      "BedRentAmt",
      "ProcessingFeesAmt",
      "UpcomingRentHikeDt",
      "UpcomingRentHikeAmt",
      "Comments"
    ];

    fieldsToReset.forEach((field) => {
      resetField(`${prefix}${field}`);
    });

  }, [resetField]);

  const AskFor = [
    { value: "Booking_Amount", label: "Booking Amount" },
    { value: "Full_Amount", label: "Full Amount" }
  ];

  const handlePropertyCodeChange = useCallback((e, titlePrefix) => {
    const value = e.target.value;
    setSelctedSheetId(value);

    setValue(`${titlePrefix}PropCode`, value);
    setValue(`${titlePrefix}AcRoom`, "");
    setValue(`${titlePrefix}BedNo`, "");
    setValue(`${titlePrefix}BedRentAmt`, "");
    setValue(`${titlePrefix}roomNo`, "");
    setValue(`${titlePrefix}roomAcNonAc`, "");
    setValue(`${titlePrefix}BedMonthlyFixRent`, "");
    setValue(`${titlePrefix}BedDepositAmt`, "");
    setValue(`${titlePrefix}ProcessingFeesAmount`, "");
    setValue(`${titlePrefix}UpcomingRentHikeDt`, "");
    setValue(`${titlePrefix}RoomNo`, "");
  }, [setValue]);

  const handleBedNoChange = useCallback((e, titlePrefix) => {
    const selectedBedNo = e.target.value;
    setSelectedBedNumber(selectedBedNo);
    settempSelectedBedNumber(selectedBedNo)
    const matchedRow = singleSheetData?.data?.find(
      (row) => row["BedNo"]?.trim() === selectedBedNo
    );

    if (matchedRow) {
      const acNonAc = matchedRow["ACRoom"]?.trim() || "";
      const rentAmt = matchedRow["MFR"] || "";

      setValue(`${titlePrefix}ACRoom`, acNonAc);
      setValue(`${titlePrefix}BedNo`, selectedBedNo);
      setValue(`${titlePrefix}BedMonthlyFixRent`, rentAmt);
      setValue(`${titlePrefix}BedDepositAmt`, matchedRow["DA"]?.trim() || "");
      setValue(`${titlePrefix}UpcomingRentHikeDt`, matchedRow["URHD"]?.trim() || "");
      setValue(`${titlePrefix}UpcomingRentHikeAmt`, matchedRow["URHA"]?.trim() || "");
      setValue(`${titlePrefix}RoomNo`, matchedRow["RoomNo"]?.trim() || "");
    } else {
      setValue(`${titlePrefix}AcRoom`, "");
      setValue(`${titlePrefix}BedRentAmt`, "");
      setValue(`${titlePrefix}roomNo`, "");
      setValue(`${titlePrefix}roomAcNonAc`, "");
      setValue(`${titlePrefix}BedMonthlyFixRent`, "");
      setValue(`${titlePrefix}BedDepositAmt`, "");
      setValue(`${titlePrefix}UpcomingRentHikeAmt`, "");
      setValue(`${titlePrefix}revisionAmount`, "");
      setValue(`${titlePrefix}RoomNo`, "");
      setValue(`${titlePrefix}BedNo`, selectedBedNo);
    }
  }, [singleSheetData, setValue]);

  const handlePermanentCheckbox = useCallback((checked) => {
    if (!checked) {
      resetTabFields("Perm");
    }
    setShowPermanent(checked);
    if (!checked && activeTab === 'permanent') {
      if (showtemporary) setActiveTab('temporary');
      else setActiveTab('');
    } else if (checked && !activeTab) {
      setActiveTab('permanent');
    }
  }, [resetTabFields, activeTab, showtemporary]);

  const handletemporaryCheckbox = useCallback((checked) => {
    if (!checked) {
      resetTabFields("Temp");
    }
    setShowtemporary(checked);
    setSelectedBedNumber("")
    if (!checked && activeTab === 'temporary') {
      if (showPermanent) setActiveTab('permanent');
      else setActiveTab('');
    } else if (checked && !activeTab) {
      setActiveTab('temporary');
    }
  }, [resetTabFields, activeTab, showPermanent]);

  const onSubmit = useCallback((data) => {
    // Always include client info
    const TotalAmt =
      Number(data.PermBedDepositAmt) +
      Number(data.PermBedRentAmt) +
      Number(data.ProcessingFeesAmt);

    const filteredData = {
      Date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      SalesMember: data.SalesMember,
      AccountMember: data.AccountMember,
      ClientFullName: data.ClientFullName,
      WhatsAppNo: data.WhatsAppNo,
      CallingNo: data.CallingNo,
      EmgyCont1FullName: data.EmgyCont1FullName,
      EmgyCont1No: data.EmgyCont1No,
      EmgyCont2FullName: data.EmgyCont2FullName,
      EmgyCont2No: data.EmgyCont2No,
      AskForBAOrFA: data.AskForBAOrFA,

      ProcessingFeesAmt: data.ProcessingFeesAmt,
      UpcomingRentHikeDt: data.URHD,
      UpcomingRentHikeAmt: data.URHA,
      TotalAmt: TotalAmt,
      BookingAmt:
        data.AskForBAOrFA === "Full_Amount "
          ? TotalAmt
          : Number(data.PermBedMonthlyFixRent),
      BalanceAmt:
        data.AskForBAOrFA === "Full_Amount "
          ? 0
          : TotalAmt - Number(data.PermBedMonthlyFixRent),
    };

    // Include ONLY active tab fields
    const dateFields = ["PermBedDOJ", "PermBedLDt", "TempBedDOJ", "TempBedLDt"];
    if (showPermanent) {
      Object.keys(data)
        .filter((key) => key.startsWith("Perm"))
        .forEach((key) => {
          if (key === "PermPropCode" && data[key]) {
            const parts = data[key].split(",");
            filteredData[key] = parts[2] || "";
          } else if (dateFields.includes(key) && data[key]) {
            const date = new Date(data[key]);
            filteredData[key] = !isNaN(date)
              ? date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              : data[key];
          } else {
            filteredData[key] = data[key];
          }
        });
    }

    if (showtemporary) {
      Object.keys(data)
        .filter((key) => key.startsWith("Temp"))
        .forEach((key) => {
          if (key === "TempPropCode" && data[key]) {
            const parts = data[key].split(",");
            filteredData[key] = parts[2] || "";
          } else if (dateFields.includes(key) && data[key]) {
            const date = new Date(data[key]);
            filteredData[key] = !isNaN(date)
              ? date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              : data[key];
          } else {
            filteredData[key] = data[key];
          }
        });
    }


    setFormPreviewData(filteredData);
    setShowConfirmModal(true);
  }, [showPermanent, showtemporary]);

  const handleFinalSubmit = useCallback(() => {
    submitBooking(formPreviewData, {
      onSuccess: () => {
        alert("✅ Data successfully sent to Google Sheet!");
        setShowConfirmModal(false);

        // Reset the entire form
        reset({
          Date: new Date().toISOString().split('T')[0],
          SalesMember: "",
          ClientFullName: "",
          WhatsAppNo: "",
          CallingNo: "",
          EmgyCont1FullName: "",
          EmgyCont1No: "",
          EmgyCont2FullName: "",
          EmgyCont2No: "",
          AskForBAOrFA: "",
          // Reset all permanent fields
          PermPropCode: "",
          PermBedNo: "",
          PermRoomNo: "",
          PermACRoom: "",
          PermBedMonthlyFixRent: "",
          PermBedDepositAmt: "",
          PermBedDOJ: "",
          PermBedLDt: "",
          PermBedRentAmt: "",
          ProcessingFeesAmt: "",
          PermUpcomingRentHikeDt: "",
          PermUpcomingRentHikeAmt: "",
          PermComments: "",
          // Reset all temporary fields
          TempPropCode: "",
          TempBedNo: "",
          TempRoomNo: "",
          TempACRoom: "",
          TempBedMonthlyFixRent: "",
          TempBedDepositAmt: "",
          TempBedDOJ: "",
          TempBedLDt: "",
          TempBedRentAmt: "",
          ProcessingFeesAmt: "",
          TempUpcomingRentHikeDt: "",
          TempUpcomingRentHikeAmt: "",
          TempComments: ""
        });
        setValue(`SalesMemeber`, "Search & Select Employee");
        setValue(`AskForBAOrFA`, "SelectAskFor");

        // Reset checkboxes and tabs
        setShowPermanent(false);
        setShowtemporary(false);
        setActiveTab('');
        setSelctedSheetId(null);
        setSelectedBedNumber(null);
        window.location.reload()
      },
      onError: () => {
        alert("❌ Failed to submit. Try again.");
      },
    });
  }, [submitBooking, formPreviewData, reset]);

  const inputClass = 'w-full px-3 py-2 mt-1 border-2 border-orange-200 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400';

  const renderError = (field) =>
    errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]?.message}</p>;

  // Employee select styles
  const employeeSelectStyles = {
    control: (base, state) => ({
      ...base,
      width: "100%",
      paddingTop: "0.25rem",
      paddingBottom: "0.10rem",
      paddingLeft: "0.75rem",
      paddingRight: "0.50rem",
      marginTop: "0.30rem",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: state.isFocused ? "#fb923c" : "#f97316",
      borderRadius: "0.375rem",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(251,146,60,0.5)"
        : "0 1px 2px rgba(0,0,0,0.05)",
      backgroundColor: "white",
      minHeight: "40px",
      "&:hover": { borderColor: "#fb923c" },
    }),
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? "white" : "#fb923c",
      backgroundColor: state.isSelected ? "#fb923c" : "white",
      "&:hover": { backgroundColor: "#fed7aa" }
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999
    })
  };

  return (
    <div className="max-w-8xl mx-auto bg-gray-100 min-h-screen">
      <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center w-full text-center mb-8 px-4">
          <img
            className="w-32 h-auto md:w-1/5 mb-4 md:mb-0"
            src="https://gpgs.in/wp-content/themes/paying_guest/images/logo.png"
            alt="Logo"
          />
          <h2 className="text-lg sm:text-xl md:text-3xl font-bold  text-orange-500  tracking-wide md:ml-[200px]">
            New Booking & Payment Details
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* === CLIENT DETAILS === */}
          <section className="bg-orange-50 border border-gray-200 rounded-lg p-2 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 border-b pb-2 bg-orange-200 text-black p-2 rounded-sm">Client Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { name: 'ClientFullName', label: 'Full Name' },
                { name: 'WhatsAppNo', label: 'WhatsApp No' },
                { name: 'CallingNo', label: 'Calling No' , type:"number" },
                { name: 'EmgyCont1FullName', label: 'Emergency Contact1 Full Name' },
                { name: 'EmgyCont1No', label: 'Emergency Contact1 No' },
                { name: 'EmgyCont2FullName', label: 'Emergency Contact2 Full Name' },
                { name: 'EmgyCont2No', label: 'Emergency Contact2 No' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500"
                  >{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    {...register(field.name)}
                    placeholder={`Enter ${field.label}`}
                    className={inputClass}
                  />
                  {renderError(field.name)}
                </div>
              ))}
            </div>
          </section>

          {/* === CHECKBOXES === */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center ">
            {/* Permanent Property Card */}
            <label
              className={`group cursor-pointer flex items-center gap-4 w-full sm:w-80 p-4 border rounded-xl transition-all duration-300 shadow-sm
      ${showPermanent ? ' border-orange-200 ring-2 ring-orange-200' : 'bg-white hover:shadow-lg'}`}
            >
              <input
                type="checkbox"
                className="accent-orange-200 w-5 h-5"
                checked={showPermanent}
                onChange={(e) => handlePermanentCheckbox(e.target.checked)}
              />
              <span className="text-lg font-medium text-gray-800 group-hover:text-orange-600">
                Permanent Property Details
              </span>
            </label>

            {/* temporary Property Card */}
            {permanentPropertyFilledChecked > 0 && (

              <label
                className={`group cursor-pointer flex items-center gap-4 w-full sm:w-80 p-4 border rounded-xl transition-all duration-300 shadow-sm
      ${showtemporary ? ' border-orange-200 ring-2 ring-orange-200' : 'bg-white hover:shadow-lg'}`}
              >
                <input
                  type="checkbox"
                  className="accent-orange-200 w-5 h-5"
                  checked={showtemporary}
                  onChange={(e) => handletemporaryCheckbox(e.target.checked)}
                />
                <span className="text-lg font-medium text-gray-800 group-hover:text-orange-600">
                  Temporary Property Details
                </span>
              </label>
            )}
          </div>

          {/* === TABS === */}
          {(showPermanent || showtemporary) && (
            <div className="bg-orange-50 border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="mb-4 border-b border-gray-300 flex space-x-4">
                {showPermanent && (
                  <button
                    type="button"
                    className={`px-4 text-[20px] md:text-[20px] py-2 ${activeTab === 'permanent' ? 'bg-orange-200 text-black rounded-t-lg' : ''
                      }`}
                    onClick={() => setActiveTab('permanent')}
                  >
                    Permanent Property Details
                  </button>
                )}
                {showtemporary && (
                  <button
                    type="button"
                    className={`px-4 text-[20px] py-2 ${activeTab === 'temporary' ? 'bg-orange-200 text-black rounded-t-lg' : ''
                      }`}
                    onClick={() => setActiveTab('temporary')}
                  >
                    Temporary Property Details
                  </button>
                )}
              </div>

              {activeTab === 'permanent' && showPermanent && (
                <PropertyFormSection
                  titlePrefix="Perm"
                  control={control}
                  errors={errors}
                  singleSheetData={singleSheetData}
                  isPropertySheetData={isPropertySheetData}
                  selectedBedNumber={selectedBedNumber}
                  handlePropertyCodeChange={handlePropertyCodeChange}
                  handleBedNoChange={handleBedNoChange}
                  activeTab={activeTab}
                  register={register}
                  setValue={setValue}
                  propertyList={propertyList}
                />
              )}
              {activeTab === 'temporary' && showtemporary && (
                <PropertyFormSection
                  titlePrefix="Temp"
                  control={control}
                  errors={errors}
                  singleSheetData={singleSheetData}
                  isPropertySheetData={isPropertySheetData}
                  selectedBedNumber={selectedBedNumber}
                  handlePropertyCodeChange={handlePropertyCodeChange}
                  handleBedNoChange={handleBedNoChange}
                  activeTab={activeTab}
                  register={register}
                  setValue={setValue}
                  propertyList={propertyList}
                />
              )}
            </div>
          )}

          <div className="flex justify-center">
            <section className="bg-orange-50 border border-gray-200 rounded-lg p-2 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 border-b pb-2 bg-orange-200 text-black p-2 rounded-sm">Send Payment Details ...</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Date Field with default today */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Date</label>
                  <input
                    type="text"
                    {...register('Date')}
                    readOnly
                    className={inputClass}
                    // defaultValue={}
                  />

                  {renderError('Date')}
                </div> */}

                {/* Sales Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Sales Member</label>
                  <Controller
                    name="SalesMember"
                    control={control}
                    defaultValue={null}
                    render={({ field }) => {
                      const options = [
                        { value: "N/A", label: "N/A" }, // Default option at the top
                        ...(EmployeeDetails?.data?.map((ele) => ({
                          value: `${ele.Name} (${ele.ID})`,
                          label: `${ele.Name} — ID: ${ele.ID}`,
                        })) || []),
                      ];
                      return (
                        <MemoizedSelect
                          field={field}
                          options={options}
                          placeholder="Search & Select Sales Member"
                          styles={employeeSelectStyles}
                          onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : "")}
                        />
                      );
                    }}
                  />
                  {renderError('SalesMember')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Account Member</label>
                  <Controller
                    name="AccountMember"
                    control={control}
                    defaultValue={null}
                    render={({ field }) => {
                      const options = [
                        { value: "N/A", label: "N/A" }, // Default option at the top
                        ...(EmployeeDetails?.data?.map((ele) => ({
                          value: `${ele.Name} (${ele.ID})`,
                          label: `${ele.Name} — ID: ${ele.ID}`,
                        })) || []),
                      ];

                      return (
                        <MemoizedSelect
                          field={field}
                          options={options}
                          placeholder="Search & Select Account Member"
                          styles={employeeSelectStyles}
                          onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : "")}
                        />
                      );
                    }}
                  />
                  {renderError('AccountMember')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">AskFor ₹</label>
                  <Controller
                    name="AskForBAOrFA"
                    control={control}
                    defaultValue={null}
                    render={({ field }) => {
                      const options = AskFor?.map((ele) => ({
                        value: `${ele.value} `,
                        label: `${ele.label}`,
                      }));

                      return (
                        <MemoizedSelect
                          field={field}
                          options={options}
                          placeholder="Search & Select Ask For"
                          styles={employeeSelectStyles}
                          onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : "")}
                        />
                      );
                    }}
                  />
                  {renderError('AskForBAOrFA')}
                </div>

              </div>
              <div className='flex px-2  mt-5 justify-center'>
                <button
                  type="submit"
                  className="px-5 py-3 text-xl bg-orange-200 text-black rounded-lg hover:bg-orange-600 transition-all shadow-md"
                >
                  Submit Booking
                </button>
              </div>
            </section>
          </div>
        </form>
      </div>

      <ConfirmationModel
        showConfirmModal={showConfirmModal}
        setShowConfirmModal={setShowConfirmModal}
        handleFinalSubmit={handleFinalSubmit}
        formPreviewData={formPreviewData}
      />
    </div>
  );
};

export default BookingForm;

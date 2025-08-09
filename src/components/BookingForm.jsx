import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from "react-select";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ConfirmationModel from './ConfirmationModel';
import { useAddBooking, useEmployeeDetails, usePropertyData, usePropertySheetData } from './services';
import LoaderPage from './LoaderPage';


const BookingForm = () => {
  const [showPermanent, setShowPermanent] = useState(false);
  const [showTemporary, setShowTemporary] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formPreviewData, setFormPreviewData] = useState(null);
  const [selectedSheetId, setSelctedSheetId] = useState(null)
  const [selectedBedNumber, setSelectedBedNumber] = useState(null)

  // Validation schema with conditional fields

  const schema = yup.object().shape({
    date: yup.date().required('Date is required'),
    sales: yup.string().required('Sales person is required'),
    clientName: yup.string().required('Client name is required'),
    clientWhatsapp: yup
      .string()
      .matches(/^[0-9]{10}$/, 'Enter valid 10-digit WhatsApp number')
      .required('WhatsApp number is required'),
    clientCalling: yup
      .string()
      .matches(/^[0-9]{10}$/, 'Enter valid 10-digit calling number')
      .required('Calling number is required'),
    fatherName: yup.string().required('Emergency Contact1 Full Name is required'),
    fatherContact: yup
      .string()
      .matches(/^[0-9]{10}$/, 'Enter valid 10-digit contact number'),
    motherName: yup.string().required('Emergency Contact2 Full Name is required'),
    motherContact: yup
      .string()
      .matches(/^[0-9]{10}$/, 'Enter valid 10-digit contact number'),

    // Permanent
    permanent_propertyCode: yup.string().when('$showPermanent', {
      is: true,
      then: schema => schema.required('Property code is required'),
      otherwise: schema => schema,
    }),
    permanent_bedNo: yup.string().when('$showPermanent', {
      is: true,
      then: schema => schema.required('Bed number is required'),
      otherwise: schema => schema,
    }),
    // permanent_roomNo: yup.string().when('$showPermanent', {
    //   is: true,
    //   then: schema => schema.required('Room number is required'),
    //   otherwise: schema => schema,
    // }),
    permanent_bedRentStartDate: yup.string().when('$showPermanent', {
      is: true,
      then: schema => schema.required('Rent start date is required'),
      otherwise: schema => schema,
    }),
    // permanent_bedRentEndDate: yup.date().when('$showPermanent', {
    //   is: true,
    //   then: schema => schema.required('Rent end date is required'),
    //   otherwise: schema => schema,
    // }),
    permanent_bedRentAmount: yup.number().when('$showPermanent', {
      is: true,
      then: schema => schema.required('Rent amount is required'),
      otherwise: schema => schema,
    }),
    permanent_processingFees: yup.number().when('$showPermanent', {
      is: true,
      then: schema => schema.required('Processing fee is required').typeError('Must be a number'),
      otherwise: schema => schema,
    }),
    permanent_revisionDate: yup.date().when('$showPermanent', {
      is: true,
      then: schema => schema.required('Revision date is required'),
      otherwise: schema => schema,
    }),

    // Temporary
    temporary_propertyCode: yup.string().when('$showTemporary', {
      is: true,
      then: schema => schema.required('Property code is required'),
      otherwise: schema => schema,
    }),
    temporary_bedNo: yup.string().when('$showTemporary', {
      is: true,
      then: schema => schema.required('Bed number is required'),
      otherwise: schema => schema,
    }),
    temporary_roomNo: yup.string().when('$showTemporary', {
      is: true,
      then: schema => schema.required('Room number is required'),
      otherwise: schema => schema,
    }),
    // temporary_bedRentStartDate: yup.date().when('$showTemporary', {
    //   is: true,
    //   then: schema => schema.required('Rent start date is required'),
    //   otherwise: schema => schema,
    // }),
    // temporary_bedRentEndDate: yup.date().when('$showTemporary', {
    //   is: true,
    //   then: schema => schema.required('Rent end date is required'),
    //   otherwise: schema => schema,
    // }),
    temporary_bedRentAmount: yup.number().when('$showTemporary', {
      is: true,
      then: schema => schema.required('Rent amount is required'),
      otherwise: schema => schema,
    }),


  });

  const {
    register,
    handleSubmit,
    setValue, // <-- Destructure here
    watch,
    resetField,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    context: { showPermanent, showTemporary },
  });



  const resetTabFields = (prefix) => {
    const fieldsToReset = [
      "propertyCode",
      "bedNo",
      "roomNo",
      "roomAcNonAc",
      "bedMonthlyRent",
      "bedDepositAmount",
      "bedRentStartDate",
      "bedRentEndDate",
      "bedRentAmount",
      "processingFees",
      "revisionDate",
      "revisionAmount",
      "Comments"
    ];

    fieldsToReset.forEach((field) => {
      resetField(`${prefix}${field}`);
    });
  };














  const handlePropertyCodeChange = (e, titlePrefix) => {
    const value = e.target.value;
    setSelctedSheetId(value)

    setValue(`${titlePrefix}propertyCode`, value);
    setValue(`${titlePrefix}roomAcNonAc`, "");
    setValue(`${titlePrefix}BedNo`, "");
    setValue(`${titlePrefix}bedRentAmount`, "");
    setValue(`${titlePrefix}roomNo`, "");
    setValue(`${titlePrefix}roomAcNonAc`, "");
    setValue(`${titlePrefix}bedMonthlyRent`, "");
    setValue(`${titlePrefix}bedDepositAmount`, "");
    setValue(`${titlePrefix}revisionDate`, "");
    setValue(`${titlePrefix}revisionAmount`, "");
    setValue(`${titlePrefix}roomNo`, "");
  };

  // === Auto-calculate Rent Amount ===
  const watchStartDate = watch(`${activeTab}_bedRentStartDate`); // Client DOJ
  const watchEndDate = watch(`${activeTab}_bedRentEndDate`);     // Client Last Date
  const watchMonthlyRent = watch(`${activeTab}_bedMonthlyRent`);

  React.useEffect(() => {
    if (watchStartDate && watchMonthlyRent) {
      const start = new Date(watchStartDate);
      const end = watchEndDate ? new Date(watchEndDate) : null;

      if (!isNaN(start)) {
        const dailyRent = parseFloat(watchMonthlyRent) / 30;

        let totalRent = 0;

        if (activeTab === "temporary" && end && !isNaN(end)) {
          // Temporary → Calculate for full range from DOJ to Last Date
          const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
          totalRent = Math.round(dailyRent * days);
        } else {
          // Permanent → Calculate remaining days in start month
          const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0);
          const days = Math.ceil((monthEnd - start) / (1000 * 60 * 60 * 24)) + 1;
          totalRent = Math.round(dailyRent * days);
        }

        setValue(`${activeTab}_bedRentAmount`, totalRent);
      } else {
        setValue(`${activeTab}_bedRentAmount`, "");
      }
    } else {
      setValue(`${activeTab}_bedRentAmount`, "");
    }
  }, [watchStartDate, watchEndDate, watchMonthlyRent, activeTab, setValue]);


  const onSubmit = (data) => {
    // Keep only client + selected tab fields
    const filteredData = {
      date: data.date,
      sales: data.sales,
      accounts: data.accounts,
      clientName: data.clientName,
      clientWhatsapp: data.clientWhatsapp,
      clientCalling: data.clientCalling,
      fatherName: data.fatherName,
      fatherContact: data.fatherContact,
      motherName: data.motherName,
      motherContact: data.motherContact,
    };

    if (showPermanent) {
      Object.keys(data)
        .filter(key => key.startsWith('permanent_'))
        .forEach(key => {
          filteredData[key] = data[key];
        });
    }

    if (showTemporary) {
      Object.keys(data)
        .filter(key => key.startsWith('temporary_'))
        .forEach(key => {
          filteredData[key] = data[key];
        });
    }
    setFormPreviewData(filteredData);
    setShowConfirmModal(true); // open modal
  };



  const { mutate: submitBooking, isLoading: isBookingLoading } = useAddBooking();
  const { data: propertyList, isLoading: isPropertyLoading } = usePropertyData();
  const { data: EmployeeDetails } = useEmployeeDetails()
  const { data: singleSheetData, isLoading: isPropertySheetData } = usePropertySheetData(selectedSheetId);

  // const {data:EmployeeDetails} = useEmployeeDetails()
  const handleFinalSubmit = () => {
    submitBooking(formPreviewData, {
      onSuccess: () => {
        alert("✅ Data successfully sent to Google Sheet!");
        setShowConfirmModal(false);
      },
      onError: () => {
        alert("❌ Failed to submit. Try again.");
      },
    });
  };
  const inputClass =
    'w-full px-3 py-2 mt-1 border-2 border-orange-500 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400';

  const renderError = (field) =>
    errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]?.message}</p>;

  const handlePermanentCheckbox = (checked) => {
    if (!checked) {
      resetTabFields("permanent_")
    }
    setShowPermanent(checked);
    if (!checked && activeTab === 'permanent') {
      if (showTemporary) setActiveTab('temporary');
      else setActiveTab('');
    } else if (checked && !activeTab) {
      setActiveTab('permanent');
    }
  };

  const handleTemporaryCheckbox = (checked) => {
    if (!checked) {
      resetTabFields("temporary_")
    }
    setShowTemporary(checked);
    if (!checked && activeTab === 'temporary') {
      if (showPermanent) setActiveTab('permanent');
      else setActiveTab('');
    } else if (checked && !activeTab) {
      setActiveTab('temporary');
    }
  };
  const handleBedNoChange = (e, titlePrefix) => {
    const selectedBedNo = e.target.value;
    setSelectedBedNumber(selectedBedNo)
    const matchedRow = singleSheetData?.data?.find(
      (row) => row["BedNo"]?.trim() === selectedBedNo
    );
    if (matchedRow) {
      const acNonAc = matchedRow["ACRoom"]?.trim() || "";
      const rentAmt = matchedRow["MFR"] || "";

      setValue(`${titlePrefix}roomAcNonAc`, acNonAc);
      setValue(`${titlePrefix}bedNo`, selectedBedNo);
      setValue(`${titlePrefix}bedMonthlyRent`, rentAmt);
      setValue(`${titlePrefix}bedDepositAmount`, matchedRow["DA"]?.trim() || "");
      setValue(`${titlePrefix}revisionDate`, matchedRow["URHD"]?.trim() || "");
      setValue(`${titlePrefix}revisionAmount`, matchedRow["URHA"]?.trim() || "");
      setValue(`${titlePrefix}roomNo`, matchedRow["RoomNo"]?.trim() || "");
    } else {
      setValue(`${titlePrefix}roomAcNonAc`, "");
      setValue(`${titlePrefix}bedRentAmount`, "");
      setValue(`${titlePrefix}roomNo`, "");
      setValue(`${titlePrefix}roomAcNonAc`, "");
      setValue(`${titlePrefix}bedMonthlyRent`, "");
      setValue(`${titlePrefix}bedDepositAmount`, "");
      setValue(`${titlePrefix}revisionDate`, "");
      setValue(`${titlePrefix}revisionAmount`, "");
      setValue(`${titlePrefix}roomNo`, "");
      setValue(`${titlePrefix}bedNo`, selectedBedNo);

    }
  };






  const PropertyFormSection = ({ titlePrefix }) => (

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Permanent Property Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Property Code</label>

        <Controller
          name={`${titlePrefix}propertyCode`}
          control={control}
          defaultValue={null}
          render={({ field }) => {
            const options = propertyList?.data?.map((item) => ({
              value: `${item["PG Main  Sheet ID"]},${item["Bed Count"]}`,
              label: item["Property Code"],
            })) || [];

            return (
              <Select
                {...field}
                value={options?.find(
                  (opt) =>
                    opt.value ===
                    (field.value?.value || field.value) // works for both string & object
                )}
                options={options}
                isClearable
                isSearchable
                placeholder="Search & Select Property Code"
                styles={{
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
                    borderRadius: "0.375rem", // rounded-md
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
                }}
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


        {renderError(`${titlePrefix}propertyCode`)}
      </div>

      {/* P. Bed No */}

      <div className="relative">
        {/* Label with required asterisk */}
        <label className="text-sm font-medium text-gray-700 relative after:content-['*'] after:ml-1 after:text-red-500">
          Bed No
        </label>

        {/* Loader overlay */}
        {isPropertySheetData && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10 rounded">
            <LoaderPage />
          </div>
        )}



        {/* Select Dropdown */}
        <Controller
          name={`${titlePrefix}bedNo`}
          control={control}
          defaultValue={
            selectedBedNumber
              ? { value: selectedBedNumber, label: selectedBedNumber }
              : null
          }
          render={({ field }) => {
            // Generate options
            const options =
              isPropertySheetData
                ? []
                : singleSheetData?.data?.length > 0
                  ? singleSheetData.data.map((ele) => ({
                    value: ele.BedNo,
                    label: ele.BedNo,
                  }))
                  : [{ value: "", label: "No beds available", isDisabled: true }];

            return (
              <Select
                {...field}
                value={options?.find((opt) => opt.value === field.value?.value || field.value)}
                isDisabled={isPropertySheetData}
                options={options}
                placeholder="Search & Select Bed No"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    width: "100%",
                    paddingTop: "0.25rem",
                    paddingBottom: "0.10rem",
                    paddingLeft: "0.75rem",
                    paddingRight: "0.50rem",
                    // marginTop: "0.1rem",
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderColor: state.isFocused ? "#fb923c" : "#f97316",
                    borderRadius: "0.375rem",
                    boxShadow: state.isFocused
                      ? "0 0 0 2px rgba(251,146,60,0.5)"
                      : "0 1px 2px rgba(0,0,0,0.05)",
                    backgroundColor: "white",
                    minHeight: "42px",
                    "&:hover": { borderColor: "#fb923c" },
                    opacity: isPropertySheetData ? 0.5 : 1,
                    pointerEvents: isPropertySheetData ? "none" : "auto",
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
                }}
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




        {/* Validation error message */}
        {renderError(`${titlePrefix}bedNo`)}
      </div>


      {/* P. Room No */}
      <div>
        <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Room No</label>
        <input
          type='text'
          {...register(`${titlePrefix}roomNo`)}
          disabled
          className={inputClass}>

        </input>
        {renderError(`${titlePrefix}roomNo`)}
      </div>

      {/* P. Room AC/NonAC */}
      <div>
        <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500"> AC / Non AC</label>
        <input
          type="text"
          {...register(`${titlePrefix}roomAcNonAc`)}
          disabled
          className={inputClass}
        />
        {renderError(`${titlePrefix}roomAcNonAc`)}
      </div>

      {/* P. Bed Monthly Rent */}
      <div>
        <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500"> Monthly Fixed Rent ( ₹ )</label>
        <input
          type="number"
          {...register(`${titlePrefix}bedMonthlyRent`)}
          disabled
          className={inputClass}
        />
        {renderError(`${titlePrefix}bedMonthlyRent`)}
      </div>

      {/* P. Bed Deposit Amount */}
      {activeTab !== "temporary" && (

        <div>
          <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500"> Deposit Amount ( ₹ )</label>
          <input
            type="number"
            {...register(`${titlePrefix}bedDepositAmount`)}
            disabled
            className={inputClass}
          />
          {renderError(`${titlePrefix}bedDepositAmount`)}
        </div>
      )}

      {/* P. Bed Rent Start Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Client DOJ</label>
        <input
          type="date"
          {...register(`${titlePrefix}bedRentStartDate`)}
          className={inputClass}
        />
        {renderError(`${titlePrefix}bedRentStartDate`)}
      </div>

      {/* P. Bed Rent End Date */}
      {activeTab == "temporary" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Client Last Date </label>
          <input
            type="date"
            {...register(`${titlePrefix}bedRentEndDate`)}
            className={inputClass}
          />
          {renderError(`${titlePrefix}bedRentEndDate`)}
        </div>
      )}


      {activeTab == "permanent" && (

        <div>
          <label>Client Last Date (Optional)</label>
          <input
            type="date"
            {...register(`${titlePrefix}bedRentEndDate`)}
            className={inputClass}
          />
          {renderError(`${titlePrefix}bedRentEndDate`)}
        </div>
      )}


      {/* P. Bed Rent Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500"> Rent Amount As Per Client DOJ ( ₹ )</label>
        <input
          type="number"

          {...register(`${titlePrefix}bedRentAmount`)}
          className={inputClass}
          disabled={true}
        // readOnly
        />
        {renderError(`${titlePrefix}bedRentAmount`)}
      </div>

      {/* Processing Fees Amount */}
      {activeTab !== "temporary" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Processing Fees ( ₹ )</label>
          <input
            type="text"
            {...register(`${titlePrefix}processingFees`)}
            className={inputClass}
          />
          {renderError(`${titlePrefix}processingFees`)}
        </div>
      )}

      {/* Rent Revision Date */}
      {activeTab !== "temporary" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Upcoming Rent Hike Date</label>
          <input
            type="text"
            {...register(`${titlePrefix}revisionDate`)}
            disabled
            className={inputClass}
          />
          {renderError(`${titlePrefix}revisionDate`)}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Upcoming Rent Hike Ammount ( ₹ )</label>
        <input
          type="text"
          {...register(`${titlePrefix}revisionAmount`)}
          className={inputClass}
          disabled
        />
        {renderError(`${titlePrefix}revisionAmount`)}
      </div>
      <div>
        <label>Comments</label>
        <textarea
          type="text"
          {...register(`${titlePrefix}Comments`)}

          className={`${inputClass} max-w-[]`}
        />
        {renderError(`${titlePrefix}Comments`)}
      </div>

    </div>

  );

  return (
    <div className="max-w-8xl mx-auto bg-gray-100 min-h-screen">
      <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="relative w-full text-center mb-8">
          <h2 className="text-xl md:text-3xl font-bold text-orange-500 tracking-wide">
            New Booking & Payment Details
          </h2>
        </div>


        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* === CLIENT DETAILS === */}
          <section className="bg-orange-50 border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Client Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[

                { name: 'clientName', label: 'Full Name' },
                { name: 'clientWhatsapp', label: 'WhatsApp No' },
                { name: 'clientCalling', label: 'Calling No' },
                { name: 'fatherName', label: 'Emergency Contact1 Full Name' },
                { name: 'fatherContact', label: 'Emergency Contact1 No' },
                { name: 'motherName', label: 'Emergency Contact2 Full Name' },
                { name: 'motherContact', label: 'Emergency Contact2 No' },

              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500"
                  >{field.label}</label>
                  {field.type === 'select' ? (
                    <select {...register(field.name)} className={inputClass}>
                      <option value="">Select {field.label}</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      {...register(field.name)}
                      placeholder={`Enter ${field.label}`}
                      className={inputClass}
                    />
                  )}
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
      ${showPermanent ? 'bg-orange-100 border-orange-500 ring-2 ring-orange-500' : 'bg-white hover:shadow-lg'}`}
            >
              <input
                type="checkbox"
                className="accent-orange-500 w-5 h-5"
                checked={showPermanent}
                onChange={(e) => handlePermanentCheckbox(e.target.checked)}
              />
              <span className="text-lg font-medium text-gray-800 group-hover:text-orange-600">
                Permanent Property Details
              </span>
            </label>

            {/* Temporary Property Card */}
            <label
              className={`group cursor-pointer flex items-center gap-4 w-full sm:w-80 p-4 border rounded-xl transition-all duration-300 shadow-sm
      ${showTemporary ? 'bg-orange-100 border-orange-500 ring-2 ring-orange-500' : 'bg-white hover:shadow-lg'}`}
            >
              <input
                type="checkbox"
                className="accent-orange-500 w-5 h-5"
                checked={showTemporary}
                onChange={(e) => handleTemporaryCheckbox(e.target.checked)}
              />
              <span className="text-lg font-medium text-gray-800 group-hover:text-orange-600">
                Temporary Property Details
              </span>
            </label>
          </div>


          {/* === TABS === */}
          {(showPermanent || showTemporary) && (
            <div className="bg-orange-50 border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="mb-4 border-b border-gray-300 flex space-x-4">
                {showPermanent && (
                  <button
                    type="button"
                    className={`px-4 text-[10px] md:text-[20px] py-2 ${activeTab === 'permanent' ? 'bg-orange-500 text-white rounded-t-lg' : ''
                      }`}
                    onClick={() => setActiveTab('permanent')}
                  >
                    Permanent Property Details
                  </button>
                )}
                {showTemporary && (
                  <button
                    type="button"
                    className={`px-4 text-[20px] py-2 ${activeTab === 'temporary' ? 'bg-orange-500 text-white rounded-t-lg' : ''
                      }`}
                    onClick={() => setActiveTab('temporary')}
                  >
                    Temporary Property Details
                  </button>
                )}
              </div>

              {activeTab === 'permanent' && showPermanent && (
                <>
                  {/* <h3 className="text-xl font-semibold mb-4">Permanent Property Details</h3> */}
                  <PropertyFormSection titlePrefix="permanent_" />
                </>
              )}
              {activeTab === 'temporary' && showTemporary && (
                <>
                  {/* <h3 className="text-xl font-semibold mb-4">Temporary Property Details</h3> */}
                  <PropertyFormSection titlePrefix="temporary_" />
                </>
              )}
            </div>
          )}

          <div className="flex justify-center">

            <section className="bg-orange-50 border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 border-b pb-2">Send Payment Details ...</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Date Field with default today */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Date</label>
                  <input
                    type="date"
                    {...register('date')}
                    readOnly
                    className={inputClass}
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                  {renderError('date')}
                </div>

                {/* Sales Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-1 after:text-red-500">Sales Person </label>

                  <Controller
                    name="sales"
                    control={control}
                    defaultValue={null}
                    render={({ field }) => {
                      const options = EmployeeDetails?.data?.map((ele) => ({
                        value: `${ele.Name} (${ele.ID})`,
                        label: `${ele.Name} — ID: ${ele.ID}`,
                      }));

                      return (
                        <Select
                          {...field}
                          options={options}
                          placeholder="Search & Select Employee"
                          isClearable
                          isSearchable
                          value={options?.find(option => option.value === field.value) || null} // ensures it displays selected value
                          onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : "")}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          styles={{
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
                              borderRadius: "0.375rem", // rounded-md
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
                          }}
                        />
                      );
                    }}
                  />

                  {renderError('sales')}
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-md"
                  >
                    Submit Booking
                  </button>
                </div>
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

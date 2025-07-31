import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ConfirmationModel from './ConfirmationModel';

// Validation schema with conditional fields



const BookingForm = () => {
  const [showPermanent, setShowPermanent] = useState(false);
  const [showTemporary, setShowTemporary] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formPreviewData, setFormPreviewData] = useState(null);


  console.log("activeTab, ", activeTab)
  const schema = yup.object().shape({
    date: yup.date().required('Date is required'),
    sales: yup.string().required('Sales person is required'),
    accounts: yup.string().required('Accounts selection is required'),
    clientName: yup.string().required('Client name is required'),
    clientWhatsapp: yup
      .string()
      .matches(/^[0-9]{10}$/, 'Enter valid 10-digit WhatsApp number')
      .required('WhatsApp number is required'),
    clientCalling: yup
      .string()
      .matches(/^[0-9]{10}$/, 'Enter valid 10-digit calling number')
      .required('Calling number is required'),
    fatherName: yup.string().required('Father name is required'),
    fatherContact: yup
      .string()
      .matches(/^[0-9]{10}$/, 'Enter valid 10-digit father contact number'),
    motherName: yup.string(),
    motherContact: yup
      .string()
      .matches(/^[0-9]{10}$/, 'Enter valid 10-digit mother contact number'),

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
    permanent_roomNo: yup.string().when('$showPermanent', {
      is: true,
      then: schema => schema.required('Room number is required'),
      otherwise: schema => schema,
    }),
    permanent_bedRentStartDate: yup.date().when('$showPermanent', {
      is: true,
      then: schema => schema.required('Rent start date is required'),
      otherwise: schema => schema,
    }),
    permanent_bedRentEndDate: yup.date().when('$showPermanent', {
      is: true,
      then: schema => schema.required('Rent end date is required'),
      otherwise: schema => schema,
    }),
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
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    context: { showPermanent, showTemporary },
  });


  const handlePropertyCodeChange = (e, titlePrefix) => {
    const value = e.target.value;
    setValue(`${titlePrefix}propertyCode`, value);

    // Example logic for setting dependent fields
    if (value === 'RKBCJK@#@!@#123') {
      setValue(`${titlePrefix}roomAcNonAc`, 'AC');
      setValue(`${titlePrefix}bedMonthlyRent`, 12000);
      setValue(`${titlePrefix}bedDepositAmount`, 5000);
      setValue(`${titlePrefix}revisionDate`, '2025-12-01');
    } else {
      // reset or handle other values
      setValue(`${titlePrefix}roomAcNonAc`, '');
      setValue(`${titlePrefix}bedMonthlyRent`, 0);
      setValue(`${titlePrefix}bedDepositAmount`, 0);
      setValue(`${titlePrefix}revisionDate`, '');
    }
  };
  console.log(errors)


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

  const handleFinalSubmit = () => {
    console.log('Final Form Data:', formPreviewData);
    setShowConfirmModal(false);
  };

  const inputClass =
    'w-full px-3 py-2 mt-1 border-2 border-orange-500 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400';

  const renderError = (field) =>
    errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]?.message}</p>;

  const handlePermanentCheckbox = (checked) => {
    setShowPermanent(checked);
    if (!checked && activeTab === 'permanent') {
      if (showTemporary) setActiveTab('temporary');
      else setActiveTab('');
    } else if (checked && !activeTab) {
      setActiveTab('permanent');
    }
  };

  const handleTemporaryCheckbox = (checked) => {
    setShowTemporary(checked);
    if (!checked && activeTab === 'temporary') {
      if (showPermanent) setActiveTab('permanent');
      else setActiveTab('');
    } else if (checked && !activeTab) {
      setActiveTab('temporary');
    }
  };

  const PropertyFormSection = ({ titlePrefix }) => (

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Permanent Property Code */}
      <div>
        <label>Property Code</label>
        <select
          {...register(`${titlePrefix}propertyCode`)}
          className={inputClass}
          onChange={(e) => handlePropertyCodeChange(e, titlePrefix)}
        >
          <option value="">Select Property Code</option>
          <option value="RKBCJK@#@!@#123">RKBCJK@#@!@#123</option>
        </select>
        {renderError(`${titlePrefix}propertyCode`)}
      </div>

      {/* P. Bed No */}
      <div>
        <label>Bed No</label>
        <select {...register(`${titlePrefix}bedNo`)} className={inputClass}>
          {/* options filtered based on available beds */}
          <option value="">Select Bed No</option>
          <option value="4">4</option>
        </select>
        {renderError(`${titlePrefix}bedNo`)}
      </div>

      {/* P. Room No */}
      <div>
        <label>Room No</label>
        <select {...register(`${titlePrefix}roomNo`)} className={inputClass}>
          {/* options filtered based on available rooms */}
          <option value="">Select Room No</option>
          <option value="RG3">RG3</option>
        </select>
        {renderError(`${titlePrefix}roomNo`)}
      </div>

      {/* P. Room AC/NonAC */}
      <div>
        <label> AC / Non AC</label>
        <input
          type="text"
          {...register(`${titlePrefix}roomAcNonAc`)}
          readOnly
          className={inputClass}
        />
        {renderError(`${titlePrefix}roomAcNonAc`)}
      </div>

      {/* P. Bed Monthly Rent */}
      <div>
        <label> Monthly Fixed Rent ( ₹ )</label>
        <input
          type="number"
          value={12000}
          {...register(`${titlePrefix}bedMonthlyRent`)}
          readOnly
          className={inputClass}
        />
        {renderError(`${titlePrefix}bedMonthlyRent`)}
      </div>

      {/* P. Bed Deposit Amount */}
      <div>
        <label> Deposit Amount ( ₹ )</label>
        <input
          type="number"
          {...register(`${titlePrefix}bedDepositAmount`)}
          readOnly
          className={inputClass}
        />
        {renderError(`${titlePrefix}bedDepositAmount`)}
      </div>

      {/* P. Bed Rent Start Date */}
      <div>
        <label>Client DOJ</label>
        <input
          type="date"
          {...register(`${titlePrefix}bedRentStartDate`)}
          className={inputClass}
        />
        {renderError(`${titlePrefix}bedRentStartDate`)}
      </div>

      {/* P. Bed Rent End Date */}
      <div>
        <label>Client Last Date</label>
        <input
          type="date"
          {...register(`${titlePrefix}bedRentEndDate`)}
          className={inputClass}
        />
        {renderError(`${titlePrefix}bedRentEndDate`)}
      </div>

      {/* P. Bed Rent Amount */}
      <div>
        <label> Rent Amount As Per Client DOJ ( ₹ )</label>
        <input
          type="number"
          value={10000}
          {...register(`${titlePrefix}bedRentAmount`)}
          className={inputClass}
          readOnly
        />
        {renderError(`${titlePrefix}bedRentAmount`)}
      </div>

      {/* Processing Fees Amount */}
      {activeTab !== "temporary" && (
        <div>
          <label>Processing Fees ( ₹ )</label>
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
          <label>Upcoming Rent Hike Date</label>
          <input
            type="date"
            {...register(`${titlePrefix}revisionDate`)}
            readOnly
            className={inputClass}
          />
          {renderError(`${titlePrefix}revisionDate`)}
        </div>
      )}

    <div>
          <label>Upcoming Rent Hike Ammount ( ₹ )</label>
          <input
            type="text"
            {...register(`${titlePrefix}revisionDate`)}
            className={inputClass}
          />
          {renderError(`${titlePrefix}revisionDate`)}
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
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          New Booking Payment Details
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* === CLIENT DETAILS === */}
          <section className="bg-orange-50 border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Client Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { name: 'date', type: 'date', label: 'Date' },
                { name: 'sales', type: 'select', label: 'Sales', options: ['Sandeep P.'] },
                { name: 'accounts', type: 'select', label: 'Accounts', options: ['NA'] },
                { name: 'clientName', label: 'Client Full Name' },
                { name: 'clientWhatsapp', label: 'Client WhatsApp No' },
                { name: 'clientCalling', label: 'Client Calling No' },
                { name: 'fatherName', label: 'Father Name' },
                { name: 'fatherContact', label: 'Father Contact No' },
                { name: 'motherName', label: 'Mother Name' },
                { name: 'motherContact', label: 'Mother Contact No' },
              ].map((field) => (
                <div key={field.name}>
                  <label>{field.label}</label>
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
          <section className="flex gap-6 items-center ml-20">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="accent-orange-500 w-7 h-7" checked={showPermanent}
                onChange={(e) => handlePermanentCheckbox(e.target.checked)}
              />
              <span className='text-[20px]'>Permanent Property Details</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="accent-orange-500 w-7 h-7"
                checked={showTemporary}
                onChange={(e) => handleTemporaryCheckbox(e.target.checked)}
              />
              <span className='text-[20px]'>Temporary Property Details</span>
            </label>
          </section>

          {/* === TABS === */}
          {(showPermanent || showTemporary) && (
            <div className="bg-orange-50 border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="mb-4 border-b border-gray-300 flex space-x-4">
                {showPermanent && (
                  <button
                    type="button"
                    className={`px-4  text-[20px] py-2 ${activeTab === 'permanent' ? 'bg-orange-500 text-white rounded-t-lg' : ''
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
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-md"
            >
              Submit Booking
            </button>
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

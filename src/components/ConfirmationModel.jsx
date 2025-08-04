import React, { useState } from 'react';

const ConfirmationModel = ({
  showConfirmModal,
  handleFinalSubmit,
  setShowConfirmModal,
  formPreviewData,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableData, setEditableData] = useState(formPreviewData || {});

  const formatKey = (key) =>
    key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const getSectionData = (prefix) =>
    Object.entries(editableData).filter(([key]) => key.startsWith(prefix));

  const clientDetails = Object.entries(editableData).filter(
    ([key]) =>
      !key.startsWith('permanent_') &&
      !key.startsWith('temporary_') &&
      key !== 'id'
  );

  const permanentDetails = Object.fromEntries(getSectionData('permanent_'));
  const temporaryDetails = Object.fromEntries(getSectionData('temporary_'));

  const getClientName = () => {
    const nameEntry = clientDetails.find(([key]) =>
      key.toLowerCase().includes('name')
    );
    return nameEntry ? nameEntry[1] : 'Client';
  };

  const handleInputChange = (key, value) => {
    setEditableData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderEditableBlock = (title, data) =>
    Object.keys(data).length ? (
      <div className="mb-6 p-5 border rounded-xl shadow-md bg-orange-50">
        <h4 className="text-lg font-semibold text-orange-600 mb-3">{title}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm text-gray-800">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <label className="block font-semibold mb-1">{formatKey(key)}</label>
              <input
                className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                value={value}
                onChange={(e) => handleInputChange(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    ) : null;

  const renderTextBlock = (title, data) =>
    Object.keys(data).length ? (
      <div className="mb-6 p-5 border rounded-xl shadow-md bg-orange-50">
        <h4 className="text-lg font-semibold text-orange-600 mb-3">{title}</h4>
        <ul className="space-y-2 text-sm text-gray-800">
          {Object.entries(data).map(([key, value]) => (
            <li key={key}>
              <span className="font-semibold">{formatKey(key)}:</span>{' '}
              <span className="text-gray-700">{String(value)}</span>
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  const handleSave = () => {
    handleFinalSubmit(editableData);
    setIsEditMode(false);
  };

  const generateMessageTemplate = () => {
    const name = getClientName();
    const mobile = editableData.clientMobile || editableData.clientContact || '';
    const whatsapp = editableData.clientWhatsapp || '';
    const bookingDate = editableData.date
      ? new Date(editableData.date).toLocaleDateString('en-IN')
      : '';
    const rentAmount = 8217;
    const monthlyRent = 8500;
    const deposit = 8500;
    const processingFees = 500;
    const total = rentAmount + deposit + processingFees;

    return `
🧾 PG Booking Confirmation – Gopal's Paying Guest Services

Dear ${name},

Thank you for choosing Gopal’s PG Services! Please find below the payment and booking details for your stay.

👤 Client Details 
• Name: ${name}
• Mobile Number: ${mobile}
• WhatsApp: ${whatsapp}
• Date of Booking: ${bookingDate}

🏠 Permanent PG Details
• PG Name: ${editableData.permanent_pgName || 'N/A'}
• Location: ${editableData.permanent_location || 'N/A'}
• Room Type: ${editableData.permanent_sharingType || 'N/A'}
• AC/Non-AC: ${editableData.permanent_acOrNonAC || 'N/A'}
• Attached Bathroom: ${editableData.permanent_attachedBathroom || 'N/A'}
• Joining Date: 2nd August 2025
• End Date: 30th August 2025
• Monthly Rent: ₹${monthlyRent}

💸 Payment Summary
• 1st Month Rent (Pro-Rated): ₹${rentAmount}
• Security Deposit: ₹${deposit}
• Processing Fees: ₹${processingFees}
✅ Total Amount: ₹${total}

📌 Important Note
• Booking is confirmed only after payment of ₹${deposit} (Security Deposit).
• Remaining ₹${total - deposit} is due on the joining day.
• The processing fee is non-refundable upon cancellation.
• Please review the agreement sent on WhatsApp before proceeding with payment.

📞 For Assistance
Gopal's Paying Guest Services
Customer Care: 8928191814
Service Hours: 10:00 AM – 7:00 PM
    `.trim();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMessageTemplate());
    alert('Message copied to clipboard!');
  };

  const handleWhatsAppSend = () => {
    const message = encodeURIComponent(generateMessageTemplate());
    const number = editableData.clientWhatsapp || editableData.clientMobile || '';
    if (!number) return alert('Client WhatsApp number not available.');
    window.open(`https://wa.me/${number}?text=${message}`, '_blank');
  };

  return (
    <>
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-orange-300">
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-orange-600">
                  Payment details of {getClientName()}
                </h3>
                <button
                  onClick={() => setIsEditMode((prev) => !prev)}
                  className="text-sm px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 border"
                >
                  {isEditMode ? 'Cancel Edit' : 'Edit'}
                </button>
              </div>

              {/* {!isEditMode && (
                <div className="bg-white p-5 rounded-lg border-l-4 border-orange-500 shadow-inner text-sm text-gray-700">
                  <p className="mb-2">
                    <strong>Permanent Bed Rent Amount:</strong> Rs. 8217 <br />
                    <span className="pl-2 text-gray-500">
                      (This rent is from 2 Aug 2025 to 30 Aug 2025. Monthly fixed rent: Rs. 8500)
                    </span>
                  </p>
                  <p>
                    <strong>Security Deposit:</strong> Rs. 8500 <br />
                    <strong>Processing Fees:</strong> Rs. 500 <br />
                    <strong>Total Amount:</strong>{' '}
                    <span className="text-orange-600 font-semibold">Rs. 17217</span>
                  </p>
                </div>
              )} */}

              {/* {!isEditMode && (
                <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-300 text-sm text-gray-800 leading-relaxed">
                  <strong>Imp. Note:</strong> Booking is confirmed only after Rs. 8500 is received. Remaining Rs. 8717 is due on joining.
                  <br />
                  Payment is <strong>non-refundable</strong> upon cancellation.
                  Please review the agreement sent on WhatsApp before making a payment.
                </div>
              )} */}

              {!isEditMode && (
                <div className="mt-8 border border-orange-200 rounded-lg p-5 bg-orange-50 shadow-inner">
                  <h4 className="text-lg font-semibold text-orange-700 mb-3">
                    Client Message Template
                  </h4>
                  <textarea
                    readOnly
                    value={generateMessageTemplate()}
                    className="w-full text-sm p-3 border border-gray-300 rounded-md bg-white text-gray-700 leading-relaxed"
                    rows={16}
                  />
                  <div className="flex flex-col sm:flex-row justify-end gap-4 mt-4">
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded shadow"
                    >
                      📋 Copy Message
                    </button>
                    <button
                      onClick={handleWhatsAppSend}
                      className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded shadow"
                    >
                      📤 Send via WhatsApp
                    </button>
                  </div>
                </div>
              )}

            

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={isEditMode ? handleSave : () => handleFinalSubmit(formPreviewData)}
                  className="px-5 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 shadow"
                >
                  {isEditMode ? 'Save' : 'Confirm & Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfirmationModel;
  
import React, { useState } from 'react';
import { Copy, X } from 'lucide-react';

const ConfirmationModel = ({
  showConfirmModal,
  handleFinalSubmit,
  setShowConfirmModal,
  formPreviewData,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableData, setEditableData] = useState(formPreviewData || {});
  const [isTextareaEditable, setIsTextareaEditable] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-IN');
    } catch {
      return date;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '';
    return `₹${parseInt(amount).toLocaleString('en-IN')}`;
  };

  const generateMessageTemplate = () => {
    const data = editableData;

    return `
📅 *Date:* ${formatDate(data.date)}
👤 *Client:* ${data.clientName}
📞 *Calling:* ${data.clientCalling}
📱 *WhatsApp:* ${data.clientWhatsapp}

👨‍👩‍👧 *Father:* ${data.fatherName || 'N/A'} (${data.fatherContact || 'N/A'})
👩 *Mother:* ${data.motherName || 'N/A'} (${data.motherContact || 'N/A'})

🏠 *Room No:* ${data.permanent_roomNo || '-'}
🛏️ *Bed No:* ${data.permanent_bedNo || '-'}
💨 *AC/Non-AC:* ${data.permanent_roomAcNonAc || '-'}

💰 *Deposit:* ${formatCurrency(data.permanent_bedDepositAmount)}
🏷️ *Monthly Rent:* ${formatCurrency(data.permanent_bedMonthlyRent)}
🧾 *Processing Fee:* ${formatCurrency(data.permanent_processingFees)}

📆 *Rent Start Date:* ${formatDate(data.permanent_bedRentStartDate)}
📆 *Rent End Date:* ${formatDate(data.permanent_bedRentEndDate)}
📆 *Rent Amount (Calculated):* ${formatCurrency(data.permanent_bedRentAmount)}

🔁 *Revision Date:* ${formatDate(data.permanent_revisionDate)}
🔁 *Revision Amount:* ${formatCurrency(data.permanent_revisionAmount)}

💬 *Comments:* ${data.permanent_Comments || '-'}

🧑‍💼 *Sales:* ${data.sales || '-'}
🏘️ *Accounts:* ${data.accounts || '-'}
    `.trim();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateMessageTemplate());
      alert('Copied to clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const number = editableData.clientWhatsapp || '';
    const message = encodeURIComponent(generateMessageTemplate());
    window.open(`https://wa.me/${number}?text=${message}`, '_blank');
  };

  if (!showConfirmModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-start pt-10 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative">
        <button
          onClick={() => setShowConfirmModal(false)}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirmation Preview</h2>

        <textarea
          readOnly={!isTextareaEditable}
          onClick={() => setIsTextareaEditable(true)}
          value={generateMessageTemplate()}
          className={`w-full text-sm p-3 border border-gray-300 rounded-md bg-white text-gray-700 leading-relaxed ${
            isTextareaEditable ? 'ring-2 ring-orange-400' : ''
          }`}
          rows={16}
        />

        {isTextareaEditable && (
          <button
            onClick={() => setIsTextareaEditable(false)}
            className="mt-3 px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-600 rounded shadow"
          >
            ❌ Cancel Edit
          </button>
        )}

        <div className="mt-6 flex justify-between items-center">
          <div className="space-x-4">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded shadow"
            >
              <Copy size={18} />
              Copy Message
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded shadow"
            >
              📤 Share on WhatsApp
            </button>
          </div>

          <button
            onClick={() => handleFinalSubmit(editableData)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow"
          >
            ✅ Final Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModel;

import React, { useRef } from 'react';
import { Copy, X, FileDown, Send } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ConfirmationModel = ({
  showConfirmModal,
  setShowConfirmModal,
  formPreviewData,
  handleFinalSubmit,
  // isBookingLoading
}) => {
  const invoiceRef = useRef();
  console.log(111, formPreviewData)

  const formatCurrency = (amt) =>
    amt ? `₹${parseInt(amt).toLocaleString('en-IN')}` : '-';

  const handleCopy = async () => {
    try {
      const text = invoiceRef.current.innerText;
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const downloadPDF = () => {
    const element = invoiceRef.current;
    html2canvas(element, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PG_Payment_${formPreviewData.clientName}.pdf`);
    });
  };


  const shareOnWhatsApp = () => {
    const msg = `
Payment details of ${formPreviewData.clientName}
Permanent PG Facility Code : ${formPreviewData.permanent_propertyCode}
Permanent Room No. : ${formPreviewData.permanent_roomNo}
Permanent Bed No. : ${formPreviewData.permanent_bedNo}
Permanent Bed AC / Non AC : ${formPreviewData.permanent_roomAcNonAc}
Permanent Bed Start Date : ${formPreviewData.permanent_bedRentStartDate}
Permanent Bed Last Date : ${formPreviewData.permanent_bedRentEndDate || 'NA'}

Permanent Bed Rent Amount : Rs. ${formPreviewData.permanent_bedRentAmount} ( This rent is from ${formPreviewData.permanent_bedRentStartDate} to ${formPreviewData.permanent_bedRentEndDate || 'NA'} , also please note the monthly fix rent of this bed is Rs. ${formPreviewData.permanent_bedMonthlyRent} )
Permanent Bed Security Deposit Amount : Rs. ${formPreviewData.permanent_bedDepositAmount}
Processing Fees : Rs. ${formPreviewData.permanent_processingFees}
Total Amount to be paid : Rs. ${formPreviewData.totalAmount}

// Imp. Note : The booking is confirmed only after the booking amount Rs. ${formPreviewData.permanent_bedDepositAmount}  is received by us. The balance amount of Rs. ${formPreviewData.permanent_bedRentAmount - formPreviewData.permanent_bedDepositAmount} is to be paid on the date of joining.

Payment is not refundable if you cancel the booking for any reason, so before making any payment please read the agreement file sent on your whatsapp and if you have any concerns please let us know.

Gopal's Paying Guest Services
( Customer Care No : 8928191814
Service Hours : 10AM to 7PM )
  `.trim();

    const number = formPreviewData.clientWhatsapp?.replace(/\D/g, '') || '';
    const encodedMsg = encodeURIComponent(msg);
    window.open(`https://wa.me/${number}?text=${encodedMsg}`, '_blank');
  };

  if (!showConfirmModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-start pt-10 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative">
        <button
          onClick={() => setShowConfirmModal(false)}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
        >
          <X size={24} />
        </button>

        {/* Invoice Preview */}
        <div ref={invoiceRef} className=" border  border-gray-300 rounded-md bg-white text-gray-800 space-y-4">
          <h1 className="text-xl font-bold text-center border-b pb-2 text-orange-500 ">Payment Details For {formPreviewData.clientName}</h1>

          {formPreviewData?.temporary_propertyCode && (
            <div className='flex justify-between p-2'>
              <section className='max-w-[50%]'>
                <div>
                  {formPreviewData?.temporary_propertyCode && (
                    <p>
                      <strong>Temporary PG Facility Code :</strong>{" "}
                      {formPreviewData.temporary_propertyCode}
                    </p>
                  )}

                  {formPreviewData?.temporary_roomNo && (
                    <p>
                      <strong>Room No. :</strong> {formPreviewData.temporary_roomNo}
                    </p>
                  )}

                  {formPreviewData?.temporary_bedNo && (
                    <p>
                      <strong>Bed No. :</strong> {formPreviewData.temporary_bedNo}
                    </p>
                  )}

                  {formPreviewData?.temporary_roomAcNonAc && (
                    <p>
                      <strong>AC Room :</strong> {formPreviewData.temporary_roomAcNonAc}
                    </p>
                  )}

                  {formPreviewData?.temporary_bedRentStartDate && (
                    <p>
                      <strong>Start Date :</strong>{" "}
                      {formPreviewData?.temporary_bedRentStartDate
                        ? new Date(formPreviewData.temporary_bedRentStartDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        : "NA"}

                    </p>
                  )}

                  {
                    formPreviewData?.temporary_bedRentEndDate && (

                      <p>
                        <strong>Last Date :</strong>{" "}
                        {
                          formPreviewData?.temporary_bedRentEndDate
                            ? new Date(formPreviewData.temporary_bedRentEndDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                            : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                        }
                      </p>

                    )
                  }
                </div>
              </section>

              <section className='max-w-[50%]'>
                <div>
                  {(formPreviewData?.temporary_bedRentAmount ||
                    formPreviewData?.temporary_bedRentAmount_bedRentStartDate ||
                    formPreviewData?.temporary_bedRentEndDate ||
                    formPreviewData?.temporary_bedMonthlyRent) && (
                      <p>
                        <strong>Temporary Bed Rent Amount :</strong> ₹{" "}
                        {formPreviewData.temporary_bedRentAmount} (This rent is from{" "}
                        {formPreviewData.permanent_bedRentStartDate} to{" "}
                        {formPreviewData.temporary_bedRentEndDate ||
                          new Date(
                            new Date().getFullYear(),
                            new Date().getMonth() + 1,
                            0
                          ).toISOString().split("T")[0]}
                        , also please note the monthly fixed rent of this bed is ₹{" "}
                        {formPreviewData.temporary_bedMonthlyRent})
                      </p>
                    )}





                </div>
              </section>
            </div>
          )}


          {formPreviewData?.temporary_propertyCode && (
            <hr />
          )}

          <div className='flex justify-between p-2'>

            <section className='max-w-[50%]'>
              <div>
                {/* <h2 className="font-semibold text-orange-600 mb-1">
                  Permanent PG Details
                </h2> */}
                <p>
                  <strong>Permanent PG Facility Code :</strong>{" "}
                  {formPreviewData.permanent_propertyCode}
                </p>
                <p>
                  <strong> Room No. :</strong>{" "}
                  {formPreviewData.permanent_roomNo}
                </p>
                <p>
                  <strong> Bed No. :</strong>{" "}
                  {formPreviewData.permanent_bedNo}
                </p>
                <p>
                  <strong> AC Room : </strong>{" "}
                  {formPreviewData.permanent_roomAcNonAc}
                </p>
                <p>
                  <strong> Start Date :</strong>{" "}
                  {formPreviewData?.permanent_bedRentStartDate
                    ? new Date(formPreviewData.permanent_bedRentStartDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    : "NA"}

                </p>
                <p>
                  <strong>  Last Date :</strong>{" "}
                  {formPreviewData.permanent_bedRentEndDate || "NA"}
                </p>
              </div>
            </section>

            <section className='max-w-[50%]'>
              <div>
                {/* <h2 className="font-semibold text-orange-600 mb-1">
                  Payment Details
                </h2> */}
                <p>
                  <strong>Permanent Bed Rent Amount :</strong> ₹ {" "}
                  {formPreviewData.permanent_bedRentAmount} ( This rent is from{" "}
                  {formPreviewData.permanent_bedRentStartDate} to{" "}
                  {
                    formPreviewData.permanent_bedRentEndDate || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
                  }
                  , also please
                  note the monthly fix rent of this bed is ₹ {" "}
                  {formPreviewData.permanent_bedMonthlyRent} )
                </p>
                <p>
                  <strong>Permanent Bed Deposit Amount :</strong> ₹{" "}
                  {formPreviewData.permanent_bedDepositAmount}
                </p>
                <p>
                  <strong>Processing Fees :</strong> ₹{" "}
                  {formPreviewData.permanent_processingFees}
                </p>
                <p>
                  <strong>Total Amount To Be paid :</strong> ₹{" "}
                  {Number(formPreviewData.permanent_bedRentAmount) +
                    Number(formPreviewData.permanent_bedDepositAmount) +
                    Number(formPreviewData.permanent_processingFees) + Number(formPreviewData.temporary_bedRentAmount)}{" "}

                </p>
              </div>

            </section>
          </div>






          <section className="text-sm p-2 text-gray-600 border-t pt-2">
            {formPreviewData.AskFor === "Booking_Amount" && (
              <p>
                📌 The booking is confirmed only after the booking amount ₹{" "}
                {formPreviewData.permanent_bedMonthlyRent} is received by us.
                The balance amount ₹{" "}

                {Number(formPreviewData.permanent_bedRentAmount) +
                  Number(formPreviewData.permanent_bedDepositAmount) +
                  Number(formPreviewData.permanent_processingFees) - formPreviewData.permanent_bedMonthlyRent}{" "}
                is to be paid before possession on the date of joining.
              </p>
            )}
            {formPreviewData.AskFor === "Full_Amount" && (
              <p>
                📌 The booking is confirmed only after full amount ₹{" "}
                {Number(formPreviewData.permanent_bedRentAmount) +
                  Number(formPreviewData.permanent_bedDepositAmount) +
                  Number(formPreviewData.permanent_processingFees)} is received by us.
              </p>
            )}
            <p>
              📌 Payment is not refundable if you cancel the booking for any
              reason, so before making any payment please read the agreement
              file sent on your WhatsApp and if you have any concerns please let
              us know.
            </p>
          </section>

          <footer className=" text-sm text-center  border-t">
            <p className='text-orange-500 text-bold '>Gopal's Paying Guest Services</p>
            <p>( Customer Care No : 8928191814 | Service Hours : 10AM to 7PM )</p>
          </footer>

        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded"
          >
            <Copy size={18} /> Copy
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded"
          >
            <FileDown size={18} /> Download PDF
          </button>

          <button
            onClick={() => {
              shareOnWhatsApp();
              handleFinalSubmit();
            }} className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded"
          >
            <Send size={18} /> Save & Share on WhatsApp
          </button>

        </div>
      </div>
    </div>
  );
};
export default ConfirmationModel;

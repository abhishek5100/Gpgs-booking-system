const ConfirmationModel = ({
  showConfirmModal,
  handleFinalSubmit,
  setShowConfirmModal,
  formPreviewData,
}) => {
  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getSectionData = (prefix) => {
    return Object.entries(formPreviewData || {}).filter(([key]) =>
      key.startsWith(prefix)
    );
  };

  const clientDetails = Object.entries(formPreviewData || {}).filter(
    ([key]) =>
      !key.startsWith('permanent_') &&
      !key.startsWith('temporary_') &&
      key !== 'id'
  );
  const permanentDetails = getSectionData('permanent_');
  const temporaryDetails = getSectionData('temporary_');

  const renderSection = (title, data) => (
    <>
      <h4 className="text-lg font-semibold mt-6 mb-2 text-orange-600">
        {title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
        {data.map(([key, value]) => (
          <div key={key} className="flex ">
            <span className="text-gray-500 font-medium">{formatKey(key)}</span><p className="px-5">:</p>
            <span className="text-gray-900">{String(value)}</span>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <>
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-5xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Confirm Booking Data
            </h3>

            {renderSection('Client Details', clientDetails)}

            {permanentDetails.length > 0 &&
              renderSection('Permanent Property Details', permanentDetails)}

            {temporaryDetails.length > 0 &&
              renderSection('Temporary Property Details', temporaryDetails)}

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfirmationModel;

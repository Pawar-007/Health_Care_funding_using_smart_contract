import React, { useEffect, useState } from "react";

const MyRequests = ({ account, contract }) => {
  const [indexes, setIndexes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [request, setRequest] = useState(null);

  useEffect(() => {
    const fetchIndexes = async () => {
      if (contract && account) {
        const data = await contract.methods.getPatientRequestIndexes(account).call();
        setIndexes(data);
      }
    };
    fetchIndexes();
  }, [account, contract]);

  const fetchRequest = async () => {
    if (selectedIndex !== "") {
      const req = await contract.methods.getRequest(selectedIndex).call();
      setRequest(req);
    }
  };

  return (
    <div className="mt-10 p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">My Request Indexes</h2>
      <p>{indexes.length > 0 ? indexes.join(", ") : "No requests found."}</p>

      <div className="mt-6">
        <input
          type="number"
          placeholder="Enter request index"
          className="border p-2 rounded"
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(e.target.value)}
        />
        <button onClick={fetchRequest} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">
          View Request
        </button>
      </div>

      {request && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <p><strong>Patient:</strong> {request.patient}</p>
          <p><strong>Amount:</strong> {request.amount}</p>
          <p><strong>Reason:</strong> {request.reason}</p>
          <p><strong>Report Hash:</strong> {request.reportHash}</p>
          <p><strong>Deadline:</strong> {new Date(parseInt(request.deadline) * 1000).toLocaleString()}</p>
          <p><strong>Approved:</strong> {request.approved.toString()}</p>
          <p><strong>Rejected:</strong> {request.rejected.toString()}</p>
          <p><strong>Funded:</strong> {request.funded.toString()}</p>
        </div>
      )}
    </div>
  );
};

export default MyRequests;

import React from "react";

export default function RequestList({ requests, account, contract, web3, reload }) {
  const donate = async (index, value) => {
    await contract.methods.donateToRequest(index).send({ from: account, value: web3.utils.toWei(value, "ether") });
    reload(contract);
  };

  const approveRequest = async (index) => {
    await contract.methods.approveRequest(index).send({ from: account });
    reload(contract);
  };

  const rejectRequest = async (index) => {
    await contract.methods.rejectRequest(index).send({ from: account });
    reload(contract);
  };

  const fundPatient = async (index) => {
    await contract.methods.fundPatient(index).send({ from: account });
    reload(contract);
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">All Requests</h2>
      {requests.map((req, i) => (
        <div key={i} className="border p-4 mb-4 rounded">
          <p><strong>Patient:</strong> {req.patient}</p>
          <p><strong>Amount:</strong> {req.amount}</p>
          <p><strong>Reason:</strong> {req.reason}</p>
          <p><strong>Deadline:</strong> {new Date(Number(req.deadline) * 1000).toLocaleString()}</p>
          <p><strong>Status:</strong> {req.funded ? "Funded" : req.approved ? "Approved" : req.rejected ? "Rejected" : "Pending"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => donate(req.index, prompt("Enter donation amount in ETH"))}
              className="bg-purple-500 text-white px-3 py-1 rounded"
            >
              Donate
            </button>
            <button
              onClick={() => approveRequest(req.index)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Approve
            </button>
            <button
              onClick={() => rejectRequest(req.index)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Reject
            </button>
            <button
              onClick={() => fundPatient(req.index)}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Fund Patient
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

import React, { useState } from "react";
import Web3 from "web3";

const RequestList = ({ requests, account, contract, web3, reload, isAdmin }) => {
  const [donationAmounts, setDonationAmounts] = useState({});

  const handleInputChange = (index, value) => {
    setDonationAmounts({ ...donationAmounts, [index]: value });
  };

  const donateToRequest = async (index) => {
    try {
      const amountInWei = web3.utils.toWei(donationAmounts[index] || "0", "ether");
      await contract.methods.donateToRequest(index).send({
        from: account,
        value: amountInWei,
      });
      alert("Donation successful");
      reload(contract);
    } catch (error) {
      console.error("Donation failed", error);
      alert("Donation failed");
    }
  };

  const approveRequest = async (index) => {
    await contract.methods.approveRequest(index).send({ from: account });
    reload(contract);
  };

  const rejectRequest = async (index) => {
    await contract.methods.rejectRequest(index).send({ from: account });
    reload(contract);
  };

  const fundRequest = async (index) => {
    await contract.methods.fundPatient(index).send({ from: account });
    reload(contract);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">All Requests</h2>
      {requests.map((req, index) => (
        <div key={index} className="bg-white shadow rounded p-4 mb-4">
          <p><strong>Patient:</strong> {req.patient}</p>
          <p><strong>Amount:</strong> {web3.utils.fromWei(req.amount, "ether")} ETH</p>
          <p><strong>Reason:</strong> {req.reason}</p>
          <p><strong>Deadline:</strong> {new Date(parseInt(req.deadline) * 1000).toLocaleString()}</p>
          <p><strong>Status:</strong> 
            {req.funded ? "🟢 Funded" : req.rejected ? "🔴 Rejected" : req.approved ? "🟡 Approved" : "⚪ Pending"}
          </p>

          {!isAdmin && !req.funded && !req.rejected && (
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                step="0.001"
                placeholder="ETH"
                value={donationAmounts[req.index] || ""}
                onChange={(e) => handleInputChange(req.index, e.target.value)}
                className="border p-1 rounded w-32"
              />
              <button
                onClick={() => donateToRequest(req.index)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Donate
              </button>
            </div>
          )}

          {isAdmin && !req.funded && !req.rejected && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => approveRequest(req.index)}
                className="bg-green-500 text-white px-3 py-1 rounded"
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
                onClick={() => fundRequest(req.index)}
                className="bg-indigo-500 text-white px-3 py-1 rounded"
              >
                Fund Patient
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RequestList;

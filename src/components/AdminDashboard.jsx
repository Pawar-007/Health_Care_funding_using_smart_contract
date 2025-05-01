import { useEffect, useState } from "react";
import { getContract } from "../utils/contract";

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [web3, setWeb3] = useState(null);

const loadRequests = async () => {
  const { contract, web3 } = await getContract();
  setWeb3(web3); // ✅ Save web3 instance

  const count = await contract.methods.getRequestsCount().call();
  const temp = [];

  for (let i = 0; i < count; i++) {
    const req = await contract.methods.requests(i).call();
    temp.push({ index: i, ...req });
  }

  setRequests(temp);
};

  const approve = async (index) => {
    const { contract, account } = await getContract();
    await contract.methods.approveRequest(index).send({ from: account });
    loadRequests();
  };

  const fund = async (index) => {
    const { contract, account } = await getContract();
    await contract.methods.fundPatient(index).send({ from: account });
    loadRequests();
  };

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">Admin Dashboard</h2>
      {requests.map((req, idx) => (
        <div key={idx} className="bg-white border border-gray-300 rounded-xl shadow-md p-4">
          <p><strong>Patient:</strong> <span className="font-mono text-sm">{req.patient}</span></p>
          <p><strong>Amount:</strong> {web3 ? web3.utils.fromWei(req.amount, "ether") : "Loading..."} ETH</p>
          <p><strong>Reason:</strong> {req.reason}</p>
          <p><strong>Status:</strong> <span className="font-bold">
            {req.funded ? "Funded ✅" : req.approved ? "Approved 🔶" : "Pending 🔵"}
          </span></p>
          <div className="mt-3 space-x-2">
            {!req.approved && (
              <button onClick={() => approve(req.index)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-xl">
                Approve
              </button>
            )}
            {req.approved && !req.funded && (
              <button onClick={() => fund(req.index)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-xl">
                Fund
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;
// API Key: 5f80897e47f68cfd5173
// API Secret: 1495289c961fa6c61611cffecf27171ed583ed9fe27e13aeee50d312d8bde173
// JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1ZWYxYzg2OS05YzQzLTRlODktODc0Zi01MWJiOWQxMjEyYWUiLCJlbWFpbCI6ImJhcGF3YXI5NDA5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI1ZjgwODk3ZTQ3ZjY4Y2ZkNTE3MyIsInNjb3BlZEtleVNlY3JldCI6IjE0OTUyODljOTYxZmE2YzYxNjExY2ZmZWNmMjcxNzFlZDU4M2VkOWZlMjdlMTNhZWVlNTBkMzEyZDhiZGUxNzMiLCJleHAiOjE3NzU5MjcyNTZ9.V5jjWxEZidP7juvjREicMuKNUjibvjIzBCyHmGJLkYA
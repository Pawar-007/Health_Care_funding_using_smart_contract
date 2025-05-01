import { useEffect, useState } from "react";
import { getContract } from "../utils/contract";
import DonateEth from "./DonateEth";

function UserPage({ account }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [myRequests, setMyRequests] = useState([]);
  const [web3, setWeb3] = useState(null);

  const handleSubmit = async () => {
    try {
      const { contract, web3, account } = await getContract();
      const amountInWei = web3.utils.toWei(amount, "ether");
      await contract.methods.createRequest(amountInWei, reason).send({ from: account });
      setStatus("Request submitted successfully. Waiting for approval.");
      fetchMyRequests(); // reload after submission
    } catch (err) {
      console.error("Error submitting request:", err);
      setStatus("Failed to submit request.");
    }
  };

  const fetchMyRequests = async () => {
    
    const { contract, web3 } = await getContract();
    setWeb3(web3);

    const count = await contract.methods.getRequestsCount().call();
    const requests = [];

    for (let i = 0; i < count; i++) {
      const req = await contract.methods.requests(i).call();
      if (req.patient.toLowerCase() === account.toLowerCase()) {
        requests.push({ ...req, index: i });
      }
    }

    setMyRequests(requests);
  };

  useEffect(() => {
    if (account) {
      fetchMyRequests();
    }
  }, [account]);

  return (
    <>
      <div className="bg-gray-100 p-6 rounded-xl shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Submit Funding Request</h2>
        <input
          type="text"
          placeholder="Amount in ETH"
          className="border border-blue-300 rounded px-4 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <textarea
          placeholder="Reason"
          className="border border-blue-300 rounded px-4 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-xl transition duration-300"
        >
          Submit Request
        </button>
        {status && <p className="mt-4 text-green-600 font-medium">{status}</p>}
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2 text-blue-700">Your Funding Requests</h3>
        {myRequests.length === 0 ? (
          <p>No requests found.</p>
        ) : (
          myRequests.map((req, i) => (
            <div key={i} className="mb-3 p-3 border border-gray-300 rounded-xl">
         <p><strong>Amount:</strong> {web3 ? web3.utils.fromWei(req.amount.toString(), "ether") : "Loading..."} ETH</p>
              <p><strong>Reason:</strong> {req.reason}</p>
              <p><strong>Status:</strong>{" "}
                <span className="font-semibold">
                  {req.funded ? "✅ Funded" : req.approved ? "🔶 Approved" : "🔵 Pending"}
                </span>
              </p>
            </div>
          ))
        )}
      </div>

      <DonateEth account={account} />
    </>
  );
}

export default UserPage;

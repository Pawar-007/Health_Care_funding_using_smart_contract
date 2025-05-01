import { useState } from "react";
import { getContract } from "../utils/contract";

function DonateEth() {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const handleDonate = async ({account}) => {
    try {
      const { web3, contract, account } = await getContract();
      const amountInWei = web3.utils.toWei(amount, "ether");

      const tx = await contract.methods.donate().send({
        from: account,
        value: amountInWei,
      });

      console.log("Donation TX:", tx);
      setStatus("Donation successful!");
    } catch (err) {
      console.error("Donation failed:", err);
      setStatus("Failed to donate. Please try again.");
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow mt-6">
      <h3 className="text-xl font-semibold mb-2 text-green-700">Donate to Help Patients</h3>
      <input
        type="text"
        placeholder="Amount in ETH"
        className="border border-gray-300 px-4 py-2 rounded w-full mb-2"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        onClick={handleDonate}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Donate
      </button>
      {status && <p className="mt-2 text-sm text-gray-700">{status}</p>}
    </div>
  );
}

export default DonateEth;

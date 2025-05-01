import React, { useState } from "react";

export default function GeneralDonation({ account, contract, web3 }) {
  const [generalDonation, setGeneralDonation] = useState("");

  const donateToPool = async () => {
    await contract.methods.donateToPool().send({ from: account, value: web3.utils.toWei(generalDonation, "ether") });
    setGeneralDonation("");
  };

  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Donate to General Pool</h2>
      <div className="flex gap-4">
        <input
          type="number"
          placeholder="Amount in ETH"
          value={generalDonation}
          onChange={(e) => setGeneralDonation(e.target.value)}
          className="border p-2 rounded"
        />
        <button onClick={donateToPool} className="bg-green-600 text-white px-4 py-2 rounded">
          Donate
        </button>
      </div>
    </div>
  );
}
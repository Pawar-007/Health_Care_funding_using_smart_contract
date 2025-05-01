import React, { useEffect, useState } from "react";
import Web3 from "web3";
import HealthcareFundingContract from "./utils/contract";
import CreateRequest from "./components/CreateRequest";
import GeneralDonation from "./components/GeneralDonation";
import RequestList from "./components/RequestLists";
import MyRequests from "./components/MyRequests";

export default function App() { 
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function init() {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.enable();
        const accounts = await web3Instance.eth.getAccounts();
        const instance = HealthcareFundingContract(web3Instance);
        const owner = await instance.methods.owner().call();

        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setContract(instance);
        setIsAdmin(accounts[0].toLowerCase() === owner.toLowerCase());
        loadRequests(instance);
      } else {
        alert("Please install MetaMask");
      }
    }
    init();
  }, []);

  const loadRequests = async (contractInstance) => {
    const count = await contractInstance.methods.getRequestsCount().call();
    const allRequests = [];
    for (let i = 0; i < count; i++) {
      const req = await contractInstance.methods.getRequest(i).call();
      allRequests.push({ ...req, index: i });
    }
    setRequests(allRequests);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Healthcare Funding DApp</h1>
        <p className="text-center mb-4">Connected Account: {account}</p>
        
        <CreateRequest account={account} contract={contract} reload={loadRequests} />
        <GeneralDonation account={account} contract={contract} web3={web3} />
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Requests</h2>
        <RequestList
          requests={requests}
          account={account}
          contract={contract}
          web3={web3}
          reload={loadRequests}
          isAdmin={isAdmin}
        />
        <MyRequests account={account} contract={contract} />
        <userPage account={account} contract={contract} web3={web3} />
      </div>
    </div>
  );
}

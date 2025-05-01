import React, { useState } from "react";
import axios from "axios";

export default function CreateRequest({ account, contract, reload }) {
  const [newRequest, setNewRequest] = useState({
    amount: "",
    reason: "",
    duration: "",
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileUpload = async () => {
  if (!file) {
    setUploadError("Please select a file to upload");
    return null;
  }

  // Validate file type/size if needed
  const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    setUploadError("Only PDF, JPEG, PNG, or GIF files are allowed");
    return null;
  }

  // Optional: Check file size (e.g., 10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    setUploadError("File size must be less than 10MB");
    return null;
  }

  try {
    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    // Add metadata (optional but recommended)
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        description: "Verification document",
        uploadedBy: account // Assuming you have user account info
      }
    });
    formData.append("pinataMetadata", metadata);

    // Add pinata options (optional)
    const options = JSON.stringify({
      cidVersion: 0 // Default to v0 for compatibility
    });
    formData.append("pinataOptions", options);
    console.log(import.meta.env.VITE_APIKey, import.meta.env.VITE_APISecret);
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxContentLength: "Infinity",
        maxBodyLength: "Infinity",
        headers: {
          // Let axios set the Content-Type automatically
          "Content-Type": "multipart/form-data",
          pinata_api_key: `${import.meta.env.VITE_APIKey}`,
          pinata_secret_api_key: `${import.meta.env.VITE_APISecret}`
        }
      }
    );

    console.log("File uploaded successfully. IPFS Hash:", res.data.IpfsHash);
    return res.data.IpfsHash;
  } catch (err) {
    console.error("Upload error:", err);
    setUploadError(
      err.response?.data?.error?.details || 
      "Failed to upload file. Please try again."
    );
    return null;
  } finally {
    setUploading(false);
  }
};

  const createRequest = async () => {
    setUploading(true);
    setUploadError("");

    const reportHash = await handleFileUpload();
    if (!reportHash) {
      setUploading(false);
      return;
    }

    try {
      const { amount, reason, duration } = newRequest;
      console.log("account",account,amount, reason, duration);
      const createRequest=await contract.methods.createRequest(amount, reason, reportHash, duration).send({ from: account });
      console.log("Request created:", createRequest);
      // Reset form
      setNewRequest({ amount: "", reason: "", duration: "" });
      setFile(null);
      setUploading(false);
      reload(contract);
    } catch (error) {
      console.error("Contract call failed:", error);
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Create Request</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Amount (wei)"
          value={newRequest.amount}
          onChange={(e) => setNewRequest({ ...newRequest, amount: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Reason"
          value={newRequest.reason}
          onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Duration (seconds)"
          value={newRequest.duration}
          onChange={(e) => setNewRequest({ ...newRequest, duration: e.target.value })}
          className="border p-2 rounded"
        />
      </div>

      {uploadError && (
        <p className="text-red-600 mt-2">{uploadError}</p>
      )}

      <button
        onClick={createRequest}
        className={`mt-4 px-4 py-2 rounded text-white ${uploading ? "bg-gray-400" : "bg-blue-600"}`}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Submit Request"}
      </button>
    </div>
  );
}

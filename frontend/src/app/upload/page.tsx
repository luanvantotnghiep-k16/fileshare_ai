"use client";

import React, { useRef, useState } from "react";
import Header from "@/components/Header";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [password, setPassword] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!recipientEmail) {
      setError("Recipient email is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (!expirationDate) {
      setError("Expiration date is required.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("recipientEmail", recipientEmail);
      formData.append("password", password);
      formData.append("expirationDate", expirationDate);
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/file/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Upload failed");
      } else {
        setSuccess("File uploaded successfully!");
        setFile(null);
        setRecipientEmail("");
        setPassword("");
        // removed confirmPassword
        setExpirationDate("");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 pt-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded shadow-md w-full max-w-lg space-y-6"
        >
          <h1 className="text-2xl font-bold mb-4 text-center">Upload File</h1>
          <div
            className="border-2 border-dashed border-gray-300 rounded p-6 text-center cursor-pointer bg-gray-50 hover:bg-gray-200"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {file ? (
              <span className="text-green-700 font-medium">{file.name}</span>
            ) : (
              <span className="text-gray-500">Drag and drop a file here, or click to select</span>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Recipient Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={recipientEmail}
              onChange={e => setRecipientEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Expiration Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={expirationDate}
              onChange={e => setExpirationDate(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload File"}
          </button>
        </form>
      </div>
    </>
  );
}

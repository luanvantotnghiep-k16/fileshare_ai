
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

type UploadedFile = {
  _id: string;
  fileName: string;
  recipientEmail: string;
  expirationDate: string;
  createdAt: string;
};

export default function Home() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Auth check and fetch files
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    const fetchFiles = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/file/list/send`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch files");
        const data = await res.json();
        setFiles(data || []);
      } catch (err) {
        setError("Could not load uploaded files.");
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [router]);

  return (
    <>
      <Header />
      <div className="flex flex-col items-center min-h-screen bg-gray-100 pt-8">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Uploaded Files</h1>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => setShowModal(true)}
            >
              Share File
            </button>
          </div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-red-600 text-center py-8">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 border">ID</th>
                    <th className="px-4 py-2 border">File Name</th>
                    <th className="px-4 py-2 border">Recipient Email</th>
                    <th className="px-4 py-2 border">Expiration Date</th>
                    <th className="px-4 py-2 border">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {files.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500 border">No results</td>
                    </tr>
                  ) : (
                    files.map((file) => (
                      <tr key={file._id} className="hover:bg-gray-100">
                        <td className="px-4 py-2 border">{file._id}</td>
                        <td className="px-4 py-2 border">{file.fileName}</td>
                        <td className="px-4 py-2 border">{file.recipientEmail}</td>
                        <td className="px-4 py-2 border">{file.expirationDate?.slice(0, 10)}</td>
                        <td className="px-4 py-2 border">{file.createdAt?.slice(0, 19).replace('T', ' ')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal for file upload */}
        {showModal && (
          <FileUploadModal
            onClose={() => { setShowModal(false); if (typeof window !== "undefined") window.location.reload(); }}
          />
        )}
      </div>
    </>
  );
}

// Modal component for file upload
function FileUploadModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [password, setPassword] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
        setTimeout(() => onClose(), 1000);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Share File</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? "Uploading..." : "Share File"}
          </button>
        </form>
      </div>
    </div>
  );
}

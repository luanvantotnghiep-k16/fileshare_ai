"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

// Type for received file
interface ReceivedFile {
  _id: string;
  fileName: string;
  owner: string;
  recipientEmail: string;
  expirationDate: string;
  createdAt: string;
  senderEmail?: string;
  receivedAt?: string;
}

export default function ReceivedFilesPage() {
  const [files, setFiles] = useState<ReceivedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState<null | ReceivedFile>(null);
  const [decryptError, setDecryptError] = useState("");
  const router = useRouter();

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/file/list/receive`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch files");
        const data = await res.json();
       
        setFiles((data || []).map((item: ReceivedFile) => ({
          ...item,
          // Map owner to senderEmail for display
          senderEmail: item.owner,
          receivedAt: item.createdAt,
        })));
      } catch (err) {
        setError("Could not load received files.");
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
          <h1 className="text-2xl font-bold mb-6">Received Files</h1>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">File Name</th>
                  <th className="px-4 py-2 border">Sender Email</th>
                  <th className="px-4 py-2 border">Expiration Date</th>
                  <th className="px-4 py-2 border">Received At</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 border">Loading...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-red-600 border">{error}</td>
                  </tr>
                ) : files.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 border">No results</td>
                  </tr>
                ) : (
                  files.map((file) => (
                    <tr key={file._id} className="hover:bg-gray-100">
                      <td className="px-4 py-2 border">{file._id}</td>
                      <td className="px-4 py-2 border">{file.fileName}</td>
                      <td className="px-4 py-2 border">{file.senderEmail}</td>
                      <td className="px-4 py-2 border">{file.expirationDate?.slice(0, 10)}</td>
                      <td className="px-4 py-2 border">{file.receivedAt?.slice(0, 19).replace('T', ' ')}</td>
                      <td className="px-4 py-2 border text-center">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                          onClick={() => { setShowModal(file); setDecryptError(""); }}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {showModal && (
          <DownloadModal
            file={showModal}
            onClose={() => setShowModal(null)}
            setDecryptError={setDecryptError}
            decryptError={decryptError}
          />
        )}
      </div>
    </>
  );
}

function DownloadModal({ file, onClose, setDecryptError, decryptError }: {
  file: ReceivedFile;
  onClose: () => void;
  setDecryptError: (msg: string) => void;
  decryptError: string;
}) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setDecryptError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/file/retrieve/${file._id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setDecryptError(data.message || "Decryption failed");
      } else {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        onClose();
      }
    } catch (err) {
      setDecryptError("Network error");
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
        <h2 className="text-xl font-bold mb-4 text-center">Download File</h2>
        <form onSubmit={handleDownload} className="space-y-4">
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
          {decryptError && <div className="text-red-600 text-sm">{decryptError}</div>}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "Decrypting..." : "Download"}
          </button>
        </form>
      </div>
    </div>
  );
}

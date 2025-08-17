import React, { useState } from "react";

const BACKEND_URL = "https://meeting-summarizer-backend-5f97.onrender.com";

export default function App() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState(
    "Summarize in bullet points for executives"
  );
  const [summary, setSummary] = useState("");
  const [editedSummary, setEditedSummary] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a transcript file.");
      return;
    }
    setLoading(true);
    setMessage("");
    setSummary("");
    setEditedSummary("");
    const formData = new FormData();
    formData.append("transcript", file);
    formData.append("prompt", prompt);

    try {
      const res = await fetch(`${BACKEND_URL}/api/summarize`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
        setEditedSummary(data.summary);
      } else {
        setMessage("Failed to get summary.");
      }
    } catch (error) {
      setMessage("Error summarizing transcript.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email) {
      alert("Please enter recipient email address(es).");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: editedSummary, recipients: email }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Email sent successfully!");
      } else {
        setMessage("Failed to send email.");
      }
    } catch (error) {
      setMessage("Error sending email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">AI Meeting Notes Summarizer</h1>

      <form onSubmit={handleSummarize} className="mb-6">
        <label className="block mb-2">
          Upload Transcript (.txt)
          <input
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            className="block w-full border p-2 mt-1"
          />
        </label>

        <label className="block mb-4">
          Custom Prompt / Instruction
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="block w-full border p-2 mt-1"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Summary"}
        </button>
      </form>

      {summary && (
        <>
          <label className="block mb-2 font-semibold">
            Generated Summary (editable):
          </label>
          <textarea
            rows="10"
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            className="w-full border p-2 mb-4"
          />

          <label className="block mb-2">
            Share Summary via Email (comma-separated):
          </label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. person1@example.com, person2@example.com"
            className="block w-full border p-2 mb-4"
          />

          <button
            onClick={handleSendEmail}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Email"}
          </button>
        </>
      )}

      {message && <p className="mt-4 text-red-600">{message}</p>}
    </div>
  );
}

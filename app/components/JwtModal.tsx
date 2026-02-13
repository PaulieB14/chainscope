"use client";

import { useState } from "react";

interface Props {
  currentJwt: string;
  onSave: (jwt: string) => void;
  onClose: () => void;
}

export default function JwtModal({ currentJwt, onSave, onClose }: Props) {
  const [value, setValue] = useState(currentJwt);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg">
        <h2 className="text-lg font-bold mb-1">API Key</h2>
        <p className="text-zinc-500 text-sm mb-4">
          Your JWT from{" "}
          <a
            href="https://thegraph.market"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            thegraph.market
          </a>
          . Stored locally in your browser — never sent to our servers.
        </p>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="eyJhbGciOiJ..."
          rows={4}
          className="w-full bg-[#1a1c24] border border-[#2a2d38] rounded-lg p-3 text-sm text-zinc-300 font-mono resize-none focus:border-accent outline-none mb-4"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(value.trim())}
            disabled={!value.trim()}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-accent text-black hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

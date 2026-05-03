"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/translation-runtime";
import {
  addVoice,
  hasUpvoted,
  listVoices,
  upvoteVoice,
  type Voice,
} from "@/lib/voices-store";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export default function VoicesPage() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const title = useT("voices.title");
  const subtitle = useT("voices.subtitle");
  const placeholder = useT("voices.composer.placeholder");
  const submit = useT("voices.composer.submit");
  const imageHint = useT("voices.composer.imageHint");
  const empty = useT("voices.empty");
  const upvoteLabel = useT("voices.upvote");
  const upvotedLabel = useT("voices.upvoted");
  const imageTooLarge = useT("voices.imageTooLarge");

  useEffect(() => {
    setVoices(listVoices());
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError(imageTooLarge);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") setImage(result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addVoice({ text, image });
    setVoices(listVoices());
    setText("");
    setImage(undefined);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onUpvote = (id: string) => {
    upvoteVoice(id);
    setVoices(listVoices());
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight mb-2">{title}</h1>
        <p className="text-muted">{subtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="bg-surface border border-border rounded-xl p-5 mb-8 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-xs text-muted">
            {imageHint}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onFile}
              className="block mt-1 text-xs text-text/85"
            />
          </label>
          <button
            type="submit"
            disabled={!text.trim()}
            className="px-5 py-2 rounded-lg bg-accent text-bg text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {submit}
          </button>
        </div>
        {image && (
          <img
            src={image}
            alt=""
            className="rounded-lg max-h-48 object-cover border border-border"
          />
        )}
        {error && <div className="text-xs text-red-400">{error}</div>}
      </form>

      {voices.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center text-muted">
          {empty}
        </div>
      ) : (
        <ul className="space-y-3">
          {voices.map((v) => {
            const upvoted = hasUpvoted(v.id);
            return (
              <li
                key={v.id}
                className="bg-surface border border-border rounded-xl p-4"
              >
                <div className="text-sm text-text/90 leading-relaxed whitespace-pre-wrap mb-2">
                  {v.text}
                </div>
                {v.image && (
                  <img
                    src={v.image}
                    alt=""
                    className="rounded-lg max-h-72 object-cover border border-border mb-2"
                  />
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted font-mono">{v.authorUid}</span>
                  <button
                    onClick={() => onUpvote(v.id)}
                    disabled={upvoted}
                    className={`px-2 py-1 rounded border text-xs transition-colors ${
                      upvoted
                        ? "border-accent/40 text-accent/70 cursor-default"
                        : "border-border hover:border-accent/60 hover:text-accent"
                    }`}
                  >
                    ▲ {upvoted ? upvotedLabel : upvoteLabel} · {v.upvotes}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

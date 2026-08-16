"use client";

import { useState, useEffect } from "react";
import {
  useListPagesQuery,
  useUpsertPageMutation,
} from "../../../features/cms/pagesApi";
import RichTextEditor from "../../../components/admin/RichTextEditor";

const PAGE_PRESETS = [
  { slug: "homepage", title: "Homepage" },
  { slug: "about", title: "About Us" },
  { slug: "contact", title: "Contact" },
  { slug: "privacy-policy", title: "Privacy Policy" },
  { slug: "terms", title: "Terms & Conditions" },
];

const emptySection = () => ({
  type: "richText",
  title: "",
  subtitle: "",
  body: "",
  ctaLabel: "",
  ctaUrl: "",
});

export default function AdminPagesPage() {
  const { data } = useListPagesQuery();
  const [upsertPage, { isLoading: isSaving }] = useUpsertPageMutation();
  const [activeSlug, setActiveSlug] = useState("homepage");
  const [sections, setSections] = useState([]);
  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveError, setSaveError] = useState("");

  const pages = data?.data || [];

  useEffect(() => {
    const existing = pages.find((p) => p.slug === activeSlug);
    const preset = PAGE_PRESETS.find((p) => p.slug === activeSlug);
    setTitle(existing?.title || preset?.title || activeSlug);
    setSections(
      existing?.sections?.length ? existing.sections : [emptySection()]
    );
    setSaveStatus(null);
  }, [activeSlug, pages]);

  const updateSection = (index, patch) =>
    setSections((s) =>
      s.map((sec, i) => (i === index ? { ...sec, ...patch } : sec))
    );

  const addSection = () => setSections((s) => [...s, emptySection()]);
  const removeSection = (index) =>
    setSections((s) => s.filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaveStatus(null);
    setSaveError("");
    try {
      await upsertPage({ slug: activeSlug, title, sections }).unwrap();
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err) {
      setSaveStatus("error");
      setSaveError(
        err?.data?.message ||
          "Could not save this page. Check that every section has a type selected."
      );
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pages</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {PAGE_PRESETS.map((p) => (
          <button
            key={p.slug}
            onClick={() => setActiveSlug(p.slug)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              activeSlug === p.slug
                ? "border-brand-500 text-brand-500 bg-brand-50"
                : "border-gray-200"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {activeSlug === "homepage" && (
        <p className="text-sm text-gray-500 mb-4 bg-gray-50 border border-gray-100 rounded-lg p-3">
          Sections saved here appear on the storefront homepage, below the
          product grid. The homepage's hero banner is managed separately under{" "}
          <a href="/admin/banners" className="text-brand-500 hover:underline">
            Banners
          </a>
          .
        </p>
      )}

      <div className="max-w-3xl space-y-6">
        <div>
          <label className="text-sm font-medium">Page Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm mt-1"
          />
        </div>

        {sections.map((section, i) => (
          <div
            key={i}
            className="border border-gray-100 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <select
                value={section.type}
                onChange={(e) => updateSection(i, { type: e.target.value })}
                className="border rounded px-2 py-1 text-sm"
              >
                {["hero", "richText", "imageText", "faq", "cta", "custom"].map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  )
                )}
              </select>
              <button
                onClick={() => removeSection(i)}
                className="text-red-500 text-sm"
              >
                Remove Section
              </button>
            </div>
            <input
              placeholder="Section title"
              value={section.title || ""}
              onChange={(e) => updateSection(i, { title: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="Subtitle"
              value={section.subtitle || ""}
              onChange={(e) => updateSection(i, { subtitle: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <RichTextEditor
              value={section.body || ""}
              onChange={(body) => updateSection(i, { body })}
            />
            {section.type === "cta" && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Button label"
                  value={section.ctaLabel || ""}
                  onChange={(e) =>
                    updateSection(i, { ctaLabel: e.target.value })
                  }
                  className="border rounded px-3 py-2 text-sm"
                />
                <input
                  placeholder="Button URL"
                  value={section.ctaUrl || ""}
                  onChange={(e) => updateSection(i, { ctaUrl: e.target.value })}
                  className="border rounded px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addSection}
          className="text-sm text-brand-500 hover:underline"
        >
          + Add Section
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Page"}
          </button>
          {saveStatus === "success" && (
            <span className="text-sm text-green-600">
              ✓ Saved — visible on the site now.
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-red-600">{saveError}</span>
          )}
        </div>
      </div>
    </div>
  );
}

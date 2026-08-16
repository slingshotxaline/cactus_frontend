"use client";

import { useGetPageBySlugQuery } from "../../../features/cms/pagesApi";
import PageSections from "../../../components/shop/PageSections";

export default function AboutPage() {
  const { data, isLoading } = useGetPageBySlugQuery("about");
  const page = data?.data;

  if (isLoading)
    return <div className="max-w-3xl mx-auto px-4 py-16">Loading...</div>;
  if (!page)
    return <div className="max-w-3xl mx-auto px-4 py-16">Page not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{page.title}</h1>
      <PageSections sections={page.sections} />
    </div>
  );
}

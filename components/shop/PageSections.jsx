export default function PageSections({ sections }) {
  if (!sections?.length) return null;

  return (
    <>
      {sections.map((section) => (
        <section key={section._id} className="mb-10">
          {section.title && (
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {section.title}
            </h2>
          )}
          {section.subtitle && (
            <p className="text-gray-500 mb-3">{section.subtitle}</p>
          )}
          {section.body && (
            <div
              className="prose text-gray-700"
              dangerouslySetInnerHTML={{ __html: section.body }}
            />
          )}
          {section.type === "cta" && section.ctaLabel && (
            <a
              href={section.ctaUrl}
              className="inline-block mt-4 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
            >
              {section.ctaLabel}
            </a>
          )}
        </section>
      ))}
    </>
  );
}

"use client";

import ProductGrid from "../../components/shop/ProductGrid";
import ProductCarousel from "../../components/shop/ProductCarousel";
import HeroBanner from "../../components/shop/HeroBanner";
import PageSections from "../../components/shop/PageSections";
import HomepageProductSections from "../../components/shop/HomepageProductSections";
import { useGetTrendingQuery } from "../../features/recommendations/recommendationsApi";
import { useGetPageBySlugQuery } from "../../features/cms/pagesApi";
import { useGetActiveHomepageSectionsQuery } from "../../features/homepageSections/homepageSectionsApi";

export default function HomePage() {
  const { data: trendingData } = useGetTrendingQuery();
  const { data: homepageData } = useGetPageBySlugQuery("homepage");
  const { data: customSectionsData, isLoading: isLoadingSections } =
    useGetActiveHomepageSectionsQuery();
  const hasCustomSections = (customSectionsData?.data?.length || 0) > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <HeroBanner />

      {!isLoadingSections && hasCustomSections ? (
        <HomepageProductSections />
      ) : (
        <>
          <section className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900">
              Featured Products
            </h1>
            <p className="text-gray-500 mt-1">Hand-picked items for you</p>
          </section>
          <ProductGrid />
        </>
      )}

      <ProductCarousel
        title="Trending This Week"
        products={trendingData?.data}
      />

      {homepageData?.data?.sections?.length > 0 && (
        <div className="mt-16 pt-10 border-t border-gray-100">
          <PageSections sections={homepageData.data.sections} />
        </div>
      )}
    </div>
  );
}

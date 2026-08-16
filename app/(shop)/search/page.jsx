"use client";

import { Suspense } from "react";
import SearchContent from "../../../components/shop/SearchContent";


export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
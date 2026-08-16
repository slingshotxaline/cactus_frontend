"use client";

import { Suspense } from "react";
import InventoryContent from "../../../components/shop/InventoryContent";


export default function AdminInventoryPage() {
  return (
    <Suspense fallback={<div>Loading inventory...</div>}>
      <InventoryContent />
    </Suspense>
  );
}
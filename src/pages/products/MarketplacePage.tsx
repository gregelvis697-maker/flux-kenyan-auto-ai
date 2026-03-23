import React from "react";
import ProductPage from "@/components/products/ProductPage";
import { marketplaceData } from "@/components/products/productData";

const MarketplacePage = () => <ProductPage data={marketplaceData} />;
export default MarketplacePage;

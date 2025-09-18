// components/FiltersSidebar.tsx
"use client";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Sidebar } from "lucide-react";
import { useState } from "react";

const categories = [
  "All",
  "Art",
  "Gaming",
  "Memberships",
  "Music",
  "PFPs",
  "Photography",
  "Domain Names",
  "Sports Collectibles",
  "Virtual Worlds",
];

const chains = [
  "All",
  "Ethereum",
  "Abstract",
  "ApeChain",
  "Arbitrum",
  "Avalanche",
  "B3",
  "Base",
  "Berachain",
  "Blast",
  "Flow",
  "Optimism",
  "Polygon",
  "Ronin",
  "Sei",
  "Shape",
  "Soneium",
  "Unichain",
  "Zora",
];

function FilterFeaturesSection() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedChain, setSelectedChain] = useState("All");

  return (
    <SidebarProvider>
      <SidebarGroup className="flex-col items-center justify-center gap-4">
        <SidebarGroupContent>
          <SidebarMenu>
            <h3 className="mb-2 text-sm font-semibold text-gray-400 uppercase">
              Category
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <SidebarMenuItem
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg border px-3 py-1 text-sm transition-colors ${
                    selectedCategory === cat
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  {cat}
                </SidebarMenuItem>
              ))}
            </div>
          </SidebarMenu>
        </SidebarGroupContent>
        <SidebarGroupContent>
          <SidebarMenu>
            <h3 className="mb-2 text-sm font-semibold text-gray-400 uppercase">
              Chains
            </h3>
            <div className="flex flex-wrap gap-2">
              {chains.map((chain) => (
                <button
                  key={chain}
                  onClick={() => setSelectedChain(chain)}
                  className={`rounded-lg border px-3 py-1 text-sm ${
                    selectedChain === chain
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  {chain}
                </button>
              ))}
            </div>
          </SidebarMenu>
        </SidebarGroupContent>
        <SidebarGroupContent>
          <SidebarMenu>
            <h3 className="mb-2 text-sm font-semibold text-gray-400 uppercase">
              Top Offer
            </h3>
            <input
              type="number"
              placeholder="Min"
              className="mr-2 w-24 rounded-lg border border-gray-700 bg-gray-800 p-2 text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              className="w-24 rounded-lg border border-gray-700 bg-gray-800 p-2 text-sm"
            />
          </SidebarMenu>
        </SidebarGroupContent>
        <SidebarGroupContent>
          <SidebarMenu>
            <h3 className="mb-2 text-sm font-semibold text-gray-400 uppercase">
              Floor Price
            </h3>
            <input
              type="number"
              placeholder="Min"
              className="mr-2 w-24 rounded-lg border border-gray-700 bg-gray-800 p-2 text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              className="w-24 rounded-lg border border-gray-700 bg-gray-800 p-2 text-sm"
            />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      ); return (
      <div className="w-64 space-y-6 bg-gray-900 p-4 text-gray-200">
        {/* Category */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-400 uppercase">
            Category
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg border px-3 py-1 text-sm ${
                  selectedCategory === cat
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-700 hover:bg-gray-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Chains */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-400 uppercase">
            Chains
          </h3>
          <div className="flex flex-wrap gap-2">
            {chains.map((chain) => (
              <button
                key={chain}
                onClick={() => setSelectedChain(chain)}
                className={`rounded-lg border px-3 py-1 text-sm ${
                  selectedChain === chain
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-gray-700 hover:bg-gray-800"
                }`}
              >
                {chain}
              </button>
            ))}
          </div>
        </div>

        {/* Floor Price */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-400 uppercase">
            Floor Price
          </h3>
          <input
            type="number"
            placeholder="Min"
            className="mr-2 w-24 rounded-lg border border-gray-700 bg-gray-800 p-2 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            className="w-24 rounded-lg border border-gray-700 bg-gray-800 p-2 text-sm"
          />
        </div>

        {/* Top Offer */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-400 uppercase">
            Top Offer
          </h3>
          <input
            type="number"
            placeholder="Min"
            className="mr-2 w-24 rounded-lg border border-gray-700 bg-gray-800 p-2 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            className="w-24 rounded-lg border border-gray-700 bg-gray-800 p-2 text-sm"
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
export default FilterFeaturesSection;

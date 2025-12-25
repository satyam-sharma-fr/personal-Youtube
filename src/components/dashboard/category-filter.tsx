"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tag, ChevronDown, Check } from "lucide-react";
import type { ChannelCategory } from "@/types/database";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: ChannelCategory[];
  selectedCategoryId: string | null;
}

export function CategoryFilter({ categories, selectedCategoryId }: CategoryFilterProps) {
  const router = useRouter();

  const handleSelectCategory = (categoryId: string | null) => {
    if (categoryId) {
      router.push(`/dashboard?category=${categoryId}`);
    } else {
      router.push("/dashboard");
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Tag className="w-4 h-4" />
          {selectedCategory ? selectedCategory.name : "All Categories"}
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem
          onClick={() => handleSelectCategory(null)}
          className={cn(!selectedCategoryId && "bg-accent")}
        >
          <span className="flex-1">All Categories</span>
          {!selectedCategoryId && <Check className="w-4 h-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {categories.map((category) => (
          <DropdownMenuItem
            key={category.id}
            onClick={() => handleSelectCategory(category.id)}
            className={cn(selectedCategoryId === category.id && "bg-accent")}
          >
            <Tag className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="flex-1">{category.name}</span>
            {selectedCategoryId === category.id && <Check className="w-4 h-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


"use client";

import { useState, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import api from "../api";
import logger from "../components/Logger";

interface ColorPreset {
  name: string;
  color: string;
}

interface ColorPickerWithPopoverProps {
  label: string;
  apiEndpoint: string;
  cssVariable: string;
  colorPresets: ColorPreset[];
}

export const ColorPickerWithPopover: React.FC<ColorPickerWithPopoverProps> = ({
  label,
  apiEndpoint,
  cssVariable,
  colorPresets,
}) => {

  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const applyColor = async (color: string) => {
    setSelectedColor(color);
    document.documentElement.style.setProperty(cssVariable, color);
  };

  const getColor = async () => {
    try {
      const response = await api.get(apiEndpoint);
      setSelectedColor(response.data.color);
      document.documentElement.style.setProperty(cssVariable, response.data.color);
    } catch (error) {
      logger.error(`Failed to retrieve color from ${apiEndpoint}:`, error);
    }
  };

  useEffect(() => {
    if (selectedColor) {
      const updateColor = async () => {
        try {
          await api.put(apiEndpoint, { color: selectedColor });
        } catch (error) {
          logger.error(`Failed to update color to ${apiEndpoint}:`, error);
        }
      };
      updateColor();
    }
  }, [selectedColor]);

  useEffect(() => {
    getColor();
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{label}</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid grid-cols-5 gap-2 mb-4">
          {colorPresets.map(({ color, name }) => (
            <button
              key={name}
              className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center transition",
                selectedColor === color
                  ? "border-black"
                  : "border-black hover:border-gray-400"
              )}
              style={{ backgroundColor: color }}
              onClick={() => applyColor(color)}
              aria-label={name}
            >
              {selectedColor === color && <Check className="w-4 h-4 text-white" />}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Custom:</label>
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <input
              type="color"
              value={selectedColor || "#D3D3D3"}
              onChange={(e) => applyColor(e.target.value)}
              className="absolute w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="w-full h-full rounded-full border border-black"
              style={{ backgroundColor: selectedColor || "#000000" }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

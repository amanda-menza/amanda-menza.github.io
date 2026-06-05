"use client";
import { ColorPickerWithPopover } from "@/components/ColorPickerWithPopover";
import { FileUploader } from "@/components/FileUploader";
import { useEffect, useState } from "react";
import api from "../../../../api";
import logger from "../../../../components/Logger";
import { useRouter } from "next/navigation";

const GraphicsPage = () => {
  const router = useRouter();
  const [institutionName, setInstitutionName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [fileErrorMessage, setFileErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const backgroundColorPresets = [
    { name: "Duke", color: "#012169" },
    { name: "NC State", color: "#cc0000" },
    { name: "UNC", color: "#7BAFD4" },
    { name: "Green", color: "#16a34a" },
    { name: "Orange", color: "#f97316" },
  ];

  const foregroundColorPresets = [
    { name: "White", color: "#ffffff" },
    { name: "Light Gray", color: "#d3d3d3" },
    { name: "Medium Gray", color: "#a9a9a9" },
    { name: "Dark Gray", color: "#7d7f7c" },
    { name: "Black", color: "#000000" },
  ];

  const handleSaveInstitutionName = async () => {
    if (!institutionName.trim()){
      setSavedMessage("Cannot save an empty name");
      return;
    }

    setSaving(true);
    setSavedMessage("");

    try {
      
      const response = await api.put("/api/institution-name/", {name: institutionName});

      if (response.status !== 200) throw new Error("Failed to save");

      setSavedMessage("Saved successfully!");
    } catch (error) {
      setSavedMessage("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const getInstitutionName = async () => {
    try {
      const response = await api.get("/api/institution-name/");
      setInstitutionName(response.data.name)
    } catch (error) {
      logger.error("Failed to fetch institution name: ", error);
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("logo_file", file);

    // Validate file type
    if (!file.type.match(/^image\//)) {
      setFileErrorMessage("Invalid file type. Only image files are allowed.");
      return;
    }


    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setFileErrorMessage("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setFileErrorMessage(null);

    try {
      await api.post('/api/logo-image/', 
        formData,       
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        //refresh page to update header
      window.location.reload();

    } catch (error: any) {
      console.log(error.response.data.error);
      setFileErrorMessage(
        error.response?.data?.error || 
        "Failed to upload your image. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
      getInstitutionName();
    }, []); 


  return (
    <div className="container mx-auto p-6">
        <div className="flex flex-col items-center space-y-6">
        <h1 className="text-3xl font-bold text-center">Institution Name</h1>

        <input
          type="text"
          maxLength={120}
          value={institutionName}
          onChange={(e) => setInstitutionName(e.target.value)}
          placeholder="Enter Institution Name"
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSaveInstitutionName}
          disabled={saving}
          className="px-6 bg-[var(--theme-color)] text-gray-600 font-semibold rounded-lg hover:bg-[var(--theme-color)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)]"
          style={{ color: 'var(--secondary-color)' }}
        >
          {saving ? "Saving..." : "Save"}
        </button>

        {savedMessage && (
          <p className="text-sm text-gray-600">{savedMessage}</p>
        )}

        <hr className="w-full border-t border-gray-300" />
        <h1 className="text-3xl font-bold text-center">Change Background Color</h1>
        <ColorPickerWithPopover
          label="Choose Background Color"
          apiEndpoint="/api/primary-color/"
          cssVariable="--theme-color"
          colorPresets={backgroundColorPresets}
        />
      <hr className="w-full border-t border-gray-300" />
      <h1 className="text-3xl font-bold text-center">Change Foreground Color</h1>
        <ColorPickerWithPopover
          label="Choose Foreground Color"
          apiEndpoint="/api/secondary-color/"
          cssVariable="--secondary-color"
          colorPresets={foregroundColorPresets}
        />
      <hr className="w-full border-t border-gray-300" />
      <h1 className="text-3xl font-bold text-center">Upload Institution Logo</h1>

      <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 text-sm text-gray-800 space-y-2">
      <h2 className="font-semibold text-base text-gray-900">Image Upload Guidelines</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>File Format:</strong> JPG, PNG, or SVG</li>
        <li><strong>Recommended Resolution:</strong> At least <span className="font-mono">800 x 200</span> pixels</li>
        <li><strong>Maximum File Size:</strong> 5MB</li>
        <li><strong>Recommended Orientation:</strong> Horizontal</li>
        <li><strong>Transparency:</strong> Use PNG or SVG for transparent backgrounds</li>
      </ul>
    </div>
        <FileUploader 
                  onFileSelected={handleFileUpload} 
                  accept="image/*"
                  isUploading={isUploading}
                  label="Choose Image File"
        />
        {fileErrorMessage && (
          <p className="text-sm text-gray-600">{fileErrorMessage}</p>
        )}
        </div>
    </div>
  );
};

export default GraphicsPage;

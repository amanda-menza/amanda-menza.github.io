"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "../api";
import logger from "./Logger";
import { ACCESS_TOKEN } from "../constants";

interface EssentialDocumentSubmissionProps {
  essentialDocDeadline: string;
  applicationId: number;
}

interface DocumentStatus {
  isUploaded: boolean;
  timestamp?: string;
  fileUrl?: string;
}

export default function EssentialDocumentSubmission({
  essentialDocDeadline,
  applicationId,
}: EssentialDocumentSubmissionProps) {
  const [uploadStatus, setUploadStatus] = useState<{
    [key: string]: DocumentStatus;
  }>({});
  const [isDownloading, setIsDownloading] = useState(false);

  const essentialDocuments = [
    "Assumption of Risk Form",
    "Acknowledgement of the Code of Conduct",
    "Housing Questionnaire",
    "Medical/Health History and Immunization Records",
  ];

  useEffect(() => {
    const fetchDocumentStatus = async () => {
      try {
        const response = await api.get(
          `/api/applications/${applicationId}/documents/`
        );
        const documentStatus = response.data.reduce((acc: any, doc: any) => {
          acc[doc.document_type] = {
            isUploaded: true,
            timestamp: doc.timestamp,
            fileUrl: doc.file_url,
          };
          return acc;
        }, {});
        setUploadStatus(documentStatus);
      } catch (error) {
        logger.error("Failed to fetch document status:", error);
      }
    };

    fetchDocumentStatus();
  }, [applicationId]);

  const calculateDaysUntilDeadline = () => {
    const deadline = new Date(essentialDocDeadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleFileUpload = async (documentType: string, file: File) => {
    // Validate file type
    if (!file.type.match("application/pdf")) {
      logger.error("Invalid file type. Only PDF files are allowed.");
      alert("Please upload only PDF files.");
      return;
    }

    // Validate file size (e.g., 10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      logger.error("File is too large");
      alert("File size must be less than 10MB");
      return;
    }

    const formData = new FormData();
    formData.append("document", file);
    formData.append("document_type", documentType);

    try {
      logger.info(`Uploading ${documentType} document: ${file.name}`);

      const response = await api.post(
        `/api/applications/${applicationId}/upload-document/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      logger.info(`Upload response for ${documentType}:`, response.data);

      setUploadStatus((prev) => ({
        ...prev,
        [documentType]: {
          isUploaded: true,
          timestamp: response.data.timestamp,
          fileUrl: response.data.file_url,
        },
      }));
    } catch (error: any) {
      logger.error(`Failed to upload ${documentType} document:`, error);

      // Extract and display more helpful error details
      let errorMessage = "Failed to upload document. Please try again.";
      if (error.response) {
        // The request was made and the server responded with an error status code
        logger.error("Error response data:", error.response.data);
        logger.error("Error response status:", error.response.status);

        if (error.response.data && error.response.data.error) {
          errorMessage = `Upload failed: ${error.response.data.error}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        logger.error("Error request:", error.request);
        errorMessage =
          "No response received from server. Check your connection.";
      }

      alert(errorMessage);
    }
  };

  const openDocument = async (fileUrl?: string) => {
    if (!fileUrl) {
      logger.error("File URL is missing");
      return;
    }

    logger.debug("Opening document with URL:", fileUrl);
    const loadingMessage = document.createElement("div");
    loadingMessage.style.position = "fixed";
    loadingMessage.style.top = "50%";
    loadingMessage.style.left = "50%";
    loadingMessage.style.transform = "translate(-50%, -50%)";
    loadingMessage.style.padding = "20px";
    loadingMessage.style.background = "white";
    loadingMessage.style.border = "1px solid #ccc";
    loadingMessage.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    loadingMessage.style.borderRadius = "4px";
    loadingMessage.style.zIndex = "9999";
    loadingMessage.textContent = "Loading document...";

    try {
      // Extract document type from fileUrl
      const urlParts = fileUrl.split("/");
      // The URL structure should be like "/media/essential_documents/123/document_type.pdf"
      const documentPath = urlParts.slice(urlParts.indexOf("essential_documents")).join("/");
      
      // Parse the document type from the filename
      let documentType = "";
      if (documentPath.includes("risk_form")) {
        documentType = "risk_form";
      } else if (documentPath.includes("code_of_conduct")) {
        documentType = "code_of_conduct";
      } else if (documentPath.includes("housing")) {
        documentType = "housing";
      } else if (documentPath.includes("medical_records")) {
        documentType = "medical_records";
      }
      
      if (!documentType) {
        throw new Error("Could not determine document type from URL");
      }
      
      // Get application ID from the path
      const appIdMatch = documentPath.match(/essential_documents\/(\d+)\//);
      const applicationId = appIdMatch ? appIdMatch[1] : "";
      
      if (!applicationId) {
        throw new Error("Could not determine application ID from URL");
      }
      
      // Construct the secure URL
      const baseURL =
        process.env.NODE_ENV === "development"
          ? "http://localhost:8000"
          : process.env.NEXT_PUBLIC_API_URL;
          
      const secureUrl = `${baseURL}/api/secure-document/${applicationId}/${documentType}/`;

      // Show loading indicator

      document.body.appendChild(loadingMessage);

      // Request the document through the secure endpoint using auth
      const response = await api.get(secureUrl, {
        responseType: "blob"
      });

      // Remove loading indicator
      document.body.removeChild(loadingMessage);

      // Create a blob URL from the response
      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      // Open the blob URL
      window.open(blobUrl, "_blank");

      // Clean up the blob URL after a timeout
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 5000);
    } catch (error) {
      logger.error("Error opening document:", error);
      alert("Error opening document. Please contact support if this persists.");
    } finally {
      // Remove loading indicator in both success and error cases
      if (document.body.contains(loadingMessage)) {
        document.body.removeChild(loadingMessage);
      }
    }
  };

  const downloadTemplate = async (documentType: string) => {
    setIsDownloading(true);
    try {
      // Fetch the template URL from the backend API
      const response = await api.get("/api/document-templates/");

      // Find the matching template by document type
      const template = response.data.find(
        (t: any) => t.document_type === documentType
      );

      if (!template || !template.file_url) {
        throw new Error("Template not found");
      }

      // Download the file from the URL provided by the API
      const fileResponse = await fetch(template.file_url);
      if (!fileResponse.ok) throw new Error("Failed to download template");

      const blob = await fileResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentType} Template.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      logger.error("Failed to download template:", error);
      alert("Failed to download template. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const daysUntilDeadline = calculateDaysUntilDeadline();
  const submittedCount = Object.values(uploadStatus).filter(Boolean).length;
  const allFormsSubmitted = submittedCount === essentialDocuments.length;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Essential Documents</CardTitle>
        <div
          className={`font-bold ${
            daysUntilDeadline <= 10 ? "text-red-600" : ""
          }`}
        >
          {daysUntilDeadline > 0
            ? `Deadline: ${new Date(
              essentialDocDeadline
            ).toLocaleDateString()} - ${daysUntilDeadline} days remaining`
            : `Past due by ${Math.abs(daysUntilDeadline)} days`}
        </div>
        <div className="text-sm text-muted-foreground">
          {allFormsSubmitted
            ? "All documents submitted"
            : `${submittedCount}/${essentialDocuments.length} documents submitted`}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {essentialDocuments.map((doc) => (
            <div key={doc} className="flex justify-between items-center">
              <div>
                <span
                  className="font-medium cursor-pointer hover:underline"
                  onClick={() => downloadTemplate(doc)}
                  title="Click to download template"
                >
                  {doc}
                </span>
                {uploadStatus[doc]?.timestamp && (
                  <div className="text-sm text-muted-foreground">
                    Uploaded:{" "}
                    {new Date(uploadStatus[doc].timestamp!).toLocaleString()}
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id={`file-${doc}`}
                  className="hidden"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(doc, file);
                    }
                  }}
                />
                {uploadStatus[doc]?.isUploaded ? (
                  <div className="space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => openDocument(uploadStatus[doc]?.fileUrl)}
                    >
                      View PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById(`file-${doc}`)?.click()
                      }
                    >
                      Replace
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="default"
                    onClick={() =>
                      document.getElementById(`file-${doc}`)?.click()
                    }
                  >
                    Upload PDF
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

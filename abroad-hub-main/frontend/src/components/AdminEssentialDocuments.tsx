"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "../api";
import logger from "./Logger";
import { UserRoles } from "@/types/models";

interface AdminEssentialDocumentsProps {
  essentialDocDeadline: string;
  applicationId: string;
  userRoles: UserRoles[];
}

interface DocumentStatus {
  isUploaded: boolean;
  timestamp?: string;
  fileUrl?: string;
}

export default function AdminEssentialDocuments({
  essentialDocDeadline,
  applicationId,
  userRoles,
}: AdminEssentialDocumentsProps) {
  const [uploadStatus, setUploadStatus] = useState<{
    [key: string]: DocumentStatus;
  }>({});
  const fullAccessRoles = [UserRoles.Administrator, UserRoles.Faculty];

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

  const openDocument = async (fileUrl?: string) => {
    if (!fileUrl) {
      logger.error("File URL is missing");
      return;
    }

    logger.debug("Admin opening document with URL:", fileUrl);

    // Show loading indicator
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

  const daysUntilDeadline = () => {
    const deadline = new Date(essentialDocDeadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const submittedCount = Object.values(uploadStatus).filter(Boolean).length;
  const allFormsSubmitted = submittedCount === essentialDocuments.length;
  const daysRemaining = daysUntilDeadline();

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Essential Documents</CardTitle>
        <div
          className={`font-bold ${daysRemaining <= 10 ? "text-red-600" : ""}`}
        >
          {daysRemaining > 0
            ? `Deadline: ${new Date(
              essentialDocDeadline
            ).toLocaleDateString()} - ${daysRemaining} days remaining`
            : `Past due by ${Math.abs(daysRemaining)} days`}
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
                <span className="font-medium">{doc}</span>
                {uploadStatus[doc]?.timestamp && (
                  <div className="text-sm text-muted-foreground">
                    Uploaded:{" "}
                    {new Date(uploadStatus[doc].timestamp!).toLocaleString()}
                  </div>
                )}
              </div>
              <div>
                {fullAccessRoles.some((role) => userRoles.includes(role)) &&
                uploadStatus[doc]?.isUploaded ? (
                    <Button
                      variant="secondary"
                      onClick={() => openDocument(uploadStatus[doc]?.fileUrl)}
                    >
                    View PDF
                    </Button>
                  ) : userRoles.includes(UserRoles.Reviewer) &&
                  uploadStatus[doc]?.isUploaded ? (
                      <span className="text-green-600">Submitted</span>
                    ) : (
                      <span className="text-gray-500">Not submitted</span>
                    )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

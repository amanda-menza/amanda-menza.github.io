"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { FileUploader } from "@/components/FileUploader";
import { Loader2 } from "lucide-react";

// Since this page is public, we'll use axios directly instead of the authenticated api client
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RecommendationContext {
  student_name: string;
  program_title: string;
  university: string;
  already_submitted: boolean;
  writer_name: string;
}

export default function RecommendationLetterPage() {
  const params = useParams();
  const id = params?.id as string;
  const token = params?.token as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [context, setContext] = useState<RecommendationContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchRecommendationContext = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${baseURL}/api/recommendation-letters/token/${token}/`
        );  
        setContext(response.data);
        if (response.data.already_submitted) {
          setSuccess(true);
        }
      } catch (error: any) {
        console.error("Error fetching recommendation letter context:", error);
        setError(
          error.response?.data?.error || 
          "This recommendation letter request is no longer active."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendationContext();
  }, [token]);

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.match("application/pdf")) {
      setError("Invalid file type. Only PDF files are allowed.");
      return;
    }

    // Validate file size (e.g., 10MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      setError("File size must be less than 50MB");
      return;
    }

    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("letter_file", file);

    try {
      await axios.post(
        `${baseURL}/api/recommendation-letters/token/${token}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccess(true);
    } catch (error: any) {
      console.error("Error uploading recommendation letter:", error);
      setError(
        error.response?.data?.error || 
        "Failed to upload your letter. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Request Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-green-600">Thank You!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">
              Your recommendation letter for {context?.student_name} has been successfully submitted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Letter of Recommendation</CardTitle>
          <CardDescription>
            {context?.university} Study Abroad Program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Hello <strong>{context?.writer_name}</strong>,
            </p>
            <p>
              You have been asked to provide a letter of recommendation for{" "}
              <strong>{context?.student_name}</strong> for their application to the{" "}
              <strong>{context?.program_title}</strong> program.
            </p>
            <p>
              Please upload your letter of recommendation as a PDF file using the button below.
            </p>
            <div className="mt-4">
              <FileUploader 
                onFileSelected={handleFileUpload} 
                accept=".pdf"
                isUploading={isUploading}
                label="Choose PDF File"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-muted-foreground text-center">
            This link is unique to you and does not require a login. Please do not share this link with others.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 
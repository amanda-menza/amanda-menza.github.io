"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RecommendationLetter, RecommendationLetterStatus } from "@/types/models";
import { Check, X, Download, FileQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import api from "@/api";
import logger from "@/components/Logger";

interface AdminRecommendationLettersProps {
  letters: RecommendationLetter[];
}

export function AdminRecommendationLetters({ letters }: AdminRecommendationLettersProps) {
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({});
  
  const openRecommendationLetter = async (letter: RecommendationLetter) => {
    if (!letter.id) {
      logger.error("Letter ID is missing");
      return;
    }
    
    setIsLoading({...isLoading, [letter.id]: true});
    
    try {
      // Construct the secure URL
      const baseURL = 
        process.env.NODE_ENV === "development"
          ? "http://localhost:8000"
          : process.env.NEXT_PUBLIC_API_URL;
          
      const secureUrl = `${baseURL}/api/secure-recommendation-letter/${letter.id}/`;
      
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
      loadingMessage.textContent = "Loading recommendation letter...";
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
      logger.error("Error opening recommendation letter:", error);
      alert("Error opening recommendation letter. Please contact support if this persists.");
    } finally {
      setIsLoading({...isLoading, [letter.id]: false});
    }
  };

  if (!letters || letters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendation Letters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center py-4">
            No recommendation letters have been requested for this application.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendation Letters ({letters.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Writer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested Date</TableHead>
              <TableHead>Submitted Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {letters.map((letter) => (
              <TableRow key={letter.id}>
                <TableCell className="font-medium">{letter.writer_name}</TableCell>
                <TableCell>{letter.writer_email}</TableCell>
                <TableCell>
                  {letter.status === RecommendationLetterStatus.Fulfilled ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      Submitted
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{new Date(letter.requested_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {letter.fulfilled_date ? (
                    new Date(letter.fulfilled_date).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {letter.status === RecommendationLetterStatus.Fulfilled ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openRecommendationLetter(letter)}
                            disabled={isLoading[letter.id]}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download Recommendation Letter</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-block">
                            <FileQuestion className="h-4 w-4 text-muted-foreground" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>No actions available - letter is still pending submission</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 
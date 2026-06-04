"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RecommendationLetter, RecommendationLetterStatus } from "@/types/models";
import api from "../api";
import logger from "./Logger";
import { PlusCircle, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";

interface RecommendationLettersProps {
  applicationId: number;
}

interface RequestFormData {
  writer_name: string;
  writer_email: string;
}

export default function RecommendationLetters({
  applicationId,
}: RecommendationLettersProps) {
  const [letters, setLetters] = useState<RecommendationLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState<RecommendationLetter | null>(null);
  const { toast } = useToast();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestFormData>();

  useEffect(() => {
    fetchRecommendationLetters();
  }, [applicationId]);

  const fetchRecommendationLetters = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/applications/${applicationId}/recommendation-letters/`);
      // Filter letters for the current application
      const applicationLetters = response.data.filter(
        (letter: RecommendationLetter) => letter.application_id === applicationId
      );
      setLetters(applicationLetters);
    } catch (error) {
      logger.error("Failed to fetch recommendation letters:", error);
      toast({
        title: "Error",
        description: "Failed to load recommendation letters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createRecommendationRequest = async (data: RequestFormData) => {
    try {
      const requestData = {
        application_id: applicationId,
        writer_name: data.writer_name,
        writer_email: data.writer_email,
      };

      const response = await api.post(`/api/applications/${applicationId}/recommendation-letters/`, requestData);
      
      // Add the new letter to the list
      setLetters((prevLetters) => [...prevLetters, response.data]);
      
      // Reset the form
      reset();
      
      toast({
        title: "Success",
        description: "Recommendation letter request sent successfully.",
      });
      
      // Automatically close the dialog
      closeButtonRef.current?.click();
    } catch (error) {
      logger.error("Failed to create recommendation request:", error);
      toast({
        title: "Error",
        description: "Failed to send recommendation request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (letter: RecommendationLetter) => {
    setLetterToDelete(letter);
    setDeleteDialogOpen(true);
  };

  const deleteRecommendationRequest = async () => {
    if (!letterToDelete) return;
    
    try {
      await api.delete(`/api/recommendation-letters/${letterToDelete.id}/`);
      
      // Remove the deleted letter from the list
      setLetters((prevLetters) => 
        prevLetters.filter((letter) => letter.id !== letterToDelete.id)
      );
      
      toast({
        title: "Success",
        description: "Recommendation letter request deleted successfully.",
      });
    } catch (error) {
      logger.error("Failed to delete recommendation request:", error);
      toast({
        title: "Error",
        description: "Failed to delete recommendation request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setLetterToDelete(null);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Letters of Recommendation</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Request letters of recommendation from faculty or mentors
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request a Letter of Recommendation</DialogTitle>
              <DialogDescription>
                Enter the recommender's information below. They will receive an email
                with instructions to submit their letter.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(createRecommendationRequest)}>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="writer_name">Recommender Name</Label>
                  <Input
                    id="writer_name"
                    placeholder="e.g. Professor Smith"
                    {...register("writer_name", {
                      required: "Recommender name is required",
                    })}
                  />
                  {errors.writer_name && (
                    <p className="text-red-600 text-sm">{errors.writer_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="writer_email">Recommender Email</Label>
                  <Input
                    id="writer_email"
                    type="email"
                    placeholder="e.g. professor.smith@university.edu"
                    {...register("writer_email", {
                      required: "Email address is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.writer_email && (
                    <p className="text-red-600 text-sm">{errors.writer_email.message}</p>
                  )}
                </div>
              </div>
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button ref={closeButtonRef} variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit">Send Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center text-muted-foreground">
            Loading recommendation letters...
          </div>
        ) : letters.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            No recommendation letter requests found. Add a request to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {letters.map((letter) => (
              <div
                key={letter.id}
                className="flex justify-between items-center border-b pb-4"
              >
                <div>
                  <div className="font-medium">{letter.writer_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {letter.writer_email}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Requested on: {new Date(letter.requested_date).toLocaleDateString()}
                  </div>
                  {letter.status === RecommendationLetterStatus.Fulfilled && letter.fulfilled_date && (
                    <div className="text-sm text-muted-foreground">
                      Submitted on: {new Date(letter.fulfilled_date).toLocaleDateString()}
                    </div>
                  )}
                  <div className="mt-1">
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${
                        letter.status === RecommendationLetterStatus.Fulfilled
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {letter.status === RecommendationLetterStatus.Fulfilled
                        ? "Submitted"
                        : "Pending"}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => confirmDelete(letter)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recommendation Letter Request</DialogTitle>
            <DialogDescription>
              {letterToDelete?.status === RecommendationLetterStatus.Fulfilled
                ? "This will permanently delete the recommendation letter. This action cannot be undone."
                : "The recommender has been contacted but will not be able to submit a letter if you delete this request. A follow-up email will be sent to inform them."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteRecommendationRequest}
            >
              Delete Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 
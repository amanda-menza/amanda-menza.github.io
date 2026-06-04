"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ApplicationStatus } from "@/types/models";
import api from "../api";

import logger from "../components/Logger";

const FormSchema = z.object({
  status: z.enum(["Applied", "Eligible", "Approved", "Enrolled", "Canceled"], {
    required_error: "Please select a status.",
  }),
});

export function StatusChangeForm({
  fetchApplication,
  applicationId,
}: {
  fetchApplication: () => Promise<void>;
  applicationId: string;
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const [isFormOpen, setFormOpen] = useState(false);

  const changeStatus = async (status: string) => {
    try {
      await api.patch(`/api/applications/${applicationId}/change_status/`, {
        status,
      });
      fetchApplication(); // Refresh application details
    } catch (error) {
      logger.error("Failed to change status:", error);
    }
  };

  function onSubmit(data: z.infer<typeof FormSchema>) {
    logger.info("Status changed to:", data.status);
    setFormOpen(false); // Close the form after submission
    changeStatus(data.status);
  }

  return (
    <div>
      {/* Button to open the form */}
      {!isFormOpen && (
        <Button onClick={() => setFormOpen(true)}>Change Status</Button>
      )}

      {/* Conditionally render the form when isFormOpen is true */}
      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-96">
            <strong>Change Application Status</strong>
            <p>
              Select the new status for the application below and save your
              changes.
            </p>

            {/* Form */}
            <Form {...form}>
              <form
                role="form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6"
              >
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Applied">Applied</SelectItem>
                          <SelectItem value="Eligible">Eligible</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Enrolled">Enrolled</SelectItem>
                          <SelectItem value="Canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the current status for the application.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" onClick={() => setFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}

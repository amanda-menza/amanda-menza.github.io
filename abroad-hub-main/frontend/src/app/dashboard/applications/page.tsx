"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "../../../api.js";
import { Application, ApplicationStatus } from "../../../types/models";
import logger from "../../../components/Logger";

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  /**
   * Fetches application data from the server.
   */
  async function getApplicationList() {
    try {
      const res = await api.get("/api/applications/");
      return res.data;
    } catch (error) {
      throw new Error("Failed to fetch data: " + error);
    }
  }

  /**
   * fetch on program mount
   */
  useEffect(() => {
    const fetchData = async () => {
      const data: Application[] = await getApplicationList();
      setApplications(data);
    };
    fetchData().catch(logger.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Applications</h1>
      <div className="space-y-4">
        {applications.length > 0 ? (
          applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {application.program.title}
                </CardTitle>
                <CardDescription>
                  Submitted on {application.submission_date.split("T")[0]}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <Badge
                  variant={
                    application.status === ApplicationStatus.Enrolled
                      ? "secondary"
                      : application.status === ApplicationStatus.Withdrawn
                      ? "destructive"
                      : "default"
                  }
                >
                  {application.status}
                </Badge>
                <Button asChild>
                  <Link href={`/dashboard/applications/${application.id}`}>
                    View Application
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No Applications Yet</p>
        )}
      </div>
    </div>
  );
}

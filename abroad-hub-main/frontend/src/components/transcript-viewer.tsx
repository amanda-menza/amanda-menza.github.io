"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  RefreshCw,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import api from "@/api";
import logger from "@/components/Logger";
import { storeUserData } from "@/lib/utils";
import { Loader } from "lucide-react";

// Types for our transcript data
interface UlinkCourse {
  department: string;
  number: number;
  title: string;
  grade: string;
  term: string;
  year: number;
}

interface Course {
  code: string;
  title: string;
  grade: string;
}

interface Term {
  id: string;
  name: string;
  year: number;
  courses: Course[];
}

interface StudentInfo {
  name: string;
  major: string;
  ulink_username: string;
}

interface TranscriptViewerProps {
  ulink_username?: string | null;
  onRequestReload?: () => void;
}

export default function TranscriptViewer({
  ulink_username,
  onRequestReload,
}: TranscriptViewerProps) {
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [ulinkCourses, setUlinkCourses] = useState<UlinkCourse[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTerms, setExpandedTerms] = useState<Record<string, boolean>>(
    {}
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [gpa, setGpa] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncingGpa, setIsSyncingGpa] = useState(false);
  const [gpaSyncSuccess, setGpaSyncSuccess] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [usingCachedData, setUsingCachedData] = useState(false);

  // Fetch transcript data when component mounts
  useEffect(() => {
    if (ulink_username) {
      fetchTranscript();
      fetchStudentInfo();
    }
  }, [ulink_username]);

  // Transform data when ulinkCourses changes
  useEffect(() => {
    if (ulinkCourses.length > 0) {
      const transformedTerms = transformData();
      setTerms(transformedTerms);
    }
  }, [ulinkCourses]);

  // Initialize expanded state when terms change
  useEffect(() => {
    if (terms.length > 0) {
      setExpandedTerms(
        Object.fromEntries(terms.map((term) => [term.id, true]))
      );
    }
  }, [terms]);

  // Add useEffect to calculate GPA when courses change
  useEffect(() => {
    if (ulinkCourses.length > 0) {
      calculateGPA();
    }
  }, [ulinkCourses]);

  const fetchTranscript = async () => {
    setLoading(true);
    setError(null);
    setValidationErrors([]);
    
    try {
      const response = await api.get("/api/user-transcript/");
      if (response.data) {
        // Set transcript data
        if (response.data.transcript) {
          setUlinkCourses(response.data.transcript);
        }
        
        // Set validation errors if any - check both field names for backward compatibility
        const errors = [...(response.data.validation_errors || []), ...(response.data.parsing_errors || [])];
        if (errors.length > 0) {
          setValidationErrors(errors);
        }

        // Check if we're using cached data
        if (response.data.using_cached_data) {
          setUsingCachedData(true);
        }
        
        // Set last refreshed timestamp if available
        if (response.data.last_refreshed) {
          const refreshDate = new Date(response.data.last_refreshed);
          setLastRefreshed(refreshDate.toLocaleString());
        }
      }
    } catch (error) {
      logger.error("Error fetching transcript data:", error);
      setError("Could not load transcript data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch student information
  const fetchStudentInfo = async () => {
    if (!ulink_username) return;

    try {
      const response = await api.get("/api/current-user/");
      if (response.data) {
        setStudentInfo({
          name: response.data.display_name || "N/A",
          major: response.data.profile?.major || "N/A",
          ulink_username: ulink_username,
        });
      }
    } catch (error) {
      logger.error("Error fetching student info:", error);
    }
  };

  // Transform ULINK data into the format needed for this component
  const transformData = () => {
    const termMap = new Map<string, Term>();

    // Group courses by term
    ulinkCourses.forEach((course) => {
      const termId = `${course.term}${course.year}`;
      const termName = course.term;
      const termYear = course.year;

      if (!termMap.has(termId)) {
        termMap.set(termId, {
          id: termId,
          name: termName,
          year: termYear,
          courses: [],
        });
      }

      // Add course to the term
      termMap.get(termId)?.courses.push({
        code: `${course.department} ${course.number}`,
        title: course.title,
        grade: course.grade,
      });
    });

    // Convert map to array and sort by year (newest first)
    return Array.from(termMap.values()).sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year; // Newest year first
      }

      // For same year, sort by term (Spring, Summer, Fall)
      const termOrder = { Spring: 0, Summer: 1, Fall: 2 };
      return (
        termOrder[a.name as keyof typeof termOrder] -
        termOrder[b.name as keyof typeof termOrder]
      );
    });
  };

  const toggleTerm = (termId: string) => {
    setExpandedTerms((prev) => ({
      ...prev,
      [termId]: !prev[termId],
    }));
  };

  // Function to get grade color based on the grade
  const getGradeColor = (grade: string) => {
    if (["B+", "B", "B-"].includes(grade)) return "bg-blue-500 text-white";
    if (["A+", "A", "A-"].includes(grade)) return "bg-green-500 text-white";
    if (["C+", "C", "C-"].includes(grade)) return "bg-yellow-500 text-white";
    if (["D+", "D", "D-"].includes(grade)) return "bg-orange-500 text-white";
    if (grade === "F") return "bg-red-500 text-white";
    if (grade === "IP") return "bg-purple-500 text-white"; // In Progress
    if (grade === "W") return "bg-gray-500 text-white"; // Withdrawn
    return "bg-gray-200 text-gray-800"; // Default
  };

  const handleDownloadPdf = async () => {
    if (!transcriptRef.current) return;

    try {
      setIsGeneratingPdf(true);

      // Expand all terms before generating PDF
      const previousState = { ...expandedTerms };
      const allExpanded = Object.fromEntries(
        terms.map((term) => [term.id, true])
      );
      setExpandedTerms(allExpanded);

      // Wait for state update to be applied
      await new Promise((resolve) => setTimeout(resolve, 100));

      const element = transcriptRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      // Create PDF in A4 format
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10; // Top margin

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );
      pdf.save("academic_transcript.pdf");

      // Restore previous state
      setExpandedTerms(previousState);
    } catch (error) {
      logger.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Function to calculate GPA
  const calculateGPA = () => {
    // Grade to points mapping
    const gradePoints: Record<string, number> = {
      "A+": 4.0,
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C-": 1.7,
      "D+": 1.3,
      D: 1.0,
      "D-": 0.7,
      F: 0.0,
    };

    // Filter out courses that don't have a grade yet (IP) or were withdrawn (W)
    const completedCourses = ulinkCourses.filter(
      (course) => course.grade !== "IP" && course.grade !== "W"
    );

    if (completedCourses.length === 0) {
      setGpa(null);
      return;
    }

    // Sum up grade points
    const totalPoints = completedCourses.reduce((sum, course) => {
      const points = gradePoints[course.grade] || 0;
      return sum + points;
    }, 0);

    // Calculate GPA (total points divided by number of courses)
    const calculatedGPA = totalPoints / completedCourses.length;
    setGpa(calculatedGPA);
  };

  // Function to update the user's profile GPA with the calculated GPA
  const syncGpaToProfile = async () => {
    if (gpa === null) return;

    setIsSyncingGpa(true);
    setGpaSyncSuccess(false);

    try {
      // Format GPA to 2 decimal places
      const formattedGpa = Math.round(gpa * 100) / 100;

      // Update the user's profile with the calculated GPA
      const response = await api.patch("/api/user/profile/", {
        gpa: formattedGpa,
      });

      if (response.status === 200) {
        setGpaSyncSuccess(true);

        // Update locally stored user data
        const current_user = await api.get("/api/current-user/");
        if (current_user.data) {
          logger.debug("current users set");
          storeUserData(current_user.data);
          
          // Trigger a page reload to refresh the profile section
          window.location.reload();
        }
        if (onRequestReload) {
          onRequestReload(); // call the parent's reload
        }

        // Show success message briefly, then reset
        setTimeout(() => {
          setGpaSyncSuccess(false);
        }, 3000);
      }
    } catch (error) {
      logger.error("Error updating profile GPA:", error);
    } finally {
      setIsSyncingGpa(false);
    }
  };

  // Add a function to fetch fresh data from ULINK
  const handleRefreshTranscript = async () => {
    if (!ulink_username || isRefreshing) return;

    setIsRefreshing(true);
    setValidationErrors([]);
    setUsingCachedData(false);
    
    try {
      // Use the force_refresh parameter to get fresh data from ULINK
      const response = await api.get("/api/user-transcript/?force_refresh=true");
      if (response.data) {
        // Set transcript data
        if (response.data.transcript) {
          setUlinkCourses(response.data.transcript);
        }
        
        // Set validation errors if any - check both field names for backward compatibility
        const errors = [...(response.data.validation_errors || []), ...(response.data.parsing_errors || [])];
        if (errors.length > 0) {
          setValidationErrors(errors);
        }

        // Check if we're using cached data
        if (response.data.using_cached_data) {
          setUsingCachedData(true);
        }
        
        // Update last refreshed timestamp
        if (response.data.last_refreshed) {
          const refreshDate = new Date(response.data.last_refreshed);
          setLastRefreshed(refreshDate.toLocaleString());
        } else {
          setLastRefreshed(new Date().toLocaleString());
        }
      }
    } catch (error) {
      logger.error("Error refreshing transcript data:", error);
      setError("Could not refresh transcript data from ULINK");
    } finally {
      setIsRefreshing(false);
    }
  };

  // If no ULINK account is connected
  if (!ulink_username) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Academic Transcript</CardTitle>
          <CardDescription>
            Connect your ULINK account to view your academic transcript
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Academic Transcript</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <LoadingSpinner message="Loading transcript data" />
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Academic Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 py-2">{error}</div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state
  if (ulinkCourses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Academic Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 py-2">
            No courses found in your transcript.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Academic Transcript</CardTitle>
              <CardDescription>
                Official student academic record
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                {lastRefreshed && (
                  <span className="text-xs text-gray-500 mr-2">
                    Last updated: {lastRefreshed}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={handleRefreshTranscript}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">
                    {isRefreshing ? "Updating..." : "Update"}
                  </span>
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isGeneratingPdf ? "Generating..." : "Download PDF"}
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div ref={transcriptRef}>
            {/* Validation Errors Section */}
            {validationErrors.length > 0 && (
              <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md">
                <h3 className="font-medium text-red-700 mb-2">Transcript Data Warnings</h3>
                <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Student Information Section */}
            {studentInfo && (
              <div className="mb-6 p-4 border-b">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">
                      Student Information
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="font-medium">Name:</div>
                      <div>{studentInfo.name}</div>
                      <div className="font-medium">Major:</div>
                      <div>{studentInfo.major}</div>
                      <div className="font-medium">ULINK ID:</div>
                      <div>{studentInfo.ulink_username}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">
                      Academic Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="font-medium">GPA:</div>
                      <div className="flex items-center gap-2">
                        <p>{gpa !== null ? gpa.toFixed(2) : "N/A"}</p>
                        {gpa !== null && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={syncGpaToProfile}
                            disabled={isSyncingGpa}
                            className="h-7 px-2"
                          >
                            {isSyncingGpa ? (
                              <div className="flex items-center">
                                <Loader className="animate-spin h-3.5 w-3.5" />
                              </div>
                            ) : gpaSyncSuccess ? (
                              "✓ Updated"
                            ) : (
                              <>
                                <Save className="h-3.5 w-3.5 mr-1" />
                                Use in Profile
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      <div className="font-medium">Total Courses:</div>
                      <div>{ulinkCourses.length}</div>
                      <div className="font-medium">Terms Completed:</div>
                      <div>{terms.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Tabs defaultValue="byTerm" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="byTerm">By Term</TabsTrigger>
                <TabsTrigger value="allCourses">All Courses</TabsTrigger>
              </TabsList>

              <TabsContent value="byTerm" className="space-y-6">
                {terms.map((term) => (
                  <Card key={term.id} className="overflow-hidden">
                    <CardHeader
                      className="py-3 px-4 bg-slate-50 border-b cursor-pointer"
                      onClick={() => toggleTerm(term.id)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {term.name} {term.year}
                        </CardTitle>
                        <div className="flex items-center gap-4">
                          {expandedTerms[term.id] ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {expandedTerms[term.id] && (
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-1/4" align="left">
                                Course
                              </TableHead>
                              <TableHead className="w-2/4" align="left">
                                Title
                              </TableHead>
                              <TableHead className="w-1/4" align="left">
                                Grade
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {term.courses.map((course, i) => (
                              <TableRow key={i}>
                                <TableCell className="font-medium">
                                  {course.code}
                                </TableCell>
                                <TableCell>{course.title}</TableCell>
                                <TableCell>{course.grade}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="allCourses">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/4" align="left">
                            Course
                          </TableHead>
                          <TableHead className="w-2/4" align="left">
                            Title
                          </TableHead>
                          <TableHead className="w-1/8" align="left">
                            Term
                          </TableHead>
                          <TableHead className="w-1/8" align="left">
                            Grade
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ulinkCourses.map((course, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">
                              {course.department} {course.number}
                            </TableCell>
                            <TableCell>{course.title}</TableCell>
                            <TableCell>
                              {course.term} {course.year}
                            </TableCell>
                            <TableCell>{course.grade}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

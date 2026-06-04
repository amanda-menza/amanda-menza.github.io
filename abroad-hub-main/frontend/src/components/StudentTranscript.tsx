import React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import api from "@/api";
import logger from "@/components/Logger";

interface CourseRecord {
  department: string;
  number: number;
  title: string;
  grade: string;
  term: string;
  year: number;
}

interface TranscriptProps {
  ulink_username: string | null | undefined;
}

const StudentTranscript: React.FC<TranscriptProps> = ({ ulink_username }) => {
  const [transcript, setTranscript] = useState<CourseRecord[]>([]);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Group courses by term for the tabbed view
  const coursesByTerm = transcript.reduce<Record<string, CourseRecord[]>>((acc, course) => {
    const termKey = `${course.term} ${course.year}`;
    if (!acc[termKey]) {
      acc[termKey] = [];
    }
    acc[termKey].push(course);
    return acc;
  }, {});

  // Get unique terms for tabs
  const terms = Object.keys(coursesByTerm).sort((a, b) => {
    // Sort by year descending, then by term (Spring, Summer, Fall)
    const [aTerm, aYear] = a.split(' ');
    const [bTerm, bYear] = b.split(' ');
    
    if (aYear !== bYear) {
      return parseInt(bYear) - parseInt(aYear); // Most recent years first
    }
    
    // Custom term order
    const termOrder = { 'Spring': 0, 'Summer': 1, 'Fall': 2 };
    return termOrder[aTerm as keyof typeof termOrder] - termOrder[bTerm as keyof typeof termOrder];
  });

  useEffect(() => {
    if (ulink_username) {
      fetchTranscript();
    }
  }, [ulink_username]);

  const fetchTranscript = async () => {
    setIsLoadingTranscript(true);
    setTranscriptError(null);
    
    try {
      const response = await api.get("/api/user-transcript/");
      if (response.data && response.data.transcript) {
        setTranscript(response.data.transcript);
      }
    } catch (error) {
      logger.error("Error fetching transcript data:", error);
      setTranscriptError("Could not load transcript data");
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  // Function to get grade color based on the grade
  const getGradeColor = (grade: string) => {
    if (['A+', 'A', 'A-'].includes(grade)) return "bg-green-500 text-white";
    if (['B+', 'B', 'B-'].includes(grade)) return "bg-blue-500 text-white";
    if (['C+', 'C', 'C-'].includes(grade)) return "bg-yellow-500 text-white";
    if (['D+', 'D', 'D-'].includes(grade)) return "bg-orange-500 text-white";
    if (grade === 'F') return "bg-red-500 text-white";
    if (grade === 'IP') return "bg-purple-500 text-white"; // In Progress
    if (grade === 'W') return "bg-gray-500 text-white"; // Withdrawn
    return "bg-gray-200 text-gray-800"; // Default
  };

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

  if (isLoadingTranscript) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Academic Transcript</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <LoadingSpinner message="Loading transcript" />
        </CardContent>
      </Card>
    );
  }

  if (transcriptError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Academic Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 py-2">{transcriptError}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Academic Transcript</CardTitle>
        <CardDescription>View your academic history and course grades</CardDescription>
      </CardHeader>
      <CardContent>
        {transcript.length === 0 ? (
          <div className="text-gray-500 py-2">No courses found in your transcript.</div>
        ) : (
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 flex-wrap">
              <TabsTrigger value="all">All Courses</TabsTrigger>
              {terms.map(term => (
                <TabsTrigger key={term} value={term}>{term}</TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transcript.map((course, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{course.department} {course.number}</TableCell>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>{course.term} {course.year}</TableCell>
                      <TableCell>
                        <Badge className={getGradeColor(course.grade)}>
                          {course.grade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            {terms.map(term => (
              <TabsContent key={term} value={term}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coursesByTerm[term].map((course, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{course.department} {course.number}</TableCell>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(course.grade)}>
                            {course.grade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentTranscript; 
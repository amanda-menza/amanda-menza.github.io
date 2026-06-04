"use client";
import { StudentProgramTable } from "../../../components/StudentProgramTable";
import { useState, useEffect } from "react";
import { StudentTableData } from "../../../types/models";
import api from "../../../api";
import logger from "../../../components/Logger";

export default function StudentProgramList() {
  const [programs, setPrograms] = useState<StudentTableData[]>([]);

  const fetchProgramsWithCounts = async () => {
    try {
      const response = await api.get("/api/myprograms/"); // Replace with your actual API endpoint
      const data = response.data;
      setPrograms(data); // Assuming data is an array of programs
    } catch (error) {
      logger.error("Error fetching programs:", error);
    } finally {
    }
  };

  // Fetch programs from API
  useEffect(() => {
    fetchProgramsWithCounts();
  }, []); // Empty dependency array ensures the effect runs once when the component mounts

  return (
    <div className="overflow-x-auto">
      <h1 className="text-3xl font-bold">My Programs</h1>
      <StudentProgramTable data={programs} />
    </div>
  );
}

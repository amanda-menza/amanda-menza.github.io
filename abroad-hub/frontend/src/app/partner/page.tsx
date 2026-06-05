"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { fetchCurrentUser, isStudent } from "@/lib/utils";
import { AppUser } from "@/types/models";
import { useState, useEffect } from "react";
import React from "react";
import { Tiptap } from "../../components/Tiptap";
import { HomePageText } from "@/components/HomePageText";
import axios from "axios";
import api from "../../api";
import logger from "../../components/Logger";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Dashboard() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [is_student, setIsStudent] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(
    "Discover amazing study abroad opportunities and expand your horizons. Join our community of global learners today!"
  );
  const router = useRouter();

  const fetchContent = async () => {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/content/"
      );
      if (response.status === 200) {
        setContent(response.data.content);
      }
    } catch (error) {
      logger.error("Error fetching content:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        fetchContent();
        const newUser = await fetchCurrentUser();
        setUser(newUser);
        if (newUser) {
          setIsStudent(await isStudent());
        }
      } catch (error) {
        logger.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !user) {
    return <LoadingSpinner message={"Loading"} />;
  }

  return (
    <div className="text-center">
      <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
        Welcome to Abroadhub Partner Portal
      </h1>

      <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8"></div>
      <HomePageText is_student={true} user={user} button={<Button></Button>} />
    </div>
  );
}

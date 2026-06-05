"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Footer } from "@/components/footer";
import {
  fetchCurrentUser,
  isAdminType,
  isPartner,
  isStudent,
} from "@/lib/utils";
import { AppUser } from "@/types/models";
import { useState, useEffect } from "react";
import React from "react";
import { Tiptap } from "../components/Tiptap";
import { HomePageText } from "@/components/HomePageText";
import axios from "axios";
import api from "../api";
import logger from "../components/Logger";
import { Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Home() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [is_student, setIsStudent] = useState<boolean | null>(null);
  const [is_admin, setIsAdmin] = useState<boolean | null>(null);
  const [is_partner, setIsPartner] = useState<boolean | null>(null);

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(
    "Discover amazing study abroad opportunities and expand your horizons. Join our community of global learners today!"
  );
  const [isEditing, setIsEditing] = useState(false);
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

  const updateContent = async () => {
    try {
      await api.put(process.env.NEXT_PUBLIC_API_URL + "/api/content/", {
        content,
      });
      logger.info("Content updated successfully");
    } catch (error) {
      logger.error("Error updating content:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        fetchContent();
        const newUser = await fetchCurrentUser();
        logger.debug("user response: ", newUser);
        setUser(newUser);
        if (newUser) {
          setIsStudent(await isStudent());
          setIsAdmin(isAdminType());
          setIsPartner(isPartner());
        }
      } catch (error) {
        logger.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message={"Loading"} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-x-hidden">
      <Header
        user={user}
        is_student={is_student}
        is_admin_role={is_admin}
        is_partner={is_partner}
      />
      <div className="flex-1 flex overflow-hidden">
        <div className="relative transition-all duration-300 ease-in-out bg-gray-200 shadow-sm h-full"></div>
        <main className="flex-1 p-6 max-w-full w-full overflow-auto">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Welcome to Abroadhub
            </h1>
            {user && !is_student ? (
              <div className="relative">
                <Tiptap
                  editorContent={content}
                  onChange={setContent}
                  isEditing={isEditing}
                />
              </div>
            ) : null}
            <div
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8"></div>
            <HomePageText
              is_student={is_student}
              user={user}
              button={
                <Button
                  variant="outline"
                  onClick={() => {
                    if (isEditing) updateContent();
                    setIsEditing(!isEditing);
                  }}
                  className="p-1 "
                  title={isEditing ? "Close Editor" : "Edit Content"}
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4" /> Close Editor
                    </>
                  ) : (
                    <>
                      <Pencil className="w-4 h-4" /> Edit Home Page Content
                    </>
                  )}
                </Button>
              }
            />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

import React, { JSX, useEffect, useState } from "react";
import Link from "next/link";
import { AppUser, UserRoles } from "@/types/models";
import api from "../api";

interface HomePageTextProps {
  is_student: boolean | null;
  user: AppUser | null;
  button: JSX.Element;
}
export const HomePageText: React.FC<HomePageTextProps> = ({
  is_student,
  user,
  button,
}) => {
  const [institutionName, setInstitutionName] = useState("Your Institution");

  const rolesToCheck = [
    UserRoles.Administrator,
    UserRoles.Faculty,
    UserRoles.Reviewer,
  ];

  useEffect(() => {
    const fetchInstitutionName = async () => {
      try {
        const response = await api.get("/api/institution-name/");
        setInstitutionName(response.data.name || "Your Institution");
      } catch (error) {
        console.error("Error fetching institution name:", error);
      }
    };

    fetchInstitutionName();
  }, []);

  return (
    <div className="p-8 space-y-8">
      {is_student == false &&
      rolesToCheck.some((role) => user?.roles.includes(role)) ? (
        <section className="bg-gray-200 p-6 rounded-lg shadow-lg w-3/4 mx-auto">
          {user?.roles.includes(UserRoles.Administrator) && <div>{button}</div>}
          <p className="text-lg text-gray-700 mb-4 text-left">
            Abroadhub is here to revolutionize the way{" "}
            <strong>{institutionName}</strong> manages its faculty-led
            study abroad programs. Whether you’re creating new programs,
            overseeing applications, or tracking data trends, this platform is
            built to save you time, reduce manual errors, and provide valuable
            insights.
          </p>
          <p className="text-lg text-gray-700 mb-4 text-left">
            Here’s how Abroadhub simplifies your responsibilities:
          </p>
          <ul className="list-disc pl-8 text-lg text-gray-700 mb-4 text-left">
            <li>
              <strong>Create and Manage Programs:</strong> Add new study abroad
              programs, update existing ones with fresh details, or remove
              programs as needed, all in just a few clicks.
            </li>
            <li>
              <strong>Oversee Applications:</strong> Effortlessly review and
              process student applications. Move applications through various
              stages of approval, communicate with students, and ensure every
              detail is accounted for.
            </li>
            <li>
              <strong>User Management:</strong> Use the platform to view all
              users, manage their roles, and perform other actions as needed.
            </li>
            <li>
              <strong>Track Trends and Insights:</strong> Gain valuable insights
              into participation trends, program popularity, and application
              data to help refine and enhance future offerings.
            </li>
          </ul>
          <p className="text-lg text-gray-700 mb-4 text-left">
            Abroadhub is your all-in-one administrative tool for ensuring the
            success of {institutionName}'s study abroad programs.
          </p>
        </section>
      ) : user?.roles.includes(UserRoles.Partner) ? (
        <section className="bg-gray-200 p-6 rounded-lg shadow-lg w-3/4 mx-auto">
          <p className="text-lg text-gray-700 mb-4 text-left">
            Welcome to the <strong>Partner Portal</strong>. As a provider
            partner, your role in the study abroad program is essential in
            ensuring smooth operations and student success. Here’s what you can
            do in Abroadhub:
          </p>
          <ul className="list-disc pl-8 text-lg text-gray-700 mb-4 text-left">
            <li>
              <strong>View Partner Program List:</strong> Access a table of all
              programs where you are listed as a provider partner, including
              details like title, year and semester, faculty leads, key dates,
              and applicant statistics.
            </li>
            <li>
              <strong>Monitor Enrollment:</strong> Track the total number of
              applicants in the "approved" or "enrolled" status and view a
              breakdown of those whose payment status is "fully paid."
            </li>
            <li>
              <strong>Sort, Filter, and Search:</strong> Easily find and
              navigate through programs using sorting and filtering features.
            </li>
            <li>
              <strong>View Program Details:</strong> Access in-depth information
              about a specific program, including its description, faculty
              leads, and key dates.
            </li>
            <li>
              <strong>Manage Applicant Payments:</strong> Edit an applicant's
              payment status to reflect "unpaid," "partially paid," or "fully
              paid."
            </li>
          </ul>
          <p className="text-lg text-gray-700 mb-4 text-left">
            Your contributions are crucial to maintaining seamless operations
            for study abroad programs. Thank you for partnering with us!
          </p>
        </section>
      ) : (
        <section className="bg-gray-200 p-6 rounded-lg shadow-lg w-3/4 mx-auto">
          <p className="text-lg text-gray-700 mb-4 text-left">
            At <strong>{institutionName}</strong>, we believe in
            empowering students to expand their horizons and explore the world
            through transformative study abroad experiences. Abroadhub is your
            one-stop destination for discovering and applying to {institutionName}'s
            faculty-led study abroad programs.
          </p>
          <p className="text-lg text-gray-700 mb-4 text-left">
            Our platform is designed to make your journey as seamless and
            enjoyable as possible:
          </p>
          <ul className="list-disc pl-8 text-lg text-gray-700 mb-4 text-left">
            <li>
              <strong>Explore Programs:</strong> Dive into our wide range of
              study abroad opportunities in incredible destinations worldwide.
              Learn about program details, faculty leads, academic focuses, and
              more.
            </li>
            <li>
              <strong>Apply to Programs:</strong> Submit your application with
              ease and request any recommendation letters as needed.
            </li>
            <li>
              <strong>Stay in Control:</strong> Track the progress of your
              application and deadlines.
            </li>
            <li>
              <strong>Enhance Your Experience:</strong> Access all your
              program-related information in one convenient place, from start
              dates to faculty contacts and beyond.
            </li>
          </ul>
        </section>
      )}
    </div>
  );
};

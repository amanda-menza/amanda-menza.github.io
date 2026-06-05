import { useEffect, useState } from "react";
import { LAST_ACTIVITY_TIMESTAMP } from "../constants";
import { AuthManager } from "./AuthManager"; // You'll need to export AuthManager from your api.js file
import logger from "./Logger";

const InactivityMonitor = () => {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const ACTIVITY_TIMEOUT = 15 * 60 * 1000;

  // Update activity timestamp on user interactions
  const updateActivity = () => {
    logger.debug("update inactivity");
    const now = Date.now();
    localStorage.setItem(LAST_ACTIVITY_TIMESTAMP, now.toString());
    setLastActivity(now);
  };

  useEffect(() => {
    // Add event listeners for user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Register all event listeners
    activityEvents.forEach((event) => {
      logger.debug(event);

      window.addEventListener(event, updateActivity);
    });

    // Check for inactivity every minute
    const intervalId = setInterval(() => {
      const currentTime = Date.now();
      const storedLastActivity = parseInt(
        localStorage.getItem(LAST_ACTIVITY_TIMESTAMP) || currentTime.toString(),
        10
      );
      logger.debug("stored last activity", storedLastActivity);
      logger.debug("current minus stored", currentTime - storedLastActivity);
      logger.debug("activity timeout", ACTIVITY_TIMEOUT);

      // If user has been inactive for 15 minutes, log them out
      if (currentTime - storedLastActivity > ACTIVITY_TIMEOUT) {
        AuthManager.showAlertOnce(
          "sessionExpiring",
          "You have been logged out due to inactivity.",
          true
        );
      }
    }, 60000); // Check every minute

    // Initial activity timestamp
    updateActivity();

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(intervalId);
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default InactivityMonitor;

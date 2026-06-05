import {
  ACCESS_TOKEN,
  ID_TOKEN,
  REFRESH_TOKEN,
  LAST_ACTIVITY_TIMESTAMP,
} from "../constants";
const ACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
type Alerts = {
  sessionExpiring: boolean;
  tokenInvalid: boolean;
};

export const AuthManager = {
  // Track and update user activity
  updateActivity: function () {
    localStorage.setItem(LAST_ACTIVITY_TIMESTAMP, Date.now().toString());
  },

  // Check if user has been active within the last 15 minutes
  isUserActive: function () {
    const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_TIMESTAMP);
    if (!lastActivityStr) return true;

    const lastActivity = parseInt(lastActivityStr, 10);
    const currentTime = Date.now();

    return currentTime - lastActivity <= ACTIVITY_TIMEOUT;
  },

  // Centralized logout method
  logout: function () {
    // Clear all authentication-related items
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(ID_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(LAST_ACTIVITY_TIMESTAMP);
    // Redirect to logout page
    window.location.href = "/logout";
  },

  // Alerts
  alerts: {
    sessionExpiring: false,
    tokenInvalid: false,
  },

  // Show alert only once for a specific type
  showAlertOnce: function (
    type: keyof Alerts,
    message: string,
    redirectToLogout = false
  ) {
    if (!this.alerts[type]) {
      this.alerts[type] = true;

      alert(message);
      if (redirectToLogout) {
        setTimeout(() => {
          this.logout();
          // Reset specific alert type after redirect
          this.alerts[type] = false;
        }, 3000);
      } else {
        // Reset alert type after a short delay
        setTimeout(() => {
          this.alerts[type] = false;
        }, 3000);
      }
    }
  },
};

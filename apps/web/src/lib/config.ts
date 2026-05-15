export const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }

  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5000`;
  }

  return "http://localhost:5000";
};

export const SOCKET_URL = getSocketUrl();

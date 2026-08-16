"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Connects once per mount, joins the right room, and cleans up on unmount.
// Usage: useSocket({ room: "admin" }) or useSocket({ room: "customer", userId })
export const useSocket = ({ room, userId, onEvent } = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", ""), {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (room === "admin") socket.emit("join_admin");
      if (room === "customer" && userId) socket.emit("join_customer", userId);
    });

    if (onEvent) {
      Object.entries(onEvent).forEach(([eventName, handler]) => socket.on(eventName, handler));
    }

    return () => socket.disconnect();
  }, [room, userId]);

  return socketRef;
};

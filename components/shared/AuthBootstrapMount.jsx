"use client";

import { useAuthBootstrap } from "../../hooks/useAuthBootstrap";

// Renders nothing — just runs the session-restore check once on app load.
export default function AuthBootstrapMount() {
  useAuthBootstrap();
  return null;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, setAccessTokenOnly, clearCredentials } from "../features/auth/authSlice";
import { setAccessToken } from "../services/apiClient";
import { authApi } from "../features/auth/authApi";

// The access token only lives in memory (Redux + the axios client), by
// design — it's never in localStorage so it can't be stolen via XSS. That
// means a full page reload loses it. This runs once on app load and uses
// the httpOnly refresh cookie (which DOES survive reloads) to silently get
// a new access token, so the person doesn't look logged out just because
// they hit refresh. Returns `isBootstrapping` so the UI can avoid a flash
// of "logged out" state while this is in flight.
export const useAuthBootstrap = () => {
  const dispatch = useDispatch();
  const hasRun = useRef(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const bootstrap = async () => {
      try {
        const refreshResult = await dispatch(authApi.endpoints.refresh.initiate()).unwrap();
        const { accessToken } = refreshResult.data;

        // Put the token in Redux FIRST — apiSlice.prepareHeaders reads it from
        // here, so getMe() below needs it set before the request fires.
        dispatch(setAccessTokenOnly(accessToken));
        setAccessToken(accessToken); // keep the plain axios client (services/apiClient.js) in sync too

        const meResult = await dispatch(authApi.endpoints.getMe.initiate()).unwrap();
        dispatch(setCredentials({ user: meResult.data.user, accessToken }));
      } catch {
        dispatch(clearCredentials()); // no valid refresh cookie — just stay logged out
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, [dispatch]);

  return isBootstrapping;
};

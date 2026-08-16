"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useSetPasswordMutation } from "../../../features/auth/authApi";
import { setCredentials } from "../../../features/auth/authSlice";

export default function SetPasswordPage() {
  const { user, accessToken, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [setPassword, { isLoading }] = useSetPasswordMutation();

  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword2] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center text-gray-500">
        You need to be logged in (or have just placed an order) to set a password.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const result = await setPassword({
        email: user?.email ? undefined : email,
        password,
      }).unwrap();

      dispatch(setCredentials({ user: result.data.user, accessToken }));
      setSuccess(true);
      setTimeout(() => router.push("/"), 1500);
    } catch (err) {
      setError(err?.data?.message || "Could not set password.");
    }
  };

  if (success) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <p className="text-green-600 font-medium">Password set! You can now log in with your email anytime.</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">Secure Your Account</h1>
      <p className="text-sm text-gray-500 mb-6">
        You're currently checked in as <strong>{user?.name}</strong> ({user?.phone}). Add a password
        so you can log in with your email next time, instead of placing another order.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!user?.email && (
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm mt-1"
            />
          </div>
        )}
        <div>
          <label className="text-sm font-medium">New Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword2(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Confirm Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm mt-1"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Set Password"}
        </button>
      </form>
    </div>
  );
}
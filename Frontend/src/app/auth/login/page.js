"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const loginPaths = ["/auth/login", "/auth/sign-in"];
      let data = null, lastErr = null;

      for (const path of loginPaths) {
        try {
          data = await apiFetch(path, {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });
          lastErr = null;
          break;
        } catch (err) {
          lastErr = err;
          if (!String(err?.message).includes("404")) throw err;
        }
      }
      if (lastErr) throw lastErr;

      const token =
        data?.access_token || data?.accessToken || data?.token || null;

      // your backend uses JWT scheme
      const tokenType = data?.token_type || data?.tokenType || "JWT";

      if (!token) throw new Error("No access token returned from server");

      localStorage.setItem("token", token);
      localStorage.setItem("token_type", tokenType);

      window.location.href = "/browse";
    } catch (err) {
      setError(String(err?.message || "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Log In</h2>
        {error && <div className="bg-red-600 text-white px-3 py-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full rounded px-3 py-2 bg-gray-800 text-white" type="email"
                 placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="w-full rounded px-3 py-2 bg-gray-800 text-white" type="password"
                 placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>
        <p className="text-sm text-gray-400 mt-4 text-center">
          Don’t have an account? <Link href="/auth/sign-up" className="underline">Sign up</Link>
        </p>
      </Card>
    </div>
  );
}

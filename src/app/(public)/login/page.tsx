"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  registerSchema,
  devTokenSchema,
  type LoginInput,
  type RegisterInput,
  type DevTokenInput,
} from "@/lib/schemas";
import { setTokens, setToken, isAuthenticated } from "@/lib/auth";
import { api } from "@/lib/api";
import type { TokenResponse, OAuthResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
import type { CredentialResponse } from "@react-oauth/google";

const GoogleLoginButton = dynamic(
  () => import("@react-oauth/google").then((m) => m.GoogleLogin),
  { ssr: false, loading: () => <div className="h-10" /> }
);

function extractApiError(err: unknown): string {
  if (err && typeof err === "object" && "detail" in err) {
    return String((err as { detail: string }).detail);
  }
  return "";
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/studio");
    }
  }, [router]);

  // ─── Google auth ────────────────────────────────────────────
  const handleGoogleSuccess = useCallback(
    async (credentialResponse: CredentialResponse) => {
      const idToken = credentialResponse.credential;
      if (!idToken) {
        setError("Google sign-in failed: no credential returned.");
        return;
      }

      setError(null);
      setGoogleLoading(true);
      try {
        const res = await api.post<OAuthResponse>("/auth/google", {
          id_token: idToken,
        });
        setTokens(res.access_token, res.refresh_token);
        router.push("/studio");
      } catch (err: unknown) {
        setError(extractApiError(err) || "Google authentication failed.");
      } finally {
        setGoogleLoading(false);
      }
    },
    [router]
  );

  const handleGoogleError = useCallback(() => {
    setError("Google sign-in was cancelled or failed.");
  }, []);

  // ─── Login form ─────────────────────────────────────────────
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email_or_username: "", password: "" },
  });

  const onLogin = async (data: LoginInput) => {
    setError(null);
    try {
      const res = await api.post<TokenResponse>("/auth/login", data);
      setTokens(res.access_token, res.refresh_token);
      router.push("/studio");
    } catch (err: unknown) {
      setError(
        extractApiError(err) || "Login failed. Check your credentials."
      );
    }
  };

  // ─── Register form ──────────────────────────────────────────
  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", username: "", password: "", display_name: "" },
  });

  const onRegister = async (data: RegisterInput) => {
    setError(null);
    try {
      const res = await api.post<TokenResponse>("/auth/register", data);
      setTokens(res.access_token, res.refresh_token);
      router.push("/studio");
    } catch (err: unknown) {
      setError(extractApiError(err) || "Registration failed.");
    }
  };

  // ─── Dev token form ─────────────────────────────────────────
  const devForm = useForm<DevTokenInput>({
    resolver: zodResolver(devTokenSchema),
  });

  const onDevToken = (data: DevTokenInput) => {
    setToken(data.token.trim());
    router.push("/studio");
  };

  // ─── Google button section ──────────────────────────────────
  const GoogleSection = () => (
    <>
      <div className="relative my-4">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          or
        </span>
      </div>
      <div className="flex justify-center">
        {googleLoading ? (
          <Button variant="outline" className="w-full" disabled>
            Connecting to Google...
          </Button>
        ) : (
          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            size="large"
            width="400"
            text="continue_with"
            shape="rectangular"
            theme="outline"
          />
        )}
      </div>
    </>
  );

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Film className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Welcome to kLic</CardTitle>
          <CardDescription>
            Sign in or create an account to access the Studio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-destructive mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Tabs defaultValue="login" onValueChange={() => setError(null)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="token">Dev Token</TabsTrigger>
            </TabsList>

            {/* ── Login Tab ─────────────────────────────────── */}
            <TabsContent value="login">
              <form
                onSubmit={loginForm.handleSubmit(onLogin)}
                className="space-y-4 pt-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email or Username</Label>
                  <Input
                    id="login-email"
                    placeholder="you@example.com"
                    {...loginForm.register("email_or_username")}
                  />
                  {loginForm.formState.errors.email_or_username && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.email_or_username.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="********"
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginForm.formState.isSubmitting}
                >
                  {loginForm.formState.isSubmitting
                    ? "Signing in..."
                    : "Sign In"}
                </Button>
              </form>
              <GoogleSection />
            </TabsContent>

            {/* ── Register Tab ──────────────────────────────── */}
            <TabsContent value="register">
              <form
                onSubmit={registerForm.handleSubmit(onRegister)}
                className="space-y-4 pt-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="reg-display">Display Name</Label>
                  <Input
                    id="reg-display"
                    placeholder="Your Name"
                    {...registerForm.register("display_name")}
                  />
                  {registerForm.formState.errors.display_name && (
                    <p className="text-sm text-destructive">
                      {registerForm.formState.errors.display_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-username">Username</Label>
                  <Input
                    id="reg-username"
                    placeholder="your_username"
                    {...registerForm.register("username")}
                  />
                  {registerForm.formState.errors.username && (
                    <p className="text-sm text-destructive">
                      {registerForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    {...registerForm.register("email")}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Min. 8 characters"
                    {...registerForm.register("password")}
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerForm.formState.isSubmitting}
                >
                  {registerForm.formState.isSubmitting
                    ? "Creating account..."
                    : "Create Account"}
                </Button>
              </form>
              <GoogleSection />
            </TabsContent>

            {/* ── Dev Token Tab ─────────────────────────────── */}
            <TabsContent value="token">
              <form
                onSubmit={devForm.handleSubmit(onDevToken)}
                className="space-y-4 pt-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="dev-token">JWT Token</Label>
                  <Textarea
                    id="dev-token"
                    placeholder="eyJhbGciOiJIUzI1NiIs..."
                    className="font-mono text-xs min-h-[100px]"
                    {...devForm.register("token")}
                  />
                  {devForm.formState.errors.token && (
                    <p className="text-sm text-destructive">
                      {devForm.formState.errors.token.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Paste a raw JWT for development. No refresh token will be
                    stored.
                  </p>
                </div>
                <Button type="submit" variant="outline" className="w-full">
                  Save & Enter Studio
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

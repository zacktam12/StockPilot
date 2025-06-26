// src/features/auth/components/ForgotPassword.jsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import Card from "../../../components/shared/Card";
import Spinner from "../../../components/shared/spinner";
import api from "../../../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Read email from URL query parameter on component mount
  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [searchParams]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setIsSuccess(false);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      // Normalize email before sending to backend
      const normalizedEmail = email.trim().toLowerCase();
      const response = await api.post("/auth/forgot-password", {
        email: normalizedEmail,
      });
      // Only show success if backend confirms success
      if (response && response && response.success) {
        setIsSuccess(true);
      } else {
        setError(response?.message || "No user found with this email.");
        setIsSuccess(false);
      }
    } catch (error) {
      setError(
        error?.response?.message ||
          error?.message ||
          "System error occurred. Please try again or contact your administrator."
      );
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-3">
      <div className="w-full max-w-sm">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <div className="space-y-1 pb-3 p-4">
            <div className="flex items-center gap-2">
              <a href="/login">
                <button className="text-slate-400 hover:text-white p-0 h-6 w-6 bg-transparent border-none cursor-pointer flex items-center justify-center">
                  <ArrowLeft className="h-3 w-3" />
                </button>
              </a>
              <h2 className="text-lg text-white font-semibold">
                Reset Password
              </h2>
            </div>
            <p className="text-slate-400 text-xs">
              Enter your work email to receive a secure reset link.
            </p>
          </div>

          <div className="space-y-3 px-4 pb-4">
            {isSuccess ? (
              <div className="space-y-3">
                <div className="border border-green-500 bg-green-500/10 rounded-md p-2 flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span className="text-green-400 text-xs">
                    <strong>Reset link sent!</strong> Check your email for the
                    secure password reset link.
                  </span>
                </div>

                <div className="bg-slate-700/30 p-3 rounded border border-slate-600">
                  <h4 className="text-xs font-medium text-slate-200 mb-1">
                    Next Steps:
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-0.5">
                    <li>• Check your email inbox</li>
                    <li>• Click the secure link</li>
                    <li>• Create your new password</li>
                    <li>• Link expires in 15 minutes</li>
                  </ul>
                </div>

                <div className="text-center">
                  <Button
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail("");
                    }}
                    className="bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 h-7 text-xs"
                  >
                    {`Send Another Link${console.log("Delete clicked!")}`}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="text-slate-200 text-xs block"
                  >
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-2 h-3 w-3 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your work email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className="pl-7 h-8 text-sm bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {error && (
                    <div className="border border-red-500 bg-red-500/10 rounded-md p-1">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                        <span className="text-red-400 text-xs">{error}</span>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium h-8 text-xs"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-1">
                      <Spinner size="sm" />
                      Verifying...
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}

            <div className="text-center text-xs text-slate-400 space-y-1">
              <p>
                Remember your password?{" "}
                <a
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Back to login
                </a>
              </p>
              <p>
                Can't access your account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/account-recovery")}
                  className="text-orange-400 hover:text-orange-300 transition-colors bg-transparent border-none cursor-pointer"
                >
                  Try account recovery
                </button>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

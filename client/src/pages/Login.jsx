import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const Login = () => {
  const { loginWithGoogle, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/app/today", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white/50 to-purple-50/50 pointer-events-none" />

      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white/80 p-10 shadow-xl backdrop-blur-xl relative z-10 border border-white/20">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Welcome to Antigravity
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Sign in with Google to continue
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (credentialResponse.credential) {
                console.log("Google credential received, authenticating...");
                const success = await loginWithGoogle(
                  credentialResponse.credential,
                );
                if (success) {
                  // Small delay to ensure state is updated
                  setTimeout(() => {
                    navigate("/app/today", { replace: true });
                  }, 100);
                } else {
                  console.error("Login failed - check console for details");
                }
              } else {
                toast.error("No credential received from Google");
              }
            }}
            onError={(error) => {
              console.error("Google login error:", error);
              // Check if it's an origin error
              if (error.error === "popup_closed_by_user") {
                toast.error("Sign-in was cancelled");
              } else {
                toast.error(
                  "Google sign-in failed. Please ensure your origin is authorized in Google Cloud Console.",
                  { duration: 5000 }
                );
              }
            }}
            size="large"
            theme="filled_blue"
            shape="pill"
            width="300"
          />
        </div>

        <div className="text-center text-xs text-gray-400 mt-6">
          Secure authentication powered by Google
        </div>
      </div>
    </div>
  );
};

export default Login;

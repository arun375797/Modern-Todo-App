import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../store/authStore";

const Login = () => {
  const { loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();

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
                const success = await loginWithGoogle(
                  credentialResponse.credential,
                );
                if (success) {
                  navigate("/app/today");
                }
              }
            }}
            onError={() => {
              console.log("Login Failed");
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

import { useNavigate } from "react-router-dom";

export function SplashScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-6xl font-bold text-blue-600">Welcome!</h1>
      <p className="text-2xl text-gray-600">Primary 1 Math</p>
      <button
        onClick={() => navigate("/chapters")}
        className="rounded-2xl bg-green-500 px-12 py-6 text-3xl font-bold text-white shadow-lg active:scale-95"
      >
        Let's Go!
      </button>
    </div>
  );
}

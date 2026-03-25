import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  let message = "Something went wrong";

  if (isRouteErrorResponse(error)) {
    message = error.statusText || error.data || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center max-w-xl">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>

        <h1 className="text-3xl font-bold text-gray-900">
          Something went wrong
        </h1>

        <p className="mt-2 text-gray-600">{message}</p>

        <div className="mt-6 flex justify-center gap-4">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-lg bg-black text-white hover:bg-gray-800 transition"
          >
            Go Home
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}

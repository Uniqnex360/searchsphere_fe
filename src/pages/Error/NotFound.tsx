import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center max-w-xl">
        {/* 404 */}
        <h1 className="text-8xl font-extrabold text-gray-900 tracking-tight">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-4 text-2xl font-semibold text-gray-700">
          Page not found
        </h2>

        {/* Description */}
        <p className="mt-2 text-gray-500">
          Sorry, we couldn’t find the page you’re looking for.
        </p>

        {/* Actions */}
        <div className="mt-6 flex justify-center gap-4">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-lg bg-black text-white hover:bg-gray-800 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

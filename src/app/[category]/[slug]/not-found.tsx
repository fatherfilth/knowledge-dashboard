import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Article Not Found
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          The article you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-gray-900 px-6 py-3 text-white transition hover:bg-gray-800"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

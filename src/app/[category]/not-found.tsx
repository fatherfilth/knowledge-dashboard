import Link from "next/link";

export default function CategoryNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <h1 className="mb-4 font-display text-4xl font-bold text-primary">
          Category Not Found
        </h1>
        <p className="mb-8 text-lg text-muted">
          The category you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-block rounded-pill bg-teal px-6 py-3 font-medium text-navy transition hover:bg-teal/90"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

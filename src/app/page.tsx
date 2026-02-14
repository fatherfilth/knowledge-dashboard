import Link from "next/link";
import { fetchCategories } from "@/lib/content";

export default async function Home() {
  const categories = await fetchCategories();

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <main className="flex w-full max-w-5xl flex-col items-center space-y-12 py-24 text-center">
        <div className="space-y-6">
          <h1 className="text-7xl font-bold tracking-tight text-gray-900">
            Ryder.AI
          </h1>
          <p className="max-w-2xl text-2xl text-gray-600">
            Curated AI documentation and resources for focused learning
          </p>
        </div>

        <div className="h-px w-full max-w-md bg-gray-200" />

        <div className="grid w-full max-w-3xl grid-cols-2 gap-4 lg:grid-cols-3">
          {categories.map((category) => {
            const capitalizedName =
              category.name.charAt(0).toUpperCase() + category.name.slice(1);

            return (
              <Link
                key={category.name}
                href={`/${category.name}`}
                className="group rounded-lg border border-gray-200 p-6 transition hover:border-gray-300 hover:bg-gray-50"
              >
                <h2 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-gray-700">
                  {capitalizedName}
                </h2>
                <p className="text-sm text-gray-600">
                  {category.count} {category.count === 1 ? "article" : "articles"}
                </p>
              </Link>
            );
          })}
        </div>

        <footer className="text-sm text-gray-500">
          Building knowledge foundations, one article at a time
        </footer>
      </main>
    </div>
  );
}

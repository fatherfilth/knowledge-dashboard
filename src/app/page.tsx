import Link from "next/link";
import { fetchCategories, fetchAllArticles } from "@/lib/content";
import { ArticleCard } from "@/components/ui/ArticleCard";

const categoryColors: Record<string, string> = {
  models: "#8B5CF6",
  tools: "#00E5CC",
  skills: "#FFB347",
  repos: "#F472B6",
  agents: "#38BDF8",
  projects: "#34D399",
};

const categoryIcons: Record<string, string> = {
  models: "🧠",
  tools: "🔧",
  skills: "⚡",
  repos: "📦",
  agents: "🤖",
  projects: "🏗️",
};

export default async function Home() {
  const categories = await fetchCategories();
  const allArticles = await fetchAllArticles();

  const totalArticles = allArticles.length;
  const totalTags = new Set(allArticles.flatMap((a) => a.tags || [])).size;

  const recentArticles = [...allArticles]
    .sort((a, b) => b.updated.getTime() - a.updated.getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
        {/* Eyebrow badge */}
        <div className="mb-6 inline-flex items-center rounded-pill border border-white/[0.08] bg-glass px-4 py-1.5 text-xs font-medium text-muted backdrop-blur-sm">
          Knowledge Dashboard
        </div>

        {/* Gradient title */}
        <h1 className="mb-6 font-display text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
          <span className="bg-gradient-to-r from-teal via-purple to-amber bg-clip-text text-transparent">
            Ryder.AI
          </span>
        </h1>

        {/* Tagline */}
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted md:text-xl">
          Curated AI documentation and resources for focused learning
        </p>

        {/* Stats row */}
        <div className="flex justify-center gap-8 text-sm">
          <div>
            <span className="font-display text-2xl font-bold text-primary">{totalArticles}</span>
            <span className="ml-2 text-muted">Articles</span>
          </div>
          <div>
            <span className="font-display text-2xl font-bold text-primary">{categories.length}</span>
            <span className="ml-2 text-muted">Categories</span>
          </div>
          <div>
            <span className="font-display text-2xl font-bold text-primary">{totalTags}</span>
            <span className="ml-2 text-muted">Topics</span>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="mx-auto max-w-7xl px-6 pb-16" aria-label="Browse by category">
        <h2 className="mb-8 font-display text-2xl font-bold tracking-tight text-primary">
          Categories
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const capitalizedName = category.name.charAt(0).toUpperCase() + category.name.slice(1);
            const color = categoryColors[category.name] || "#94A3B8";

            return (
              <Link
                key={category.name}
                href={`/${category.name}`}
                className="group relative overflow-clip rounded-2xl border border-white/[0.08] bg-glass p-6 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.16] hover:shadow-lg"
              >
                {/* Top accent bar on hover */}
                <div
                  className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100"
                  style={{ backgroundColor: color }}
                />

                {/* Icon container */}
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <span className="text-lg" style={{ color }} aria-hidden="true">
                    {categoryIcons[category.name] || "📄"}
                  </span>
                </div>

                <h3 className="mb-1 font-display text-lg font-bold tracking-tight text-primary">
                  {capitalizedName}
                </h3>
                <p className="text-sm text-muted">
                  {category.count} {category.count === 1 ? "article" : "articles"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent articles list */}
      <section className="mx-auto max-w-7xl px-6 pb-24" aria-label="Recent articles">
        <h2 className="mb-8 font-display text-2xl font-bold tracking-tight text-primary">
          Recent Articles
        </h2>
        <div className="space-y-3">
          {recentArticles.map((article) => (
            <ArticleCard key={`${article.category}-${article.slug}`} article={article} />
          ))}
        </div>
      </section>
    </div>
  );
}

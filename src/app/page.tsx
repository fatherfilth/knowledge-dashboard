export default function Home() {
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

        <footer className="text-sm text-gray-500">
          Building knowledge foundations, one article at a time
        </footer>
      </main>
    </div>
  );
}

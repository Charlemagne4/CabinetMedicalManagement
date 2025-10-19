export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-6 text-center text-white">
      <div className="flex flex-col items-center space-y-6">
        {/* Work in progress text */}
        <h1 className="text-5xl font-bold tracking-tight">
          Work in Progress 🚧
        </h1>
        <p className="max-w-md text-gray-300">
          We’re crafting something amazing. Please check back soon!
        </p>

        {/* Link to function page */}
        <a
          href="/main"
          className="mt-6 inline-block rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-blue-500 hover:shadow-xl"
        >
          Go to Function Page
        </a>
      </div>
    </div>
  );
}

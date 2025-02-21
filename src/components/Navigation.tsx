import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center h-16">
          <div className="flex space-x-4">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500 px-3 py-2 rounded-md"
            >
              Home
            </Link>
            <Link
              href="/folders"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500 px-3 py-2 rounded-md"
            >
              Folders
            </Link>
            <Link
              href="/favorites"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500 px-3 py-2 rounded-md"
            >
              Favorite
            </Link>
            <Link
              href="/settings"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500 px-3 py-2 rounded-md"
            >
              Settings
            </Link>
            <Link
              href="/analytics"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500 px-3 py-2 rounded-md"
            >
              Analytics
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

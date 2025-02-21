export default function Navigation() {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center h-16">
          <div className="flex space-x-4">
            <a
              href="/"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500 px-3 py-2 rounded-md"
            >
              Home
            </a>
            <a
              href="/shortcuts"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500 px-3 py-2 rounded-md"
            >
              Shortcuts
            </a>
            <a
              href="/folders"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500 px-3 py-2 rounded-md"
            >
              Folders
            </a>
            <a
              href="/settings"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500 px-3 py-2 rounded-md"
            >
              Settings
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

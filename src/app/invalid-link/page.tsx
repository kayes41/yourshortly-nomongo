import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page or Link Not Found</h2>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">
          The link you clicked may be invalid, expired, or has been deleted by the administrator.
        </p>
        <Link href="/login" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

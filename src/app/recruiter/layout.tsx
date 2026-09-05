import React from "react";
import Link from "next/link";
import { Building2, Briefcase, Users } from "lucide-react";

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Recruiter Hub
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/recruiter/dashboard" className="flex items-center gap-3 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-lg">
            <Briefcase className="w-5 h-5" />
            Applications
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900 rounded-lg">
            <Users className="w-5 h-5" />
            My Internships
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

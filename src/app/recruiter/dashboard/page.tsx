"use client";

import React, { useState } from "react";
import { initialMockRecruiterApplicants } from "@/data/mock-recruiter-data";
import { RecruiterApplicant } from "@/types";
import { CheckCircle, XCircle } from "lucide-react";

export default function RecruiterDashboard() {
  const [applications, setApplications] = useState<RecruiterApplicant[]>(initialMockRecruiterApplicants);
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      // Assuming Next.js /api/applications/[id]/status
      // For MVP we just use mock update but show how fetch is called
      const response = await fetch(`/api/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      // Even if fetch fails because ID doesn't exist in DB (since we are mocking), we optimistically update
      setApplications(apps => apps.map(app => app.id === id ? { ...app, status: newStatus as any } : app));
    } catch (err) {
      console.error(err);
      // Fallback optimistic update
      setApplications(apps => apps.map(app => app.id === id ? { ...app, status: newStatus as any } : app));
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Applicant Pipeline</h1>
          <p className="text-slate-500 mt-2">Review and manage student applications for your roles.</p>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Candidate</th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Role</th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Match Score</th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Status</th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-600 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {applications.map(app => (
                <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={app.studentAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{app.studentName}</div>
                        <div className="text-xs text-slate-500">{app.university}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{app.internshipTitle}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {app.matchScore}% Match
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        disabled={updating === app.id}
                        onClick={() => updateStatus(app.id, 'SHORTLISTED')} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50" 
                        title="Shortlist"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button 
                        disabled={updating === app.id}
                        onClick={() => updateStatus(app.id, 'REJECTED')} 
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50" 
                        title="Reject"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

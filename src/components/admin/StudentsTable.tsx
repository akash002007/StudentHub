"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AdminStudentRecord } from "@/types";
import { StatusBadge } from "@/components/admin/common";
import { ExternalLink, User } from "lucide-react";

export function StudentsTable({ rows }: { rows: AdminStudentRecord[] }) {
  return (
    <Card className="overflow-hidden border-border/80 bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-xs">
          <thead className="bg-muted/40 border-b border-border/70">
            <tr>
              {[
                "Student",
                "College",
                "Degree / Branch",
                "Year",
                "Verification Status",
                "Profile Completion",
                "Last Active",
                "Joined",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="text-left py-3 px-4 font-bold uppercase tracking-[0.12em] text-[11px] text-muted-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-muted border border-border/60 flex items-center justify-center text-foreground font-semibold">
                      {row.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{row.name}</p>
                      <p className="text-muted-foreground text-[11px]">{row.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-medium text-foreground">{row.college}</td>
                <td className="py-3 px-4">{row.degree}</td>
                <td className="py-3 px-4">{row.year}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={row.verificationStatus} />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                        style={{ width: `${row.profileCompletion}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {row.profileCompletion}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground">{row.lastActive}</td>
                <td className="py-3 px-4 text-muted-foreground">{row.joined}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/students/${row.id}`}>
                      <Button size="sm" variant="outline">
                        View Dossier
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

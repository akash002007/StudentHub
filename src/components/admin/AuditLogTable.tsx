import React from "react";
import { AuditLogEntry } from "@/types";
import { Card } from "@/components/ui/Card";

export function AuditLogTable({ rows }: { rows: AuditLogEntry[] }) {
  return (
    <Card className="overflow-hidden border-border/80 bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-xs">
          <thead className="bg-muted/40 border-b border-border/70">
            <tr>
              {[
                "Timestamp",
                "Admin",
                "Action",
                "Student",
                "Previous Status",
                "New Status",
                "IP / Session",
                "Details",
              ].map((header) => (
                <th key={header} className="text-left py-3 px-4 font-bold uppercase tracking-[0.12em] text-[11px] text-muted-foreground">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                <td className="py-3 px-4">{row.timestamp}</td>
                <td className="py-3 px-4 font-semibold text-foreground">{row.admin}</td>
                <td className="py-3 px-4">{row.action}</td>
                <td className="py-3 px-4">{row.student}</td>
                <td className="py-3 px-4">{row.previousStatus}</td>
                <td className="py-3 px-4">{row.newStatus}</td>
                <td className="py-3 px-4">{row.ipSessionRef}</td>
                <td className="py-3 px-4">{row.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

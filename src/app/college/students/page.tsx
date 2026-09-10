"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Search,
  Filter,
  Download,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  ChevronRight,
  Eye,
  Award,
  Layers,
  X,
  Dna,
  Shield,
  Mail,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

export default function CollegeStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("ALL");
  const [batch, setBatch] = useState("ALL");
  const [placementStatus, setPlacementStatus] = useState("ALL");
  const [verificationStatus, setVerificationStatus] = useState("ALL");

  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [studentDossier, setStudentDossier] = useState<any | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (department !== "ALL") params.append("department", department);
      if (batch !== "ALL") params.append("batch", batch);
      if (placementStatus !== "ALL") params.append("placementStatus", placementStatus);
      if (verificationStatus !== "ALL") params.append("verificationStatus", verificationStatus);

      const res = await fetch(`/api/college/students?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setStudents(json.students || []);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [department, batch, placementStatus, verificationStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleOpenDossier = async (student: any) => {
    setSelectedStudent(student);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/college/students/${student.id}`);
      if (res.ok) {
        const data = await res.json();
        setStudentDossier(data);
      }
    } catch (err) {
      console.error("Failed to load student dossier:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Institutional Student Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage enrolled candidate cohorts, verify academic credentials, track placement statuses, and inspect recruitment dossiers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            rightIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => alert("Exporting Institutional Cohort CSV...")}
          >
            Export Cohort CSV
          </Button>
        </div>
      </div>

      {/* Search & Filters Filter Bar */}
      <Card className="p-4 rounded-2xl bg-card border border-border space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by student name, email, skills (e.g. PyTorch, React), or branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button type="submit" variant="gradient" className="h-10 text-xs px-5">
            Search
          </Button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-border/60">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full text-xs bg-muted/60 border border-border rounded-xl px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Artificial Intelligence">AI & Machine Learning</option>
              <option value="Information Systems">Information Systems</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Graduation Batch
            </label>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full text-xs bg-muted/60 border border-border rounded-xl px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Batches</option>
              <option value="2025">Batch of 2025</option>
              <option value="2026">Batch of 2026</option>
              <option value="2027">Batch of 2027</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Placement Status
            </label>
            <select
              value={placementStatus}
              onChange={(e) => setPlacementStatus(e.target.value)}
              className="w-full text-xs bg-muted/60 border border-border rounded-xl px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PLACED">Placed</option>
              <option value="UNPLACED">Unplaced</option>
              <option value="OFFERED">Offered / In Progress</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Verification (KYC)
            </label>
            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value)}
              className="w-full text-xs bg-muted/60 border border-border rounded-xl px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Verifications</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending Review</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Student List Table */}
      <Card className="overflow-hidden rounded-2xl bg-card border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Department & Branch</th>
                <th className="py-3 px-4">Batch</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">KYC Status</th>
                <th className="py-3 px-4">Placement Status</th>
                <th className="py-3 px-4">Applications</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    Loading student cohort records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No students match the current filters.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const isVerified =
                    student.verificationStatus === "approved" ||
                    student.verificationStatus === "VERIFIED";
                  const isPlaced =
                    student.placementStatus === "PLACED" ||
                    (student.offersCount && student.offersCount > 0);

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-muted/40 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDossier(student)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={student.avatar}
                            alt={student.name}
                            name={student.name}
                            size="sm"
                          />
                          <div>
                            <div className="font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {student.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-foreground">
                        <div>{student.department || student.branch || "Computer Science"}</div>
                        <div className="text-[11px] text-muted-foreground">{student.degree || "B.S."}</div>
                      </td>

                      <td className="py-3.5 px-4 text-foreground font-medium">
                        {student.graduationYear}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-foreground">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {student.cgpa || "3.80"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {isVerified ? (
                          <Badge variant="emerald" className="gap-1 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="amber" className="gap-1 text-[10px]">
                            <Clock className="w-3 h-3" /> Pending
                          </Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isPlaced ? (
                          <Badge variant="emerald" className="gap-1 text-[10px]">
                            <Award className="w-3 h-3" /> Placed
                          </Badge>
                        ) : (
                          <Badge variant="blue" className="gap-1 text-[10px]">
                            Seeking Placement
                          </Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-foreground">
                          {student.applicationsCount ?? 0}
                        </span>{" "}
                        <span className="text-muted-foreground text-[11px]">drives</span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDossier(student);
                          }}
                        >
                          Dossier <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Slide-over Candidate Dossier Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-xl bg-card border-l border-border h-full overflow-y-auto shadow-2xl p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={selectedStudent.avatar}
                    alt={selectedStudent.name}
                    name={selectedStudent.name}
                    size="md"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{selectedStudent.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> {selectedStudent.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {detailLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground">Loading candidate dossier...</div>
              ) : (
                <>
                  {/* Academic & Placement Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-muted/60 border border-border text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">CGPA</span>
                      <div className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                        {selectedStudent.cgpa || "3.85"}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/60 border border-border text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Graduation</span>
                      <div className="text-base font-bold text-foreground mt-0.5">
                        {selectedStudent.graduationYear}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/60 border border-border text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Backlogs</span>
                      <div className="text-base font-bold text-foreground mt-0.5">
                        {selectedStudent.backlogs ?? 0}
                      </div>
                    </div>
                  </div>

                  {/* Program Details */}
                  <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Program & Department
                    </span>
                    <div className="text-sm font-semibold text-foreground">
                      {selectedStudent.degree} in {selectedStudent.department || selectedStudent.branch}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Institution: {selectedStudent.university || "Stanford University"}
                    </div>
                  </div>

                  {/* Skills / Career DNA */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Dna className="w-3.5 h-3.5 text-purple-500" /> Career DNA & Technical Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedStudent.skills || ["TypeScript", "Python", "React", "Docker", "PyTorch"]).map(
                        (sk: string) => (
                          <span
                            key={sk}
                            className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold"
                          >
                            {sk}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Recruitment Applications History */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-500" /> Drive Applications & Stage Progression
                    </span>
                    {studentDossier?.applications && studentDossier.applications.length > 0 ? (
                      <div className="space-y-2">
                        {studentDossier.applications.map((app: any) => (
                          <div
                            key={app.id}
                            className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-foreground">{app.driveTitle}</div>
                              <div className="text-[11px] text-muted-foreground">
                                Stage: {app.currentStageName || app.currentStageType}
                              </div>
                            </div>
                            <Badge variant={app.status === "SELECTED" ? "emerald" : "blue"} className="text-[10px]">
                              {app.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No drive applications submitted yet.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-border flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

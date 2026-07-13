"use client";

import React from "react";
import { X, Briefcase, GraduationCap, MapPin, Link as LinkIcon, Calendar, Github, User, Heart } from "lucide-react";
import { ParticipantProfile } from "@/data/mockMessages";
import { cn } from "@/lib/utils";

interface ContextPanelProps {
  participant?: ParticipantProfile;
  onClose?: () => void;
}

export function ContextPanel({ participant, onClose }: ContextPanelProps) {
  if (!participant) return null;

  return (
    <div className="w-[360px] flex-shrink-0 h-full flex flex-col border-l border-white/10 bg-black/40 backdrop-blur-md overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/60 backdrop-blur-xl z-10">
        <h2 className="text-sm font-medium text-white/70">Context</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="p-6 flex flex-col items-center text-center border-b border-white/10">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 mb-4 bg-white/5 relative">
          <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
          {participant.online && (
             <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-[3px] border-black rounded-full"></div>
          )}
        </div>
        <h2 className="text-xl font-semibold text-white mb-1">{participant.name}</h2>
        <p className="text-sm text-white/60 mb-3">{participant.headline}</p>
        
        <div className="flex gap-2">
          <button className="px-4 py-1.5 bg-white text-black text-xs font-medium rounded-full hover:bg-white/90 transition-colors">
            View Profile
          </button>
          <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <LinkIcon size={14} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1">
        {/* Type Specific Content */}
        {participant.type === 'student' && <StudentContext participant={participant} />}
        {participant.type === 'recruiter' && <RecruiterContext participant={participant} />}
        {participant.type === 'alumni' && <AlumniContext participant={participant} />}
        
        {/* Shared Context area (e.g. Mutual Communities) */}
        <div className="pt-6 border-t border-white/10">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">Mutual Connections</h3>
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border border-black bg-white/20 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Mutual${i}`} alt="Mutual" />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border border-black bg-white/5 flex items-center justify-center text-[10px] text-white/60">
              +4
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentContext({ participant }: { participant: ParticipantProfile }) {
  return (
    <div className="space-y-6">
      {participant.careerDNA && (
        <div>
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Career DNA</h3>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
            <User size={14} />
            {participant.careerDNA}
          </div>
        </div>
      )}

      {participant.skills && (
        <div>
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Top Skills</h3>
          <div className="flex flex-wrap gap-2">
            {participant.skills.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 rounded bg-white/5 text-white/70 text-xs border border-white/10">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {(participant.university || participant.gradYear) && (
        <div>
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Education</h3>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-white/40"><GraduationCap size={16} /></div>
            <div>
              <p className="text-sm text-white/90">{participant.university}</p>
              <p className="text-xs text-white/50">Class of {participant.gradYear}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecruiterContext({ participant }: { participant: ParticipantProfile }) {
  return (
    <div className="space-y-6">
      {participant.company && (
        <div>
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Company</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
              <Briefcase size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{participant.company}</p>
              <a href="#" className="text-xs text-emerald-400 hover:underline">View Company Profile</a>
            </div>
          </div>
        </div>
      )}

      {participant.hiringStage && (
        <div>
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Currently Hiring</h3>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm text-white/90">{participant.hiringStage}</p>
          </div>
        </div>
      )}

      {participant.internships && participant.internships.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Open Roles</h3>
          <div className="space-y-2">
            {participant.internships.map((role, i) => (
              <div key={i} className="px-3 py-2 rounded-lg bg-white/5 text-white/70 text-xs border border-white/10 hover:bg-white/10 cursor-pointer transition-colors flex justify-between items-center">
                <span>{role}</span>
                <span className="text-white/40">Apply</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AlumniContext({ participant }: { participant: ParticipantProfile }) {
  return (
    <div className="space-y-6">
      {participant.company && (
        <div>
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Current Role</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
              <Briefcase size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{participant.headline?.split('@')[0] || 'Employee'}</p>
              <p className="text-xs text-white/60">{participant.company}</p>
            </div>
          </div>
        </div>
      )}

      {(participant.university || participant.gradYear) && (
        <div>
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Alumni Details</h3>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-white/40"><GraduationCap size={16} /></div>
            <div>
              <p className="text-sm text-white/90">{participant.university}</p>
              <p className="text-xs text-white/50">Graduated {participant.gradYear}</p>
            </div>
          </div>
        </div>
      )}

      {participant.mentorshipInfo && (
        <div>
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Heart size={14} className="text-purple-400" /> 
            Mentorship
          </h3>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <p className="text-sm text-purple-100">{participant.mentorshipInfo}</p>
            <button className="mt-3 w-full py-1.5 bg-purple-500 text-white text-xs font-medium rounded-lg hover:bg-purple-600 transition-colors">
              Request Mentorship
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

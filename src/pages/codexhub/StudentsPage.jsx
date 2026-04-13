import React, { useEffect, useState } from "react";
import {
  BriefcaseIcon,
  GraduationCapIcon,
  ExternalLinkIcon,
  UserIcon,
  MessageSquareIcon,
  FileTextIcon,
  HeartIcon,
  ArrowRightIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import savedJobsService from "./services/savedJobsService";

const SectionHeading = ({ label }) => (
  <div className="cxdash-section-heading">
    <span className="cxdash-section-accent" />
    <h2 className="cxdash-section-label">{label}</h2>
  </div>
);

const StatCard = ({ label, value, caption }) => (
  <div className="cxdash-stat-card">
    <p className="cxdash-stat-label">{label}</p>
    <p className="cxdash-stat-value">{value}</p>
    <p className="cxdash-stat-caption">{caption}</p>
  </div>
);

const ActionCard = ({
  icon,
  iconClass,
  title,
  description,
  href,
  to,
  btnClass,
  btnLabel,
  external,
}) => {
  const btn = external ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`codexhub-btn ${btnClass}`}
    >
      {btnLabel} <ExternalLinkIcon />
    </a>
  ) : (
    <Link to={to} className={`codexhub-btn ${btnClass}`}>
      {btnLabel} <ArrowRightIcon />
    </Link>
  );

  return (
    <div className="cxdash-action-card">
      <div className={`cxdash-action-icon ${iconClass}`}>{icon}</div>
      <h3 className="cxdash-action-title">{title}</h3>
      <p className="cxdash-action-desc">{description}</p>
      <div className="cxdash-action-footer">{btn}</div>
    </div>
  );
};

export default function StudentsPage({ userName }) {
  const { user } = useAuth();
  const [appliedCount, setAppliedCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    const readCount = (key) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return 0;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.length : 0;
      } catch {
        return 0;
      }
    };
    setAppliedCount(readCount("appliedJobIds"));
    const saved = savedJobsService.getSavedJobsLocal();
    setSavedJobs(saved);
    setSavedCount(saved.length);
  }, []);

  useEffect(() => {
    const handleSavedUpdate = () => {
      const saved = savedJobsService.getSavedJobsLocal();
      setSavedJobs(saved);
      setSavedCount(saved.length);
    };
    window.addEventListener("savedJobsUpdated", handleSavedUpdate);
    return () =>
      window.removeEventListener("savedJobsUpdated", handleSavedUpdate);
  }, []);

  const displayName =
    userName || user?.first_name || user?.username || "Student";

  const actions = [
    {
      icon: <GraduationCapIcon />,
      iconClass: "cxdash-action-icon--orange",
      title: "My Courses",
      description:
        "Access lessons, assignments, and cohort materials inside Moodle.",
      href: "https://moodle.mycodexacademy.com/login/index.php",
      btnClass: "codexhub-btn--orange",
      btnLabel: "Go to Moodle",
      external: true,
    },
    {
      icon: <BriefcaseIcon />,
      iconClass: "cxdash-action-icon--blue",
      title: "Career Center",
      description:
        "Browse curated job openings, internships, and employer roles.",
      to: "/codexhub/jobs",
      btnClass: "codexhub-btn--blue",
      btnLabel: "Explore Jobs",
    },
    {
      icon: <MessageSquareIcon />,
      iconClass: "cxdash-action-icon--green",
      title: "Community",
      description:
        "Join cohort discussions, connect with mentors, and stay updated.",
      href: "https://codexlearners.slack.com",
      btnClass: "codexhub-btn--green",
      btnLabel: "Open Slack",
      external: true,
    },
    {
      icon: <UserIcon />,
      iconClass: "cxdash-action-icon--purple",
      title: "My Profile",
      description:
        "Update your resume, portfolio links, and visibility settings.",
      to: "/codexhub/profile",
      btnClass: "codexhub-btn--purple",
      btnLabel: "View Profile",
    },
    // {
    //   icon: <FileTextIcon />,
    //   iconClass: "cxdash-action-icon--slate",
    //   title: "Applications",
    //   description:
    //     "Track submitted applications and your hiring pipeline progress.",
    //   to: "/codexhub/profile",
    //   btnClass: "codexhub-btn--slate",
    //   btnLabel: "View Applications",
    // },
    // {
    //   icon: <HeartIcon />,
    //   iconClass: "cxdash-action-icon--rose",
    //   title: "Saved Jobs",
    //   description: "Keep track of roles you want to apply to later.",
    //   to: "/codexhub/profile",
    //   btnClass: "codexhub-btn--rose",
    //   btnLabel: "View Saved Jobs",
    // },
  ];

  return (
    <div className="cxdash-page">
      <div className="cxdash-container">
        {/* ── Hero banner ── */}
        <div className="cxdash-hero">
          <div className="cxdash-hero-inner">
            <p className="cxdash-hero-eyebrow">Student Dashboard</p>
            <h1 className="cxdash-hero-title">
              Welcome back,{" "}
              <span className="cxdash-hero-name">{displayName}</span>
            </h1>
            <p className="cxdash-hero-sub">
              Your hub for coursework, career tools, and community.
            </p>
          </div>
        </div>

        {/* ── Stats ── */}
        <section className="cxdash-section">
          <SectionHeading label="Overview" />
          <div className="cxdash-stats-grid">
            <StatCard
              label="Applications"
              value={appliedCount}
              caption="Submitted"
            />
            <StatCard label="Interviews" value={0} caption="Upcoming" />
            <StatCard label="Saved Jobs" value={savedCount} caption="Active" />
          </div>
        </section>

        {/* ── Actions ── */}
        <section className="cxdash-section">
          <SectionHeading label="Student Actions" />
          <div className="cxdash-actions-grid">
            {actions.map((a) => (
              <ActionCard key={a.title} {...a} />
            ))}
          </div>
        </section>

    
      </div>
    </div>
  );
}

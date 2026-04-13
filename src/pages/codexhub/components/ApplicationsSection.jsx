import React from "react";
import { SectionHeading } from "./SectionHeading";

const AppRow = ({ title, subtitle, stage, isSuccess }) => (
  <div className="cxprofile-app-row">
    <div>
      <p className="cxprofile-app-title">{title}</p>
      <p className="cxprofile-app-sub">{subtitle}</p>
    </div>
    <span
      className={`cxprofile-app-badge ${isSuccess ? "cxprofile-app-badge--green" : "cxprofile-app-badge--blue"}`}
    >
      {stage}
    </span>
  </div>
);

export const ApplicationsSection = ({
  applications,
  fallbackApplications,
  resolveJobTitle,
  formatStage,
}) => (
  <section className="cxprofile-card">
    <SectionHeading label="My Applications" />

    <div className="cxprofile-app-list">
      {applications.length ? (
        applications.map((app) => (
          <AppRow
            key={app.id}
            title={resolveJobTitle(app)}
            subtitle={`Last updated ${new Date(app.stage_updated_at || app.created_at).toLocaleDateString()}`}
            stage={formatStage(app.stage)}
            isSuccess={app.stage === "offer_sent" || app.stage === "hired"}
          />
        ))
      ) : fallbackApplications?.length ? (
        fallbackApplications.map((app) => (
          <AppRow
            key={app.id}
            title={app.title || "Job Application"}
            subtitle={`Applied ${app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "recently"}`}
            stage="Applied"
            isSuccess={false}
          />
        ))
      ) : (
        <p className="cxprofile-muted">
          No applications yet. Apply to jobs from the job board to see them
          here.
        </p>
      )}
    </div>
  </section>
);

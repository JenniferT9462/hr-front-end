import React from "react";
import { SectionHeading } from "./SectionHeading";

const ExperienceForm = ({
  form,
  onChange,
  onSave,
  onCancel,
  error,
  saving,
  saveLabel,
}) => (
  <div className="cxprofile-exp-form">
    <div className="cxprofile-form-grid">
      {[
        { label: "Company", field: "company", type: "text" },
        { label: "Title", field: "title", type: "text" },
        { label: "Location", field: "location", type: "text" },
        { label: "Start date", field: "start_date", type: "date" },
      ].map(({ label, field, type }) => (
        <label key={field} className="cxprofile-form-label">
          {label}
          <input
            type={type}
            value={form[field]}
            onChange={(e) => onChange(field, e.target.value)}
            className="cxprofile-input"
          />
        </label>
      ))}

      <label className="cxprofile-form-label">
        End date
        <input
          type="date"
          value={form.end_date}
          onChange={(e) => onChange("end_date", e.target.value)}
          disabled={form.is_current}
          className="cxprofile-input"
        />
      </label>

      <label className="cxprofile-form-label cxprofile-form-label--checkbox">
        <input
          type="checkbox"
          checked={form.is_current}
          onChange={(e) => onChange("is_current", e.target.checked)}
          className="cxprofile-checkbox"
        />
        Current role
      </label>

      <label className="cxprofile-form-label cxprofile-form-label--full">
        Description
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          className="cxprofile-input cxprofile-input--textarea"
        />
      </label>
    </div>

    {error && (
      <p className="cxprofile-notice--error" style={{ marginTop: 12 }}>
        {error}
      </p>
    )}

    <div className="cxprofile-exp-form-actions">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="codexhub-btn codexhub-btn--blue"
      >
        {saving ? "Saving…" : saveLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="codexhub-btn codexhub-btn--ghost"
      >
        Cancel
      </button>
    </div>
  </div>
);

export const WorkExperienceSection = ({
  workExperiences,
  experienceToast,
  onAddClick,
  isAdding,
  experienceForm,
  onExperienceChange,
  onSaveNew,
  onCancelNew,
  experienceError,
  experienceSaving,
  editingExperienceId,
  editingExperience,
  onEditChange,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDelete,
}) => (
  <section className="cxprofile-card">
    <div className="cxprofile-section-row">
      <SectionHeading label="Work Experience" />
      <button
        type="button"
        onClick={onAddClick}
        className="codexhub-btn codexhub-btn--ghost"
        style={{ padding: "8px 16px", fontSize: 13 }}
      >
        + Add experience
      </button>
    </div>

    {experienceToast && <p className="cxprofile-toast">{experienceToast}</p>}

    {workExperiences.length ? (
      <div className="cxprofile-exp-list">
        {workExperiences.map((item) => (
          <div key={item.id} className="cxprofile-exp-item">
            {editingExperienceId === item.id && editingExperience ? (
              <ExperienceForm
                form={editingExperience}
                onChange={onEditChange}
                onSave={onEditSave}
                onCancel={onEditCancel}
                error={experienceError}
                saving={experienceSaving}
                saveLabel="Save changes"
              />
            ) : (
              <>
                <div className="cxprofile-exp-header">
                  <div>
                    <h3 className="cxprofile-exp-title">{item.title}</h3>
                    <p className="cxprofile-exp-company">
                      {item.company}
                      {item.location ? ` · ${item.location}` : ""}
                    </p>
                  </div>
                  <p className="cxprofile-exp-dates">
                    {item.start_date}
                    {item.is_current
                      ? " – Present"
                      : item.end_date
                        ? ` – ${item.end_date}`
                        : ""}
                  </p>
                </div>
                {item.description && (
                  <p className="cxprofile-exp-desc">{item.description}</p>
                )}
                <div className="cxprofile-exp-actions">
                  <button
                    type="button"
                    onClick={() => onEditStart(item)}
                    className="codexhub-btn codexhub-btn--ghost"
                    style={{ padding: "7px 14px", fontSize: 13 }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="cxprofile-btn--danger"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className="cxprofile-muted">
        Add your work history to help employers get the full picture.
      </p>
    )}

    {isAdding && (
      <ExperienceForm
        form={experienceForm}
        onChange={onExperienceChange}
        onSave={onSaveNew}
        onCancel={onCancelNew}
        error={experienceError}
        saving={experienceSaving}
        saveLabel="Save experience"
      />
    )}
  </section>
);

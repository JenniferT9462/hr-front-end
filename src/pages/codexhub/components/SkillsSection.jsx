import React from "react";
import { SectionHeading } from "./SectionHeading";

export const SkillsSection = ({
  skills,
  newSkill,
  onNewSkillChange,
  onAddSkill,
  skillMenuId,
  onToggleMenu,
  onEditStart,
  onDelete,
  editingSkillId,
  editingSkillValue,
  onEditValueChange,
  onEditSave,
  onEditCancel,
}) => (
  <section className="cxprofile-card">
    <SectionHeading label="Technical Skills" />

    <div className="cxprofile-skill-list">
      {skills.map((skill) => (
        <div key={skill.id} className="cxprofile-skill-item">
          <button
            type="button"
            onClick={() => onToggleMenu(skill.id)}
            className="cxprofile-skill-chip"
          >
            {skill.name}
          </button>
          {skillMenuId === skill.id && (
            <div className="cxprofile-skill-menu">
              <button
                type="button"
                onClick={() => onEditStart(skill)}
                className="cxprofile-skill-menu-btn"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(skill.id)}
                className="cxprofile-skill-menu-btn cxprofile-skill-menu-btn--danger"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>

    <div className="cxprofile-skill-add-row">
      <input
        value={newSkill}
        onChange={(e) => onNewSkillChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onAddSkill()}
        placeholder="Add a skill…"
        className="cxprofile-input cxprofile-input--flex"
      />
      <button
        type="button"
        onClick={onAddSkill}
        className="codexhub-btn codexhub-btn--blue"
      >
        Add
      </button>
    </div>

    {editingSkillId && (
      <div className="cxprofile-skill-add-row" style={{ marginTop: 10 }}>
        <input
          value={editingSkillValue}
          onChange={(e) => onEditValueChange(e.target.value)}
          className="cxprofile-input cxprofile-input--flex"
        />
        <button
          type="button"
          onClick={onEditSave}
          className="codexhub-btn codexhub-btn--blue"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onEditCancel}
          className="codexhub-btn codexhub-btn--ghost"
        >
          Cancel
        </button>
      </div>
    )}
  </section>
);

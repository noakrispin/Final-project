import React from "react";
import { Table } from "./Table";
import { getGrade } from "../../utils/getGrade";
import { Tooltip } from "react-tooltip";

/**
 * Option 1: Each student appears as a separate row with their grades.
 */
export const TableOption1 = ({ data, columns, onRowClick, grades, navigateToForm }) => {
  const updatedData = data.flatMap((project) =>
    project.students.map((student) => ({
      ...project,
      student: student.name,
      presentationGrade: getGrade(
        grades,
        project.projectCode,
        "presentation",
        student.name
      ),
      supervisorGrade: getGrade(
        grades,
        project.projectCode,
        "supervisor",
        student.name
      ),
    }))
  );

  const updatedColumns = columns.map((column) => {
    if (column.key === "students") {
      return {
        ...column,
        key: "student",
        header: "Student",
        render: (value) => value,
      };
    }
    if (["presentationGrade", "supervisorGrade"].includes(column.key)) {
      return {
        ...column,
        render: (value, row) => {
          const caption =
            column.key === "presentationGrade"
              ? "Grade Presentation"
              : "Grade Supervisor";
          return value !== null ? (
            value
          ) : (
            <button
              className="text-blue-500 underline"
              onClick={(e) => {
                e.stopPropagation();
                const formType =
                  column.key === "presentationGrade"
                    ? "presentation"
                    : "supervisor";
                navigateToForm(formType, row, row.student); // Pass `navigateToForm` to handle navigation
              }}
            >
              {caption}
            </button>
          );
        },
      };
    }
    return column;
  });

  return <Table data={updatedData} columns={updatedColumns} onRowClick={onRowClick} />;
};

/**
 * Option 2: Each project appears as a single row with tooltips showing individual grades.
 */
export const TableOption2 = ({ data, columns, onRowClick, grades, navigateToForm }) => {
  const updatedColumns = columns.map((column) => {
    if (["presentationGrade", "supervisorGrade"].includes(column.key)) {
      return {
        ...column,
        render: (_, project) => {
          const tooltipText = project.students
            .map(
              (student) =>
                `${student.name}: ${getGrade(
                  grades,
                  project.projectCode,
                  column.key === "presentationGrade"
                    ? "presentation"
                    : "supervisor",
                  student.name
                ) || "-"}`
            )
            .join(", ");

          const grade =
            column.key === "presentationGrade"
              ? getGrade(grades, project.projectCode, "presentation")
              : getGrade(grades, project.projectCode, "supervisor");

          const caption =
            column.key === "presentationGrade"
              ? "Grade Presentation"
              : "Grade Supervisor";

          return (
            <div className="flex justify-center">
              {grade !== null ? (
                <span
                  data-tooltip-id={`tooltip-${project.projectCode}-${column.key}`}
                  data-tooltip-content={tooltipText}
                >
                  {grade}
                </span>
              ) : (
                <button
                  className="text-blue-500 underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    const formType =
                      column.key === "presentationGrade"
                        ? "presentation"
                        : "supervisor";
                    navigateToForm(formType, project); // Pass `navigateToForm` to handle navigation
                  }}
                >
                  {caption}
                </button>
              )}
              <Tooltip id={`tooltip-${project.projectCode}-${column.key}`} />
            </div>
          );
        },
      };
    }
    return column;
  });

  return <Table data={data} columns={updatedColumns} onRowClick={onRowClick} />;
};

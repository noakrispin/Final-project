import React from "react";
import { Table } from "./Table";
import { getGrade } from "../../utils/getGrade";

/**
 * Combined Table: Each project appears as a row with student grades shown in sub-rows within each grade cell.
 */
export const CombinedTable = ({ data, columns, onRowClick, grades, navigateToForm }) => {
  // Modify data to include rows per project with sub-rows for students and their grades
  const updatedData = data.map((project) => ({
    ...project,
    grades: project.students.map((student) => ({
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
      bookGrade: getGrade(
        grades,
        project.projectCode,
        "book",
        student.name
      ),
    })),
  }));

  // Update columns to render sub-rows for grades
  const updatedColumns = columns.map((column) => {
    if (["presentationGrade", "supervisorGrade", "bookGrade"].includes(column.key)) {
      return {
        ...column,
        render: (_, project) => (
          <div>
            {project.grades.map((grade) => (
              <div key={`${project.projectCode}-${grade.student}`} className="flex justify-between">
                <span>{grade.student}</span>
                <span>
                  {grade[column.key] !== null ? (
                    grade[column.key]
                  ) : (
                    <button
                      className="text-blue-500 underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToForm(
                          column.key.replace("Grade", "").toLowerCase(),
                          project,
                          grade.student
                        );
                      }}
                    >
                      Assign Grade
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        ),
      };
    }
    return column;
  });

  return <Table data={updatedData} columns={updatedColumns} onRowClick={onRowClick} />;
};

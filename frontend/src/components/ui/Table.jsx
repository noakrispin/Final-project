import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Settings2 } from "lucide-react";
import { Button } from "./Button";
import { ColumnManagementDialog } from "./ColumnManagementDialog";
import { sortData } from "../../utils/sortData";
import SearchBar from "../shared/SearchBar";
import { getGrade } from "../../utils/getGrade";
import { Info } from "lucide-react";

const FILTERS = ["All", "Part A", "Part B"];

export const Table = ({
  data,
  apiResponse,
  columns,
  className = "",
  onRowClick,
  userId,
  showTabs = true,
  useCustomColumns = false,
  showDescription = false,
  description = "",
}) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isColumnManagementOpen, setIsColumnManagementOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map((col) => col.key)
  );

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter((item) => {
      const matchesSearch = Object.values(item).some(
        (val) =>
          typeof val === "string" &&
          val.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (selectedFilter === "All") return matchesSearch;
      return matchesSearch && item.part === selectedFilter.split(" ")[1];
    });
  }, [data, searchTerm, selectedFilter]);

  const sortedData = useMemo(() => {
    return sortData(filteredData, columns, sortColumn, sortDirection);
  }, [filteredData, sortColumn, sortDirection, columns]);

  const visibleColumnsList = columns.filter((col) =>
    visibleColumns.includes(col.key)
  );

  const handleRestoreDefaults = () => {
    setVisibleColumns(columns.map((col) => col.key));
  };

  const renderGradeCell = (project, gradeType) => {
    console.log(`Rendering grades for project: ${project.projectCode}`, project.students);
  
    // Determine the formID based on the grade type
    let formID;
    if (gradeType === "supervisor") {
      formID = "SupervisorForm";
    } else if (gradeType === "presentation") {
      formID = project.part === "A" ? "PresentationFormA" : "PresentationFormB";
    } else if (gradeType === "book") {
      formID = project.part === "A" ? "bookReviewerFormA" : "bookReviewerFormB";
    }
  
    const assignedFormID = project.evaluatorDetails?.formID;
    const isAssignedToThisForm = formID === assignedFormID;
    const isDeadlinePassed = project.deadline && new Date(project.deadline) < new Date();
  
    // If the evaluator is not assigned to this form, show "Not Assigned"
    if (!isAssignedToThisForm) {
      return <span className="text-gray-400 "> - </span>;
    }
  
    // Check if there are grades for the project
    const hasGrades = project.students.some(
      (student) => getGrade(apiResponse, formID, project.projectCode, student.id) !== null
    );
  
    // If no grades exist
    if (!hasGrades) {
      return (
        <div
          className={`text-blue-500 underline cursor-pointer ${
            isDeadlinePassed ? "text-gray-500" : ""
          }`}
          data-grade-action={JSON.stringify({ gradeType, project, formID })}
          onClick={() => {
            if (!isDeadlinePassed) {
              handleRowClick({ gradeType, project, studentName: null, formID }, true);
            }
          }}
        >
          {`Grade ${gradeType.charAt(0).toUpperCase() + gradeType.slice(1)}`}
        </div>
      );
    }
  
    // Render grades for students with grades
    return (
      <div>
        {project.students.map((student) => {
          const grade = getGrade(apiResponse, formID, project.projectCode, student.id);
  
          if (grade === null) return null; // Skip students without grades
  
          console.log(
            `Rendering grade for student: ${student.fullName}, formID: ${formID}, projectCode: ${project.projectCode}, gradeType: ${gradeType}, grade: ${grade}`
          );
  
          const metadata = {
            gradeType,
            project,
            studentName: student.fullName,
            formID,
            readOnly: isDeadlinePassed,
          };
  
          return (
            <div
              key={`${project.id}-${student.id}`}
              className="flex justify-start items-center gap-2"
            >
              <span>{student.fullName}:</span>
              <span>
                <span
                  data-grade-action={JSON.stringify(metadata)}
                  className={`underline cursor-pointer ${
                    isDeadlinePassed ? "text-gray-500" : "text-blue-500"
                  }`}
                  onClick={() => handleRowClick(metadata, true)}
                >
                  {grade}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    );
  };
  
  

  return (
<div className="space-y-4">
  {showTabs && (
    <div className="flex flex-wrap items-center justify-between mb-4 px-6 gap-y-4">
      {/* Filters (Tabs) */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 rounded-full text-base font-medium ${
              selectedFilter === filter
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex-shrink-0 w-full md:w-auto">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search"
          className="w-full"
        />
      </div>
    </div>
  )}
  
  {/* Description */}
  {showDescription && description && (
    <div className="flex-grow flex justify-normal">
      <div className="flex items-center space-x-2 text-green-600">
        <Info className="w-4 h-4" />
        <span className="text-base">{description}</span>
      </div>
    </div>
  )}

  {/* Table */}
  <div
    className={`w-full overflow-auto rounded-lg border border-[#e5e7eb] bg-white ${className}`}
    onClick={(e) => {
      const gradeAction = e.target.closest("[data-grade-action]");
      if (gradeAction) {
        const metadata = JSON.parse(gradeAction.dataset.gradeAction);
        e.stopPropagation();
        onRowClick(metadata, true);
      }
    }}
  >
    <div className="min-w-full align-middle">
      <table className="min-w-full divide-y divide-[#e5e7eb]">
        <thead>
          <tr className="bg-white">
            {visibleColumnsList.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`relative px-6 py-4 text-center text-base font-medium text-[#313131] ${
                  column.sortable ? "cursor-pointer select-none" : ""
                } group`}
              >
                <div
                  className="flex items-center gap-2"
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  {column.header}
                  {column.sortable && (
                    <span className="inline-flex flex-col">
                      <ChevronUp
                        className={`h-3 w-3 ${
                          sortColumn === column.key && sortDirection === "asc"
                            ? "text-[#313131]"
                            : "text-gray-300"
                        }`}
                      />
                      <ChevronDown
                        className={`h-3 w-3 -mt-1 ${
                          sortColumn === column.key && sortDirection === "desc"
                            ? "text-[#313131]"
                            : "text-gray-300"
                        }`}
                      />
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb] bg-white">
          {sortedData.map((project, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onRowClick(project)}
            >
              {visibleColumnsList.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 text-base text-[#686b80]"
                >
                  {useCustomColumns && column.key.includes("Grade")
                    ? renderGradeCell(
                        project,
                        column.key.replace("Grade", "").toLowerCase()
                      )
                    : column.render
                    ? column.render(project[column.key], project)
                    : project[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  <div className="flex justify-end">
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsColumnManagementOpen(true)}
      className="bg-white hover:white text-blue-500"
    >
      <Settings2 className="mr-2 h-4 w-4" />
      Show/Hide Columns
    </Button>
  </div>

  <ColumnManagementDialog
    isOpen={isColumnManagementOpen}
    onClose={() => setIsColumnManagementOpen(false)}
    columns={columns}
    visibleColumns={visibleColumns}
    onApply={setVisibleColumns}
    onRestore={handleRestoreDefaults}
  />
</div>
  );
};

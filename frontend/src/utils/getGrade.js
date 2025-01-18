export const getGrade = (evaluationsMapped, projectCode, studentId) => {
  if (!evaluationsMapped || !projectCode || !studentId) {
    console.warn("Invalid arguments to getGrade:", {
      evaluationsMapped,
      projectCode,
      studentId,
    });
    return null;
  }

  // Get the grades for the specific projectCode
  const projectGrades = evaluationsMapped[projectCode];
  if (!projectGrades) {
    console.warn(`No grades found for projectCode: ${projectCode}`);
    return null;
  }

  // Return the grade for the specific studentId
  const grade = projectGrades[studentId];
  if (grade === undefined) {
    console.warn(`No grade found for studentId: ${studentId} in projectCode: ${projectCode}`);
    return null;
  }

  return grade;
};

export const getGrade = (apiData, projectCode, studentId) => {
  if (!Array.isArray(apiData)) {
    console.warn("Invalid API data:", apiData);
    return null;
  }

  // Transform the API response into the expected evaluationsMapped format
  const evaluationsMapped = apiData.reduce((mapped, evaluation) => {
    if (!evaluation.projectCode || !evaluation.grades) {
      console.warn("Skipping invalid evaluation:", evaluation);
      return mapped;
    }

    // Map projectCode to grades
    mapped[evaluation.projectCode] = evaluation.grades;
    return mapped;
  }, {});

  console.log("Evaluations Mapped in getGrade:", evaluationsMapped);

  // Check if evaluationsMapped has the projectCode
  if (!evaluationsMapped[projectCode]) {
    console.warn(`No grades found for projectCode: ${projectCode}`);
    return null;
  }

  // Find the specific grade for the studentId
  const grade = evaluationsMapped[projectCode][studentId];
  if (grade === undefined) {
    console.warn(`No grade found for studentId: ${studentId} in projectCode: ${projectCode}`);
    return null;
  }
  console.log("GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGrade:", grade);
  return grade;
};

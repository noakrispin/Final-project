export const getGrade = (evaluations, formID, projectCode, studentId) => {
  console.log("getGrade called with:", { evaluations, formID, projectCode, studentId });

  if (!Array.isArray(evaluations)) {
    console.error("Invalid evaluations data:", evaluations);
    return null;
  }

  // Find the evaluation matching the formID and projectCode
  const evaluation = evaluations.find(
    (item) => item.formID === formID && item.projectCode === projectCode
  );

  if (!evaluation) {
    console.warn(
      `No evaluation found for formID: ${formID} and projectCode: ${projectCode}`
    );
    return null;
  }

  console.log("Matching evaluation found:", evaluation);

  // Check if grades exist for this evaluation
  if (!evaluation.grades) {
    console.warn(
      `No grades found for evaluation: ${JSON.stringify(evaluation)}`
    );
    return null;
  }

  // Return the grade for the specific student
  const grade = evaluation.grades[studentId];
  if (grade === undefined) {
    console.warn(
      `No grade found for studentId: ${studentId} in evaluation: ${JSON.stringify(
        evaluation
      )}`
    );
    return null;
  }

  console.log(
    `Grade found for studentId: ${studentId}, formID: ${formID}, grade: ${grade}`
  );
  return grade;
};

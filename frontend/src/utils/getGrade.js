export const getGrade = (grades, projectCode, gradeType, studentId, evaluatorId) => {
    const projectGrades = grades[projectCode];
    if (!projectGrades) return null;
  
    const formGrades = Object.values(projectGrades).find(
      (form) => form[studentId] && form[studentId].evaluatorID === evaluatorId
    );
  
    return formGrades ? formGrades[studentId]?.weighted_grade || null : null;
  };
  
export const getGrade = (grades, projectCode, gradeType, studentName = null) => {
    const projectGrades = grades.find((g) => g.projectCode === projectCode);
    if (!projectGrades) return null;

    // Handle presentation grades
    if (gradeType === "presentation") {
        const presentationGrades =
            projectGrades.presentationReviewerFormA?.[0] ||
            projectGrades.presentationReviewerFormB?.[0];

        if (!presentationGrades) {
            // If no grades exist, return null to show "Grade Presentation"
            return null;
        }

        if (studentName) {
            // Return the specific student's presentation grade
            const studentGrade = [
                presentationGrades.student1Grade,
                presentationGrades.student2Grade,
            ].find((student) => student?.name === studentName);

            // Attempt to use both `.grade` and `.Knowledge` to cover all scenarios
            return studentGrade
                ? studentGrade.grade || studentGrade.Knowledge || null
                : null;
        }

        // Return the total presentation grade
        return presentationGrades.projectGrade || null;
    }

    // Handle supervisor grades
    if (gradeType === "supervisor") {
        const supervisorGrades = projectGrades.supervisorForm;
        if (!supervisorGrades) {
            // If no supervisor grades exist, return null
            return null;
        }

        if (studentName) {
            // Return the specific student's supervisor grade
            const studentGrade = [
                supervisorGrades.student1Grade,
                supervisorGrades.student2Grade,
            ].find((student) => student?.name === studentName);

            // Return the student's `independentLearning` grade
            return studentGrade ? studentGrade.independentLearning || null : null;
        }

        // Return the total supervisor grade
        return supervisorGrades.projectGrade || null;
    }

    return null; // Default fallback for unknown grade types
};

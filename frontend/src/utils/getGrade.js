export const getGrade = (grades, projectCode, gradeType, studentName = null) => {
    const projectGrades = grades.find((g) => g.projectCode === projectCode);
    if (!projectGrades) return null;

    // Handle presentation grades
    if (gradeType === "presentation") {
        const presentationGrades =
            projectGrades.presentationReviewerFormA?.[0] ||
            projectGrades.presentationReviewerFormB?.[0];

        if (!presentationGrades) {
            return null;
        }

        if (studentName) {
            const studentGrade = [
                presentationGrades.student1Grade,
                presentationGrades.student2Grade,
            ].find((student) => student?.name === studentName);

            return studentGrade
                ? studentGrade.grade || studentGrade.Knowledge || null
                : null;
        }

        return presentationGrades.projectGrade || null;
    }

    // Handle supervisor grades
    if (gradeType === "supervisor") {
        const supervisorGrades = projectGrades.supervisorForm;
        if (!supervisorGrades) {
            return null;
        }

        if (studentName) {
            const studentGrade = [
                supervisorGrades.student1Grade,
                supervisorGrades.student2Grade,
            ].find((student) => student?.name === studentName);

            return studentGrade ? studentGrade.independentLearning || null : null;
        }

        return supervisorGrades.projectGrade || null;
    }

    // Handle book grades
    if (gradeType === "book") {
        const bookGrades =
            projectGrades.bookReviewerFormA || projectGrades.bookReviewerFormB;

        if (!bookGrades) {
            return null;
        }

        return bookGrades.projectGrade || null;
    }

    return null; // Default fallback for unknown grade types
};

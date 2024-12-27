import myProject from '../data/myProject.json';
import mockUsers from '../data/mockUsers.json';
import grades from '../data/grades.json';
import questions from '../data/formsQuestions.json';

export const api = {
  getProjects: async () => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return myProject.map(project => ({
      ...project,
      presentationGrade: project.presentationGrade || null,
      supervisorGrade: project.supervisorGrade || null,
      bookGrade: project.bookGrade || null,
    }));
  },

  getGrades: async () => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return grades;
  },

  getUsers: async () => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUsers;
  },

  getTasks: async () => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Derive tasks from projects
    return myProject.flatMap(project => [
      { id: `${project.id}-grade`, title: `Grade ${project.title}`, deadline: project.deadline, priority: 'high', type: 'grading', projectId: project.id },
      { id: `${project.id}-feedback`, title: `Provide Feedback for ${project.title}`, deadline: project.deadline, priority: 'high', type: 'feedback', projectId: project.id }
    ]);
  },

  addTask: async (newTask) => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const tasks = await api.getTasks();
    const task = { ...newTask, id: Math.max(...tasks.map(t => parseInt(t.id))) + 1 };
    tasks.push(task);
    return task;
  },

  getGrade: async (projectCode, gradeType) => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const projectGrades = grades.find(g => g.projectCode === projectCode);
    if (!projectGrades) return null;

    switch (gradeType) {
      case 'presentation':
        const presentationGrades = projectGrades.presentationReviewerFormA || projectGrades.presentationReviewerFormB;
        return presentationGrades?.length > 0 ? presentationGrades[0] : null;
      case 'supervisor':
        return projectGrades.supervisorForm || null;
      case 'book':
        return projectGrades.bookReviewerFormA || projectGrades.bookReviewerFormB || null;
      default:
        return null;
    }
  },
  getFormData: async (projectCode, formType) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  
    const projectGrades = grades.find((g) => g.projectCode === projectCode);
    if (!projectGrades) return null;
  
    switch (formType) {
      case 'presentationFormA':
        return projectGrades.presentationReviewerFormA?.[0] || null;
      case 'presentationFormB':
        return projectGrades.presentationReviewerFormB?.[0] || null;
      case 'supervisorForm':
        return projectGrades.supervisorForm || null;
      case 'bookReviewFormA':
        return projectGrades.bookReviewerFormA || null;
      case 'bookReviewFormB':
        return projectGrades.bookReviewerFormB || null;
      default:
        throw new Error('Invalid form type');
    }
  },
  updateProjectNote: async (projectId, note) => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real implementation, this would be a DB call
    const project = myProject.find(p => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    project.specialNotes = note;
    
    return {
      success: true,
      data: { id: projectId, specialNotes: note }
    };
  },
  
  submitForm: async (formType, formData) => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Handle form submission logic here
    return { success: true };
  },

  getQuestions: async (formType) => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return questions.filter(question => question.form === formType);
  },

  updateQuestions: async (updatedQuestions) => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real implementation, you would save the updated questions to the database here
    Object.assign(questions, updatedQuestions);
    return { success: true };
  },
  getProjectAnswers: async () => {
    // Simulate an API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Fetch answers from the JSON
    const answers = await import("../data/projectAnswers.json");
    return answers.default;
  },
  

  getAdminQuestions: async () => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return questions; // Replace with actual data fetching logic
  },

  updateAdminQuestions: async (updatedQuestions) => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real implementation, you would save the updated questions to the database here
    Object.assign(questions, updatedQuestions);
    return { success: true };
  }
  
};
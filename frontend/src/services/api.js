import myProject from '../data/myProject.json';
import mockUsers from '../data/mockUsers.json';
import grades from '../data/grades.json';

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

    const updatedGrades = [...grades];
    const projectCode = formData.projectCodeAndName.split(' - ')[0];

    // Find or create the grade entry
    let gradeEntry = updatedGrades.find(g => g.projectCode === projectCode);
    if (!gradeEntry) {
      gradeEntry = {
        id: updatedGrades.length + 1,
        projectCode,
        part: formData.part || 'A',
        supervisorForm: null,
        bookReviewerFormA: null,
        bookReviewerFormB: null,
        presentationReviewerFormA: [],
        presentationReviewerFormB: []
      };
      updatedGrades.push(gradeEntry);
    }

    // Update the grade entry based on the form type
    switch (formType) {
      case 'presentationFormA':
      case 'presentationFormB':
        const presentationForm = {
          projectGrade: parseInt(formData.overallScore),
          student1Grade: {
            name: formData.student1Name,
            grade: parseInt(formData.student1Knowledge)
          },
          student2Grade: {
            name: formData.student2Name,
            grade: parseInt(formData.student2Knowledge)
          },
          comments: formData.additionalComments,
          submissionDate: new Date().toISOString()
        };
        
        const formKey = formType === 'presentationFormA' 
          ? 'presentationReviewerFormA' 
          : 'presentationReviewerFormB';
        
        // Replace existing entry or add new one
        if (gradeEntry[formKey].length > 0) {
          gradeEntry[formKey][0] = presentationForm;
        } else {
          gradeEntry[formKey].push(presentationForm);
        }
        break;

      case 'supervisorForm':
        gradeEntry.supervisorForm = {
          projectGrade: parseInt(formData.overallScore),
          analysisAndSolution: parseInt(formData.analysisAndSolution),
          projectDeliverables: parseInt(formData.projectDeliverables),
          generalEvaluation: parseInt(formData.generalEvaluation),
          student1Grade: {
            name: formData.student1Name,
            independentLearning: parseInt(formData.student1IndependentLearning),
            teamwork: parseInt(formData.student1Teamwork),
            attitude: parseInt(formData.student1Attitude)
          },
          student2Grade: {
            name: formData.student2Name,
            independentLearning: parseInt(formData.student2IndependentLearning),
            teamwork: parseInt(formData.student2Teamwork),
            attitude: parseInt(formData.student2Attitude)
          },
          comments: formData.additionalComments,
          submissionDate: new Date().toISOString()
        };
        break;

      case 'bookReviewFormA':
      case 'bookReviewFormB':
        const bookReviewForm = {
          projectGrade: parseInt(formData.overallScore),
          comments: formData.additionalComments,
          submissionDate: new Date().toISOString()
        };
        
        if (formType === 'bookReviewFormA') {
          gradeEntry.bookReviewerFormA = bookReviewForm;
        } else {
          gradeEntry.bookReviewerFormB = bookReviewForm;
        }
        break;

      default:
        throw new Error('Invalid form type');
    }

    // Update the grades array
    const index = updatedGrades.findIndex(g => g.projectCode === projectCode);
    if (index !== -1) {
      updatedGrades[index] = gradeEntry;
    }
    

    // In a real application, you would save the updated grades to the database here
    Object.assign(grades, updatedGrades);

    return { success: true, message: 'Form submitted successfully' };
  }

  
};
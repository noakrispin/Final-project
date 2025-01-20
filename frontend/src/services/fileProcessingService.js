import ExcelJS from 'exceljs';

export const processExcelFile = async (file) => {
  try {
    const data = await readExcelFile(file);
    const validatedData = validateData(data);
    return validatedData.map((row, index) => ({
      id: row.projectCode,
      projectCode: row.projectCode,
      title: row.title,
      description: row.description || '',
      deadline: null,
      specialNotes: null,
      personalNotes: null,
      gitLink: null, // Explicitly set null for fields to be edited later
      Student1: {
        firstName: row.student1firstName,
        lastName: row.student1lastName,
        fullName: row.student1firstName + ' ' + row.student1lastName,
        ID: row.student1Id,
        Email: row.student1Email,
      },
      Student2: row.student2firstName
        ? {
          firstName: row.student2firstName,
          lastName: row.student2lastName,
          fullName: row.student2firstName + ' ' + row.student2lastName,
          ID: row.student2Id,
          Email: row.student2Email,
        }
        : null,
      supervisor1: row.supervisor1,
      supervisor2: row.supervisor2 || '',
      part: row.part,
      type: row.type,
      createdAt: new Date().toISOString(),
    }));
  } catch (error) {
    throw new Error(`Error processing file: ${error.message}`);
  }
};

const readExcelFile = async (file) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('No worksheet found in the Excel file');
  }

  const data = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const rowData = {
        projectCode: row.getCell(1).text.trim(),
        student1firstName: row.getCell(2).text.trim(),
        student1lastName: row.getCell(3).text.trim(),
        student1Id: row.getCell(4).text.trim(),
        student1Email: row.getCell(5).text.trim(),
        student2firstName: row.getCell(6).text.trim(),
        student2lastName: row.getCell(7).text.trim(),
        student2Id: row.getCell(8).text.trim() || '',
        student2Email: row.getCell(9).text.trim() || '',
        supervisor1: row.getCell(10).text.trim(),
        supervisor2: row.getCell(11).text.trim() || '',
        title: row.getCell(12).text.trim(),
        description: row.getCell(13).text.trim() || '',
        part: row.getCell(14).text.trim(),
        type: row.getCell(15).text.trim()
      };
      data.push(rowData);
    }
  });

  return data;
};

const validateData = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No valid data found in file');
  }

  return data.map((row, index) => {
    if (
      !row.projectCode ||
      !row.student1firstName ||
      !row.student1lastName ||
      !row.student1Id ||
      !row.student1Email ||
      !row.supervisor1 ||
      !row.title ||
      !row.part ||
      !row.type
    ) {
      throw new Error(`Missing required data in row ${index + 1}`);
    }

    const emailRegex = /^[^\s@]+@e\.braude\.ac\.il$/;
    if (!emailRegex.test(row.student1Email)) {
      throw new Error(`Invalid email format for Student 1 in row ${index + 1}`);
    }
    if (row.student2Email && !emailRegex.test(row.student2Email)) {
      throw new Error(`Invalid email format for Student 2 in row ${index + 1}`);
    }

    const idRegex = /^\d{9}$/;
    if (!idRegex.test(row.student1Id)) {
      throw new Error(`Invalid student ID format for Student 1 in row ${index + 1}`);
    }
    if (row.student2Id && !idRegex.test(row.student2Id)) {
      throw new Error(`Invalid student ID format for Student 2 in row ${index + 1}`);
    }
    if (!idRegex.test(row.supervisor1)) {
      throw new Error(`Invalid supervisor ID format for supervisor 1 in row ${index + 1}`);
    }
    if (row.supervisor2 && !idRegex.test(row.supervisor2)) {
      throw new Error(`Invalid supervisor ID format for supervisor 2 in row ${index + 1}`);
    }

    return row;
  });
};

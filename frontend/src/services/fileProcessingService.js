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
      gitLink: null, // Explicitly set null for fields to be edited later
      student1: {
        name: row.student1Name,
        id: row.student1Id,
        email: row.student1Email,
      },
      student2: row.student2Name
        ? {
            name: row.student2Name,
            id: row.student2Id,
            email: row.student2Email,
          }
        : null,
      supervisor1: row.supervisor1,
      supervisor2: row.supervisor2 || '',
      part: row.part,
      type: row.type,
      status: 'pending',
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
        student1Name: row.getCell(2).text.trim(),
        student1Id: row.getCell(3).text.trim(),
        student1Email: row.getCell(4).text.trim(),
        student2Name: row.getCell(5).text.trim() || '',
        student2Id: row.getCell(6).text.trim() || '',
        student2Email: row.getCell(7).text.trim() || '',
        supervisor1: row.getCell(8).text.trim(),
        supervisor2: row.getCell(9).text.trim() || '',
        title: row.getCell(10).text.trim(),
        description: row.getCell(11).text.trim() || '',
        part: row.getCell(12).text.trim(),
        type: row.getCell(13).text.trim()
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
      !row.student1Name ||
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

    return row;
  });
};

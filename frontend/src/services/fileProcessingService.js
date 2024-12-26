import ExcelJS from 'exceljs';

/**
 * Reads and processes an uploaded Excel file.
 */
export const processExcelFile = async (file) => {
  try {
    const data = await readExcelFile(file);
    const validatedData = validateData(data);
    return validatedData.map((row, index) => ({
      id: `uploaded-${Date.now()}-${index}`,
      projectCode: row.projectCode,
      title: row.title,
      description: row.description || '',
      student1: {
        name: row.student1Name,
        id: row.student1Id,
        email: row.student1Email
      },
      student2: row.student2Name
        ? {
            name: row.student2Name,
            id: row.student2Id,
            email: row.student2Email
          }
        : null,
      supervisor1: row.supervisor1,
      supervisor2: row.supervisor2 || '',
      part: row.part,
      type: row.type,
      status: 'pending',
      createdAt: new Date().toISOString()
    }));
  } catch (error) {
    throw new Error(`Error processing file: ${error.message}`);
  }
};

/**
 * Exports data to an Excel file for download.
 */
export const exportToExcelFile = async (data, filename = 'Exported_Data.xlsx') => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Grades');

    // Add headers
    worksheet.columns = Object.keys(data[0]).map((key) => ({
      header: key,
      key: key,
      width: 20,
    }));

    // Add data rows
    data.forEach((row) => {
      worksheet.addRow(row);
    });

    // Generate and download the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Trigger download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  } catch (error) {
    console.error('Error exporting to Excel:', error);
  }
};

/**
 * Reads an uploaded Excel file.
 */
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
      // Skip header row
      const rowData = {
        projectCode: row.getCell(1).text || '',
        student1Name: row.getCell(2).text || '',
        student1Id: row.getCell(3).text || '',
        student1Email: row.getCell(4).text || '',
        student2Name: row.getCell(5).text || '',
        student2Id: row.getCell(6).text || '',
        student2Email: row.getCell(7).text || '',
        supervisor1: row.getCell(8).text || '',
        supervisor2: row.getCell(9).text || '',
        title: row.getCell(10).text || '',
        description: row.getCell(11).text || '',
        part: row.getCell(12).text || '',
        type: row.getCell(13).text || ''
      };
      data.push(rowData);
    }
  });

  return data;
};

/**
 * Validates Excel data for correctness.
 */
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

    // Email format validation
    const emailRegex = /^[^\s@]+@e\.braude\.ac\.il$/;
    if (!emailRegex.test(row.student1Email)) {
      throw new Error(`Invalid email format for Student 1 in row ${index + 1}`);
    }
    if (row.student2Email && !emailRegex.test(row.student2Email)) {
      throw new Error(`Invalid email format for Student 2 in row ${index + 1}`);
    }

    // Student ID validation (9 digits)
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

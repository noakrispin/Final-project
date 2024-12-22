export const sortData = (data, columns, sortColumn, sortDirection) => {
  if (!sortColumn) return data;

  const column = columns.find((col) => col.key === sortColumn);
  const sortFn = column?.sortFunction;

  return [...data].sort((a, b) => {
    if (sortFn) {
      return sortDirection === 'asc' ? sortFn(a, b) : -sortFn(a, b);
    }

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    // Handle sorting for Students column (arrays)
    if (Array.isArray(aValue) && Array.isArray(bValue)) {
      const aJoined = aValue.join(', ').toLowerCase();
      const bJoined = bValue.join(', ').toLowerCase();
      return sortDirection === 'asc'
        ? aJoined.localeCompare(bJoined)
        : bJoined.localeCompare(aJoined);
    }

    // Handle sorting for numeric values (e.g., Grades)
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Handle sorting for mixed Hebrew and English strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue, 'he', { sensitivity: 'base' })
        : bValue.localeCompare(aValue, 'he', { sensitivity: 'base' });
    }

    // Handle sorting for alphanumeric values (e.g., Project Code)
    const aString = aValue?.toString().toLowerCase() || '';
    const bString = bValue?.toString().toLowerCase() || '';
    const aNumericPart = parseFloat(aString.replace(/\D/g, '')) || 0;
    const bNumericPart = parseFloat(bString.replace(/\D/g, '')) || 0;

    if (aNumericPart !== bNumericPart) {
      return sortDirection === 'asc'
        ? aNumericPart - bNumericPart
        : bNumericPart - aNumericPart;
    }

    return sortDirection === 'asc'
      ? aString.localeCompare(bString)
      : bString.localeCompare(aString);
  });
};

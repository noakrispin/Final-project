import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * This component renders a calendar with the ability to navigate between months.
 * It highlights the current day, selected day, and days with tasks.
 * 
 * Props:
 * - tasks: Array of task objects, each containing a deadline date.
 * - selectedDate: The currently selected date.
 * - setSelectedDate: Function to update the selected date.
 */
export const Calendar = ({ tasks = [], selectedDate, setSelectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  /**
   * Returns the number of days in the given month.
   * @param {Date} date - The date object representing the month.
   * @returns {number} - The number of days in the month.
   */
  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  /**
   * Returns the day of the week of the first day of the given month.
   * @param {Date} date - The date object representing the month.
   * @returns {number} - The day of the week (0-6) of the first day of the month.
   */
  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  /**
   * Renders the calendar for the current month.
   * @returns {JSX.Element[]} - An array of table rows representing the weeks of the month.
   */
  const renderCalendar = () => {
    const days = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);
    const weeks = [];
    let week = [];

    // Fill in the days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      week.push(<td key={`empty-${i}`} className="p-2"></td>);
    }

    // Fill in the days of the month
    for (let day = 1; day <= days; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const hasTasks = tasks.some(
        (task) => new Date(task.deadline).toDateString() === date.toDateString()
      );

      week.push(
        <td
          key={day}
          className={`p-2 text-center cursor-pointer relative ${
            isToday ? 'bg-blue-500 text-white' : isSelected ? 'bg-blue-200' : ''
          } hover:bg-blue-100 rounded-full`}
          onClick={() => setSelectedDate(date)}
        >
          {day}
          {hasTasks && (
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></span>
          )}
        </td>
      );

      // Start a new week after every 7 days or at the end of the month
      if ((firstDay + day) % 7 === 0 || day === days) {
        weeks.push(<tr key={day}>{week}</tr>);
        week = [];
      }
    }

    return weeks;
  };

  /**
   * Changes the current month by the given increment.
   * @param {number} increment - The number of months to change (positive or negative).
   */
  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-primary">Calendar</h2>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-1">
          <ChevronLeft />
        </button>
        <h3 className="text-lg font-medium">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={() => changeMonth(1)} className="p-1">
          <ChevronRight />
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <th key={day} className="p-2">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderCalendar()}</tbody>
      </table>
    </div>
  );
};

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Calendar = ({ tasks = [], selectedDate, setSelectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const days = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);
    const weeks = [];
    let week = [];

    for (let i = 0; i < firstDay; i++) {
      week.push(<td key={`empty-${i}`} className="p-2"></td>);
    }

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

      if ((firstDay + day) % 7 === 0 || day === days) {
        weeks.push(<tr key={day}>{week}</tr>);
        week = [];
      }
    }

    return weeks;
  };

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

'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./Button";
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from "lucide-react";
import { useState } from "react";

/**
 * This component renders a dialog for managing the visibility of table columns.
 * It allows users to move columns between available and displayed lists.
 * 
 * Props:
 * - isOpen: Boolean indicating if the dialog is open.
 * - onClose: Function to call when the dialog is closed.
 * - columns: Array of all column objects.
 * - visibleColumns: Array of keys of the currently visible columns.
 * - onApply: Function to call when the apply button is clicked.
 * - onRestore: Function to call when the restore button is clicked.
 */
export function ColumnManagementDialog({
  isOpen,
  onClose,
  columns,
  visibleColumns,
  onApply,
  onRestore,
}) {
  const [availableColumns, setAvailableColumns] = useState(
    columns.filter((col) => !visibleColumns.includes(col.key))
  );
  const [selectedAvailable, setSelectedAvailable] = useState([]);
  const [displayedColumns, setDisplayedColumns] = useState(
    columns.filter((col) => visibleColumns.includes(col.key))
  );
  const [selectedDisplayed, setSelectedDisplayed] = useState([]);

  /**
   * Moves selected or all available columns to the displayed list.
   * @param {boolean} all - If true, move all available columns; otherwise, move selected columns.
   */
  const moveToDisplayed = (all = false) => {
    const toMove = all
      ? availableColumns
      : availableColumns.filter((col) =>
          selectedAvailable.includes(col.key)
        );
    setDisplayedColumns([...displayedColumns, ...toMove]);
    setAvailableColumns(
      availableColumns.filter(
        (col) => !toMove.map((c) => c.key).includes(col.key)
      )
    );
    setSelectedAvailable([]);
  };

  /**
   * Moves selected or all displayed columns to the available list.
   * @param {boolean} all - If true, move all displayed columns; otherwise, move selected columns.
   */
  const moveToAvailable = (all = false) => {
    const toMove = all
      ? displayedColumns
      : displayedColumns.filter((col) =>
          selectedDisplayed.includes(col.key)
        );
    setAvailableColumns([...availableColumns, ...toMove]);
    setDisplayedColumns(
      displayedColumns.filter(
        (col) => !toMove.map((c) => c.key).includes(col.key)
      )
    );
    setSelectedDisplayed([]);
  };

  /**
   * Handles applying the changes and closing the dialog.
   */
  const handleApply = () => {
    onApply(displayedColumns.map((col) => col.key));
    onClose();
  };

  /**
   * Handles restoring the default column visibility and closing the dialog.
   */
  const handleRestore = () => {
    onRestore();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[500px] h-auto mx-auto mt-10 bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle>Show/Hide Columns</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Select the columns you want to display or hide from the table. Use the arrows to move columns between the lists.
          </p>
        </DialogHeader>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-6 p-4">
          {/* Displayed Columns */}
          <div className="border rounded-lg bg-gray-50">
            <div className="bg-gray-100 p-3 text-sm font-semibold text-gray-600 border-b">
              Displayed Columns
            </div>
            <div className="h-[200px] overflow-auto p-3 space-y-2">
              {displayedColumns.map((column) => (
                <div
                  key={column.key}
                  className={`p-2 cursor-pointer rounded ${
                    selectedDisplayed.includes(column.key)
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => {
                    setSelectedDisplayed(
                      selectedDisplayed.includes(column.key)
                        ? selectedDisplayed.filter((key) => key !== column.key)
                        : [...selectedDisplayed, column.key]
                    );
                  }}
                >
                  {column.header}
                </div>
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-col items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => moveToAvailable(false)} // Moves a single column from Displayed to Available
              disabled={selectedDisplayed.length === 0}
            >
              <ChevronRight className="h-4 w-4" /> {/* Single arrow pointing right */}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => moveToAvailable(true)} // Moves all columns from Displayed to Available
              disabled={displayedColumns.length === 0}
            >
              <ChevronsRight className="h-4 w-4" /> {/* Double arrow pointing right */}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => moveToDisplayed(false)} // Moves a single column from Available to Displayed
              disabled={selectedAvailable.length === 0}
            >
              <ChevronLeft className="h-4 w-4" /> {/* Single arrow pointing left */}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => moveToDisplayed(true)} // Moves all columns from Available to Displayed
              disabled={availableColumns.length === 0}
            >
              <ChevronsLeft className="h-4 w-4" /> {/* Double arrow pointing left */}
            </Button>
          </div>

          {/* Available Columns */}
          <div className="border rounded-lg bg-gray-50">
            <div className="bg-gray-100 p-3 text-sm font-semibold text-gray-600 border-b">
              Available Columns
            </div>
            <div className="h-[200px] overflow-auto p-3 space-y-2">
              {availableColumns.map((column) => (
                <div
                  key={column.key}
                  className={`p-2 cursor-pointer rounded ${
                    selectedAvailable.includes(column.key)
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => {
                    setSelectedAvailable(
                      selectedAvailable.includes(column.key)
                        ? selectedAvailable.filter((key) => key !== column.key)
                        : [...selectedAvailable, column.key]
                    );
                  }}
                >
                  {column.header}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-4">
          <div className="space-x-2">
            <Button
              onClick={handleApply}
              className="bg-blue-500 text-white hover:bg-blue-600 text-sm"
            >
              Apply
            </Button>
            <Button
              onClick={onClose}
              className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm"
            >
              Cancel
            </Button>
          </div>
          <Button
            onClick={handleRestore}
            className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm"
          >
            Restore Defaults
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

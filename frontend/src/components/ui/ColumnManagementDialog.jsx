'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog"
import { Button } from "./Button"
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react'
import { useState } from "react"

export function ColumnManagementDialog({ 
  isOpen, 
  onClose, 
  columns,
  visibleColumns,
  onApply,
  onRestore
}) {
  const [availableColumns, setAvailableColumns] = useState(
    columns.filter(col => !visibleColumns.includes(col.key))
  );
  const [selectedAvailable, setSelectedAvailable] = useState([]);
  const [displayedColumns, setDisplayedColumns] = useState(
    columns.filter(col => visibleColumns.includes(col.key))
  );
  const [selectedDisplayed, setSelectedDisplayed] = useState([]);

  const moveToDisplayed = (all = false) => {
    const toMove = all ? availableColumns : availableColumns.filter(col => 
      selectedAvailable.includes(col.key)
    );
    setDisplayedColumns([...displayedColumns, ...toMove]);
    setAvailableColumns(availableColumns.filter(col => 
      !toMove.map(c => c.key).includes(col.key)
    ));
    setSelectedAvailable([]);
  };

  const moveToAvailable = (all = false) => {
    const toMove = all ? displayedColumns : displayedColumns.filter(col => 
      selectedDisplayed.includes(col.key)
    );
    setAvailableColumns([...availableColumns, ...toMove]);
    setDisplayedColumns(displayedColumns.filter(col => 
      !toMove.map(c => c.key).includes(col.key)
    ));
    setSelectedDisplayed([]);
  };

  const handleApply = () => {
    onApply(displayedColumns.map(col => col.key));
    onClose();
  };

  const handleRestore = () => {
    onRestore();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Show/Hide Columns</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 p-4">
          {/* Available Columns */}
          <div className="border rounded-lg">
            <div className="bg-gray-50 p-2 text-sm font-medium border-b">
              Available Columns
            </div>
            <div className="h-[300px] overflow-auto p-2">
              {availableColumns.map((column) => (
                <div
                  key={column.key}
                  className={`p-2 cursor-pointer rounded ${
                    selectedAvailable.includes(column.key)
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedAvailable(
                      selectedAvailable.includes(column.key)
                        ? selectedAvailable.filter(key => key !== column.key)
                        : [...selectedAvailable, column.key]
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
              onClick={() => moveToDisplayed(false)}
              disabled={selectedAvailable.length === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => moveToDisplayed(true)}
              disabled={availableColumns.length === 0}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => moveToAvailable(false)}
              disabled={selectedDisplayed.length === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => moveToAvailable(true)}
              disabled={displayedColumns.length === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Displayed Columns */}
          <div className="border rounded-lg">
            <div className="bg-gray-50 p-2 text-sm font-medium border-b">
              Displayed Columns
            </div>
            <div className="h-[300px] overflow-auto p-2">
              {displayedColumns.map((column) => (
                <div
                  key={column.key}
                  className={`p-2 cursor-pointer rounded ${
                    selectedDisplayed.includes(column.key)
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedDisplayed(
                      selectedDisplayed.includes(column.key)
                        ? selectedDisplayed.filter(key => key !== column.key)
                        : [...selectedDisplayed, column.key]
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
          <Button variant="outline" onClick={handleRestore}>
            Restore Defaults
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


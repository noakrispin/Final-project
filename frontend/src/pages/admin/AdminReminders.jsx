import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { BlurElements } from "../../components/shared/BlurElements"

// Dummy data - replace with actual data from your backend
const initialProjects = [
  {
    projectCode: "24-2-D-1",
    supervisor: "Dr. Renata Avros",
    presentationGrade: "-",
    bookGrade: "-",
    supervisorGrade: "-",
    status: "Haven't Graded",
    lastReminder: "19/9/24",
  },
  {
    projectCode: "24-2-D-11",
    supervisor: "Dr. Naomi Unkelos-Shpigel",
    presentationGrade: "90",
    bookGrade: "-",
    supervisorGrade: "95",
    status: "Partially Graded",
    lastReminder: "9/9/24",
  },
]

const AdminReminders = () => {
  const [selectedDate, setSelectedDate] = useState(null)
  const [filters, setFilters] = useState({
    fullyGraded: false,
    partiallyGraded: true,
    notGraded: true,
  })
  const [selectedProjects, setSelectedProjects] = useState([])
  const [showCalendar, setShowCalendar] = useState(false)

  const handleSendReminder = () => {
    // Implement reminder sending logic
    console.log("Sending reminders for:", selectedProjects)
  }

  const handleScheduleClick = () => {
    setShowCalendar(true)
  }

  const handleSendNow = () => {
    if (selectedProjects.length === 0) {
      alert("Please select at least one project to send reminders")
      return
    }
    handleSendReminder()
  }

  return (
    <div className="relative bg-white min-h-screen">
      <BlurElements />
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Remind to submit grades</h1>
            <p className="text-gray-500 mt-2">
              Send reminders to users who have not yet submitted grades for the selected project
            </p>
            <p className="text-gray-500">Final grades submission 7/11/2024</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter</CardTitle>
              <CardDescription>Grade state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={filters.fullyGraded}
                    onChange={(e) => setFilters((prev) => ({ ...prev, fullyGraded: e.target.checked }))}
                  />
                  <span>Fully Graded</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={filters.partiallyGraded}
                    onChange={(e) => setFilters((prev) => ({ ...prev, partiallyGraded: e.target.checked }))}
                  />
                  <span>Partially Graded</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={filters.notGraded}
                    onChange={(e) => setFilters((prev) => ({ ...prev, notGraded: e.target.checked }))}
                  />
                  <span>Haven't Graded</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Projects Table */}
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left">Project Code</th>
                      <th className="p-4 text-left">Supervisor</th>
                      <th className="p-4 text-left">Presentation Grade</th>
                      <th className="p-4 text-left">Book Grade</th>
                      <th className="p-4 text-left">Supervisor Grade</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-left">Last Reminder</th>
                      <th className="p-4 text-left">Send Reminder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialProjects.map((project) => (
                      <tr key={project.projectCode} className="border-b">
                        <td className="p-4">{project.projectCode}</td>
                        <td className="p-4">{project.supervisor}</td>
                        <td className="p-4">{project.presentationGrade}</td>
                        <td className="p-4">{project.bookGrade}</td>
                        <td className="p-4">{project.supervisorGrade}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${
                              project.status === "Haven't Graded"
                                ? "bg-red-100 text-red-800"
                                : project.status === "Partially Graded"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td className="p-4">{project.lastReminder}</td>
                        <td className="p-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedProjects.includes(project.projectCode)}
                            onChange={(e) => {
                              setSelectedProjects((prev) =>
                                e.target.checked
                                  ? [...prev, project.projectCode]
                                  : prev.filter((p) => p !== project.projectCode),
                              )
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Reminder */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Schedule reminder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleSendNow}>
                  Send now
                </Button>
                <Button variant="outline" onClick={handleScheduleClick}>
                  Schedule reminder
                </Button>
              </div>
              {/* We'll add the Calendar component back once we see its implementation */}
            </CardContent>
          </Card>

          {/* Reminder Preview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Reminder message preview</CardTitle>
            </CardHeader>
            <CardContent className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600">Dear {"{user name}"},</p>
              <p className="text-gray-600 mt-2">
                This is a reminder that you have not yet submitted your grades for the {"{project name}"}.
              </p>
              <p className="text-gray-600 mt-2">Please do so at your earliest convenience.</p>
              <Button className="mt-4" onClick={handleSendReminder}>
                Send Reminder
              </Button>
            </CardContent>
          </Card>

          {/* Reminder History */}
          <Card>
            <CardHeader>
              <CardTitle>Reminder history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {[
                  "Reminder sent on Sep 19, 2024 at 10:00 AM",
                  "Reminder sent on Sep 10, 2024 at 9:00 AM",
                  "Reminder sent on Sep 1, 2024 at 11:00 AM",
                ].map((reminder, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-600 rounded-full" />
                    <p className="text-gray-600">{reminder}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminReminders


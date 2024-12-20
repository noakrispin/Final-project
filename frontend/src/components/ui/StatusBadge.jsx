import { Card } from '../ui/Card';

export function ProjectStats({ totalProjects }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-semibold">Total Projects</h2>
          <p className="text-3xl font-bold text-blue-600">{totalProjects}</p>
        </div>
      </Card>
    </div>
  );
}

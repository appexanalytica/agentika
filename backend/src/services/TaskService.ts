import Task, { ITask } from '../models/Task';

class TaskService {
  async createTask(data: {
    title: string;
    description?: string;
    status?: 'pendiente' | 'en_curso' | 'hecho';
    priority?: 'alta' | 'media' | 'baja';
    dueDate: Date;
    assignedTo?: string;
    tags?: string[];
  }): Promise<ITask> {
    const task = new Task({
      title: data.title,
      description: data.description || null,
      status: data.status || 'pendiente',
      priority: data.priority || 'media',
      dueDate: data.dueDate,
      assignedTo: data.assignedTo || null,
      tags: data.tags || [],
    });

    await task.save();
    return task;
  }

  async getAllTasks(status?: string, priority?: string): Promise<ITask[]> {
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    return await Task.find(query).sort({ createdAt: -1 });
  }

  async getTaskById(id: string): Promise<ITask | null> {
    return await Task.findById(id);
  }

  async updateTask(id: string, data: Partial<ITask>): Promise<ITask | null> {
    return await Task.findByIdAndUpdate(id, data, { new: true });
  }

  async toggleTaskStatus(id: string): Promise<ITask | null> {
    const task = await Task.findById(id);
    if (!task) return null;
    
    const newStatus = task.status === 'hecho' ? 'pendiente' : 'hecho';
    return await Task.findByIdAndUpdate(id, { status: newStatus }, { new: true });
  }

  async deleteTask(id: string): Promise<void> {
    await Task.findByIdAndDelete(id);
  }
}

export default new TaskService();

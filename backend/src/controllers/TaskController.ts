import { Request, Response, NextFunction } from 'express';
import TaskService from '../services/TaskService';
import { body } from 'express-validator';

export const createTaskValidationRules = () => [
  body('title').notEmpty().trim(),
  body('dueDate').isISO8601(),
  body('priority').optional().isIn(['alta', 'media', 'baja']),
  body('status').optional().isIn(['pendiente', 'en_curso', 'hecho']),
];

export class TaskController {
  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        title, 
        description, 
        status, 
        priority, 
        dueDate, 
        assignedTo,
        tags 
      } = req.body;

      const task = await TaskService.createTask({
        title,
        description,
        status,
        priority,
        dueDate: new Date(dueDate),
        assignedTo,
        tags,
      });

      res.status(201).json({
        message: 'Task created successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string;
      const priority = req.query.priority as string;

      const tasks = await TaskService.getAllTasks(status, priority);

      res.status(200).json({
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;

      const task = await TaskService.getTaskById(taskId);

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.status(200).json({
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;
      const updateData = req.body;

      const task = await TaskService.updateTask(taskId, updateData);

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.status(200).json({
        message: 'Task updated successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleTaskStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;

      const task = await TaskService.toggleTaskStatus(taskId);

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.status(200).json({
        message: 'Task status toggled successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;

      await TaskService.deleteTask(taskId);

      res.status(200).json({
        message: 'Task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TaskController();

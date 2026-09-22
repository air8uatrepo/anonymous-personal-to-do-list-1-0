export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export type CreateTaskInput = {
  title: string;
};

export type TaskRepository = {
  list(visitorId: string): Promise<Task[]>;
  create(visitorId: string, title: string): Promise<Task>;
  setCompleted(visitorId: string, taskId: string, completed: boolean): Promise<Task | null>;
  remove(visitorId: string, taskId: string): Promise<boolean>;
};

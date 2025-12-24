export const getTaskPoints = (taskId: string, ratingByTask: Map<string, number>) => {
  return ratingByTask.get(taskId) || 1;
};

export const sumTaskPoints = (taskIds: string[], ratingByTask: Map<string, number>) => {
  return taskIds.reduce((total, taskId) => total + getTaskPoints(taskId, ratingByTask), 0);
};

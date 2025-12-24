import { useState } from 'react';
import { Settings, LogOut, Users, ChevronRight, CalendarDays, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import type { CompletionEvent, Task, UserProfile } from '../domain/models';
import { getDayKey, isTaskCompletedInPeriod, isTaskCompletedToday } from '../domain/logic';
import { getTaskPoints } from '../domain/points';

interface ProfileScreenProps {
  currentUser: UserProfile;
  householdUsers: UserProfile[];
  tasks: Task[];
  completionEvents: CompletionEvent[];
  onResetCompletions: () => void;
  onResetTasks: () => void;
  onRemoveMember: (userId: string) => void;
  onLogout: () => void;
}

export default function ProfileScreen({
  currentUser,
  householdUsers,
  tasks,
  completionEvents,
  onResetCompletions,
  onResetTasks,
  onRemoveMember,
  onLogout,
}: ProfileScreenProps) {
  const [activeMonth, setActiveMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDayKey, setSelectedDayKey] = useState(() => getDayKey(new Date()));

  const monthStart = new Date(activeMonth.getFullYear(), activeMonth.getMonth(), 1);
  const monthEnd = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 0);
  const leadingEmpty = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();
  const calendarCells = Array.from({ length: leadingEmpty + daysInMonth }, (_, index) => {
    if (index < leadingEmpty) return null;
    return new Date(activeMonth.getFullYear(), activeMonth.getMonth(), index - leadingEmpty + 1);
  });

  const ratingByTask = new Map(tasks.map((task) => [task.id, task.rating || 1]));
  const stats = new Map<string, Map<string, { count: number; points: number; taskIds: string[] }>>();
  const latestStatusByDay = new Map<string, Map<string, CompletionEvent>>();

  completionEvents.forEach((event) => {
    const dayKey = getDayKey(new Date(event.occurredAt));
    const userTaskKey = `${event.userId}:${event.taskId}`;
    const dayMap = latestStatusByDay.get(dayKey) || new Map();
    const existing = dayMap.get(userTaskKey);
    if (!existing || new Date(event.occurredAt) > new Date(existing.occurredAt)) {
      dayMap.set(userTaskKey, event);
    }
    latestStatusByDay.set(dayKey, dayMap);
  });

  latestStatusByDay.forEach((dayMap, dayKey) => {
    const userStats = new Map<string, { count: number; points: number; taskIds: string[] }>();
    dayMap.forEach((event) => {
      if (!event.completed) return;
      const current = userStats.get(event.userId) || { count: 0, points: 0, taskIds: [] };
      const points = getTaskPoints(event.taskId, ratingByTask);
      userStats.set(event.userId, {
        count: current.count + 1,
        points: current.points + points,
        taskIds: [...current.taskIds, event.taskId],
      });
    });
    if (userStats.size > 0) {
      stats.set(dayKey, userStats);
    }
  });

  const selectedStats = selectedDayKey ? stats.get(selectedDayKey) : null;
  const tasksById = new Map(tasks.map((task) => [task.id, task]));
  const selectedDateLabel = selectedDayKey
    ? new Date(selectedDayKey).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : '';

  const weeklyTasks = tasks.filter((task) => task.frequency === 'weekly');
  const dailyTasks = tasks.filter((task) => task.frequency === 'daily');
  const weeklyCompleted = weeklyTasks.filter((task) =>
    isTaskCompletedInPeriod(task.id, currentUser.id, 'weekly', completionEvents)
  ).length;
  const weeklyPercent = weeklyTasks.length > 0
    ? Math.round((weeklyCompleted / weeklyTasks.length) * 100)
    : 0;

  const dailyCompleted = dailyTasks.filter((task) =>
    isTaskCompletedToday(task.id, currentUser.id, completionEvents)
  ).length;

  const totalTasks = weeklyTasks.length + dailyTasks.length;
  const totalCompleted = weeklyCompleted + dailyCompleted;
  const totalPercent = totalTasks > 0
    ? Math.round((totalCompleted / totalTasks) * 100)
    : 0;

  const monthKey = (date: Date) =>
    `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
  const currentMonthKey = monthKey(new Date());
  const monthlyTotals = new Map<string, { count: number; points: number }>();
  const latestMonthStatus = new Map<string, CompletionEvent>();

  completionEvents.forEach((event) => {
    if (monthKey(new Date(event.occurredAt)) !== currentMonthKey) return;
    const eventDayKey = getDayKey(new Date(event.occurredAt));
    const userTaskKey = `${event.userId}:${event.taskId}:${eventDayKey}`;
    const existing = latestMonthStatus.get(userTaskKey);
    if (!existing || new Date(event.occurredAt) > new Date(existing.occurredAt)) {
      latestMonthStatus.set(userTaskKey, event);
    }
  });

  latestMonthStatus.forEach((event) => {
    if (!event.completed) return;
    const current = monthlyTotals.get(event.userId) || { count: 0, points: 0 };
    const points = getTaskPoints(event.taskId, ratingByTask);
    monthlyTotals.set(event.userId, {
      count: current.count + 1,
      points: current.points + points,
    });
  });

  return (
    <div className="p-6 pb-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 mb-6 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl bg-white/20 backdrop-blur-sm"
          >
            {currentUser.avatar}
          </div>
          <div>
            <h1 className="text-white mb-1">{currentUser.name}</h1>
            <p className="text-blue-100">{currentUser.email}</p>
          </div>
        </div>
        <div
          className="w-full h-1 rounded-full bg-white/30"
        >
          <div
            className="h-full rounded-full bg-white"
            style={{
              width: `${totalPercent}%`,
              backgroundColor: currentUser.color,
            }}
          />
        </div>
        <div className="text-blue-100 mt-2 text-sm">
          <div>
            Daily: {dailyTasks.length > 0 ? Math.round((dailyCompleted / dailyTasks.length) * 100) : 0}%
          </div>
          <div>
            Weekly: {weeklyPercent}%
          </div>
        </div>
      </div>

      {/* Household Members */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gray-600" />
          <h2 className="text-gray-900">Household Members</h2>
        </div>
        <div className="space-y-3">
          {householdUsers.map((user) => (
            <div
              key={user.id}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                user.id === currentUser.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ backgroundColor: user.color + '20' }}
              >
                {user.avatar}
              </div>
              <div className="flex-1">
                <div className="text-gray-900 flex items-center gap-2">
                  {user.name}
                  {user.id === currentUser.id && (
                    <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                      You
                    </span>
                  )}
                </div>
                <div className="text-gray-500">{user.email}</div>
              </div>
              {currentUser.role === 'admin' && user.id !== currentUser.id && (
                <button
                  onClick={() => {
                    if (confirm(`Remove ${user.name} from household?`)) {
                      onRemoveMember(user.id);
                    }
                  }}
                  className="px-3 py-1 text-xs rounded-full border border-red-200 text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Daily History */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-gray-600" />
          <h2 className="text-gray-900">Daily History</h2>
        </div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() =>
              setActiveMonth(
                new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1)
              )
            }
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="text-gray-900">
            {activeMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <button
            onClick={() =>
              setActiveMonth(
                new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1)
              )
            }
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronRightIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-[10px] text-gray-400 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 auto-rows-[4.5rem]">
          {calendarCells.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="h-full" />;
            }
            const dayKey = getDayKey(day);
            const dayStats = stats.get(dayKey);
            const isSelected = dayKey === selectedDayKey;
            return (
              <button
                key={dayKey}
                onClick={() => setSelectedDayKey(dayKey)}
                className={`h-full rounded-2xl border text-center px-1 py-1 transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="text-xs text-gray-600 font-medium leading-tight">{day.getDate()}</div>
                <div className="mt-1 space-y-1">
                  {householdUsers.map((user) => {
                    const userStats = dayStats?.get(user.id);
                    const count = userStats?.count || 0;
                    return (
                      <div key={user.id} className="flex items-center justify-center gap-1 text-[10px] text-gray-600 leading-tight">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: user.color }}
                        />
                        <span>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="text-sm text-gray-900 mb-3">
            {selectedDateLabel || 'Select a day'}
          </div>
          {selectedDayKey && selectedStats ? (
            <div className="space-y-3">
              {householdUsers.map((user) => {
                const userStats = selectedStats.get(user.id);
                const count = userStats?.count || 0;
                const points = userStats?.points || 0;
                const taskTitles = (userStats?.taskIds || [])
                  .map((taskId) => tasksById.get(taskId))
                  .filter(Boolean)
                  .map((task) => `${task?.title} (${task?.rating || 1} star)`);

                return (
                  <div key={user.id}>
                    <div className="flex items-center gap-2 text-sm text-gray-800">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: user.color }}
                      />
                      <span>{user.name}</span>
                      <span className="text-gray-400">-</span>
                      <span>{count} tasks</span>
                      <span className="text-gray-400">-</span>
                      <span>{points} pts</span>
                    </div>
                    {taskTitles.length > 0 ? (
                      <div className="mt-1 text-xs text-gray-600">
                        {taskTitles.join(', ')}
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-gray-400">No completions</div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-gray-400">No completions for this day.</div>
          )}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-gray-600" />
          <h2 className="text-gray-900">Monthly Summary</h2>
        </div>
        <div className="space-y-3">
          {householdUsers.map((user) => {
            const totals = monthlyTotals.get(user.id) || { count: 0, points: 0 };
            return (
              <div key={user.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: user.color }}
                  />
                  <span className="text-gray-900">{user.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {totals.count} tasks - {totals.points} pts
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Actions */}
      {currentUser.role === 'admin' && (
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <h2 className="text-gray-900 mb-4">Admin Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => {
                if (confirm('Reset all completion history and uncheck tasks?')) {
                  onResetCompletions();
                }
              }}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
            >
              Reset Completions
            </button>
            <button
              onClick={() => {
                if (confirm('Reset tasks to defaults? This will delete all tasks and re-seed.')) {
                  onResetTasks();
                }
              }}
              className="w-full py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all"
            >
              Reset Tasks to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
        <button
          onClick={() => alert('Settings are coming soon.')}
          className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Settings className="w-5 h-5 text-gray-600" />
          </div>
          <span className="flex-1 text-left text-gray-900">Settings</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-gray-400">HouseTask v1.0</p>
        <p className="text-gray-400">Manage your household together</p>
      </div>
    </div>
  );
}

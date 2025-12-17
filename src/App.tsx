import { useState } from 'react';
import { Plus, Filter, Check, ArrowUpDown, LayoutGrid, CalendarDays, Archive, Timer } from 'lucide-react';
import { Button } from './components/ui/Button';
import { cn } from './lib/utils';
import { Board } from './components/Board';
import { CalendarView } from './components/CalendarView';
import { ArchiveModal } from './components/ArchiveModal';
import { NewTaskModal } from './components/NewTaskModal';
import { PomodoroTimer } from './components/PomodoroTimer';
import { ProgressBar } from './components/ProgressBar';
import { UndoToast } from './components/UndoToast';
import { useTasks } from './hooks/useTasks';
import { type Task, type TaskStatus, type TaskPriority, type Subtask } from './types';

function App() {
  // useTasks hook is destructured above
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  // Filter State
  const [filterOpen, setFilterOpen] = useState(false);
  const [deadlineFilter, setDeadlineFilter] = useState<'all' | 'today' | 'overdue' | 'custom'>('all');
  const [customFilterValue, setCustomFilterValue] = useState<number>(3);
  const [customFilterUnit, setCustomFilterUnit] = useState<'days' | 'hours'>('days');
  const [tagFilters, setTagFilters] = useState<string[]>([]);

  // Sort State
  const [sortOpen, setSortOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState<'manual' | 'deadline' | 'priority' | 'newest'>('manual');

  // View State
  const [viewMode, setViewMode] = useState<'board' | 'calendar'>('board');

  // Archive State
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  // Timer State
  const [isTimerVisible, setIsTimerVisible] = useState(false);

  const {
    tasks,
    setTasks,
    tags,
    addTag,
    deleteTag,
    addTask,
    updateTask,
    deleteTask,
    toggleSubtask,
    showUndoToast,
    restoreDeletedTask,
    closeUndoToast,
    archiveDoneTasks,
    archiveTask,
    restoreArchivedTask,
    deleteTaskForever,
    handleTaskCompletion
  } = useTasks();

  const activeTasks = tasks.filter(t => !t.isArchived);
  const archivedTasks = tasks.filter(t => t.isArchived);

  // Stats for Progress Bar (based on active tasks)
  const completedTasks = activeTasks.filter(t => t.status === 'done').length;

  const filteredTasks = activeTasks.filter(task => {
    // Tag Filter
    // Multi-select: If tags are selected, task tag must be one of them.
    if (tagFilters.length > 0 && (!task.tagId || !tagFilters.includes(task.tagId))) return false;

    // Deadline Filter
    if (deadlineFilter === 'all') return true;
    if (!task.deadline) return false;

    const taskDate = new Date(task.deadline).getTime();
    const taskDateDay = new Date(task.deadline).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    const now = Date.now();

    if (deadlineFilter === 'today') {
      return taskDateDay === today;
    }
    if (deadlineFilter === 'overdue') {
      return taskDateDay < today;
    }
    if (deadlineFilter === 'custom') {
      const multiplier = customFilterUnit === 'days' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
      const cutoff = now + (customFilterValue * multiplier);
      // Show tasks that are NOT overdue (future) AND within the cutoff
      return taskDate >= now && taskDate <= cutoff;
    }
    return true;
  });

  // Sort Logic... (Same as before but using filteredTasks which is derived from activeTasks)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (currentSort === 'manual') return 0; // Keep current order

    if (currentSort === 'deadline') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }

    if (currentSort === 'priority') {
      const pMap = { high: 3, medium: 2, low: 1 };
      return (pMap[b.priority] || 1) - (pMap[a.priority] || 1);
    }

    if (currentSort === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const handleTaskSubmit = (title: string, description: string, deadline: string, status: TaskStatus, tagId?: string, priority: TaskPriority = 'medium', subtasks: Subtask[] = []) => {
    if (editingTask) {
      updateTask(editingTask.id, {
        title,
        description,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        status,
        tagId,
        priority,
        subtasks
      });
    } else {
      addTask(title, description, deadline, status, tagId, priority, subtasks);
    }
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-cafe-50 text-stone-900 font-sans flex flex-col relative">
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-stone-800 to-stone-600 bg-clip-text text-transparent">
              My Workspace
            </h1>
            <button
              onClick={() => setIsArchiveOpen(true)}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors relative group"
              title="View Archive"
            >
              <Archive className="w-5 h-5" />
              {archivedTasks.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border border-white" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            <div className="h-8 w-8 bg-stone-800 rounded-lg flex items-center justify-center text-white font-bold text-lg pointer-events-none select-none">
              K
            </div>
            <h1 className="text-xl font-bold tracking-tight text-stone-800">My Tasks</h1>
          </div>

          <div className="flex-1 px-8 hidden md:block">
            <ProgressBar totalTasks={tasks.length} completedTasks={completedTasks} />
          </div>
          {/* Toolbar Container */}
          <div className="flex items-center justify-between w-full mt-4">
            {/* Left Side: Controls */}
            <div className="flex items-center gap-2">
              {/* Filter Menu */}
              <div className="relative">
                <Button variant="secondary" onClick={() => setFilterOpen(!filterOpen)} className={cn("gap-2", (deadlineFilter !== 'all' || tagFilters.length > 0) && "bg-stone-200 border-stone-300")}>
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                  {(deadlineFilter !== 'all' || tagFilters.length > 0) && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 sm:right-auto sm:top-1 sm:-right-1 border border-white" />
                  )}
                </Button>

                {filterOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 p-4 z-20 animate-in fade-in slide-in-from-top-2">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-stone-800 text-sm">Filters</h3>
                        {(deadlineFilter !== 'all' || tagFilters.length > 0) && (
                          <button
                            onClick={() => { setDeadlineFilter('all'); setTagFilters([]); }}
                            className="text-xs text-rose-500 hover:text-rose-600 font-medium"
                          >
                            Clear all
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Deadline Section */}
                        <div>
                          <label className="text-xs font-semibold text-stone-500 mb-2 block uppercase tracking-wider">Deadline</label>
                          <div className="flex flex-col gap-1">
                            {[
                              { id: 'all', label: 'All Tasks' },
                              { id: 'today', label: 'Today' },
                              { id: 'overdue', label: 'Overdue' },
                              { id: 'custom', label: 'Within...' }
                            ].map(opt => (
                              <div key={opt.id}>
                                <button
                                  onClick={() => setDeadlineFilter(opt.id as any)}
                                  className={cn(
                                    "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors w-full",
                                    deadlineFilter === opt.id ? "bg-stone-100 text-stone-900 font-medium" : "text-stone-600 hover:bg-stone-50"
                                  )}
                                >
                                  {opt.label}
                                  {deadlineFilter === opt.id && <Check className="w-3 h-3" />}
                                </button>

                                {/* Custom Inputs */}
                                {opt.id === 'custom' && deadlineFilter === 'custom' && (
                                  <div className="mt-2 ml-4 flex items-center gap-2 animate-in slide-in-from-top-1 fade-in duration-200">
                                    <span className="text-xs text-stone-500">Within</span>
                                    <input
                                      type="number"
                                      min="1"
                                      value={customFilterValue}
                                      onChange={(e) => setCustomFilterValue(Math.max(1, parseInt(e.target.value) || 0))}
                                      className="w-12 px-1 py-0.5 text-sm border border-stone-300 rounded focus:border-stone-500 outline-none text-center bg-stone-50"
                                    />
                                    <select
                                      value={customFilterUnit}
                                      onChange={(e) => setCustomFilterUnit(e.target.value as 'days' | 'hours')}
                                      className="text-sm border border-stone-300 rounded py-0.5 px-1 bg-stone-50 focus:border-stone-500 outline-none"
                                    >
                                      <option value="days">Days</option>
                                      <option value="hours">Hours</option>
                                    </select>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tags Section */}
                        <div>
                          <label className="text-xs font-semibold text-stone-500 mb-2 block uppercase tracking-wider">Tags</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setTagFilters([])}
                              className={cn(
                                "px-2 py-1.5 rounded-md text-xs border text-center transition-colors truncate",
                                tagFilters.length === 0 ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                              )}
                            >
                              All Tags
                            </button>
                            {tags.map(tag => {
                              const isSelected = tagFilters.includes(tag.id);
                              return (
                                <button
                                  key={tag.id}
                                  onClick={() => {
                                    setTagFilters(prev =>
                                      isSelected
                                        ? prev.filter(id => id !== tag.id)
                                        : [...prev, tag.id]
                                    );
                                  }}
                                  className={cn(
                                    "px-2 py-1.5 rounded-md text-xs border text-center transition-colors truncate",
                                    isSelected ? "border-transparent text-white" : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                                  )}
                                  style={isSelected ? { backgroundColor: tag.color } : undefined}
                                >
                                  {tag.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Sort Menu */}
              <div className="relative">
                <Button variant="secondary" onClick={() => setSortOpen(!sortOpen)} className={cn("gap-2", currentSort !== 'manual' && "bg-stone-200 border-stone-300")}>
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Sort</span>
                  {currentSort !== 'manual' && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-2 right-2 sm:right-auto sm:top-1 sm:-right-1 border border-white" />
                  )}
                </Button>

                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-200 p-2 z-20 animate-in fade-in slide-in-from-top-2">
                      <div className="flex flex-col gap-1">
                        {[
                          { id: 'manual', label: 'Manual Order' },
                          { id: 'deadline', label: 'Deadline' },
                          { id: 'priority', label: 'Priority' },
                          { id: 'newest', label: 'Newest' }
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => { setCurrentSort(opt.id as any); setSortOpen(false); }}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                              currentSort === opt.id ? "bg-stone-100 text-stone-900 font-medium" : "text-stone-600 hover:bg-stone-50"
                            )}
                          >
                            {opt.label}
                            {currentSort === opt.id && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="h-6 w-px bg-stone-200 mx-2 hidden sm:block" />

              {/* View Toggle */}
              <div className="flex bg-stone-100 p-1 rounded-lg border border-stone-200">
                <button
                  onClick={() => setViewMode('board')}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    viewMode === 'board' ? "bg-white text-stone-800 shadow-sm" : "text-stone-400 hover:text-stone-600"
                  )}
                  title="Board View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    viewMode === 'calendar' ? "bg-white text-stone-800 shadow-sm" : "text-stone-400 hover:text-stone-600"
                  )}
                  title="Calendar View"
                >
                  <CalendarDays className="w-4 h-4" />
                </button>
              </div>

              {/* Timer Toggle */}
              <button
                onClick={() => setIsTimerVisible(!isTimerVisible)}
                className={cn(
                  "p-1.5 rounded-md transition-all ml-2 border border-stone-200",
                  isTimerVisible ? "bg-white text-rose-500 shadow-sm" : "bg-stone-100 text-stone-400 hover:text-stone-600"
                )}
                title="Toggle Timer"
              >
                <Timer className="w-4 h-4" />
              </button>
            </div>

            {/* Right Side: Add Button */}
            <Button onClick={() => { setEditingTask(undefined); setIsModalOpen(true); }}>
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 overflow-hidden flex flex-col">
        <div className="md:hidden w-full mb-6">
          <ProgressBar totalTasks={tasks.length} completedTasks={completedTasks} />
        </div>

        {viewMode === 'board' ? (
          <Board
            tasks={sortedTasks}
            tags={tags}
            setTasks={setTasks}
            onDeleteTask={deleteTask}
            onTaskDoubleClick={handleEditTask}
            onToggleSubtask={toggleSubtask}
            onArchiveDone={archiveDoneTasks}
            onArchiveTask={archiveTask}
            onTaskComplete={handleTaskCompletion}
          />
        ) : (
          <CalendarView
            tasks={sortedTasks}
            tags={tags}
            onTaskClick={handleEditTask}
          />
        )}
      </main>



      <PomodoroTimer
        className={isTimerVisible ? "" : "hidden"}
        onClose={() => setIsTimerVisible(false)}
      />
      <UndoToast
        message="Task deleted"
        isVisible={showUndoToast}
        onUndo={restoreDeletedTask}
        onClose={closeUndoToast}
      />

      {
        isArchiveOpen && (
          <ArchiveModal
            tasks={archivedTasks}
            tags={tags}
            onRestore={restoreArchivedTask}
            onDeleteForever={deleteTaskForever}
            onClose={() => setIsArchiveOpen(false)}
          />
        )
      }
      <NewTaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={handleTaskSubmit}
        tags={tags}
        onAddTag={addTag}
        onDeleteTag={deleteTag}
        initialData={editingTask}
      />
    </div >
  )
}

export default App;



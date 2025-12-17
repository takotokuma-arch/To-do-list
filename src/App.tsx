import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './components/ui/Button';
import { Board } from './components/Board';
import { NewTaskModal } from './components/NewTaskModal';
import { useTasks } from './hooks/useTasks';

function App() {
  const { tasks, setTasks, addTask, deleteTask } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cafe-50 text-stone-900 font-sans flex flex-col">
      <header className="bg-white border-b border-stone-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-stone-800 rounded-lg flex items-center justify-center text-white font-bold text-lg pointer-events-none select-none">
              K
            </div>
            <h1 className="text-xl font-bold tracking-tight text-stone-800">My Tasks</h1>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 overflow-hidden">
        <Board tasks={tasks} setTasks={setTasks} onDeleteTask={deleteTask} />
      </main>

      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addTask}
      />
    </div>
  )
}

export default App


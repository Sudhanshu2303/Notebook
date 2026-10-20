import { Navigate, Route, Routes } from 'react-router-dom';
import Flash from './components/Flash.jsx';
import Nav from './components/Nav.jsx';
import Journal from './pages/Journal.jsx';
import JournalEditor from './pages/JournalEditor.jsx';
import Todo from './pages/Todo.jsx';

export default function App() {
  return (
    <div className="app">
      <Nav />
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/journal" replace />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/new" element={<JournalEditor />} />
          <Route path="/journal/:id" element={<JournalEditor />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="*" element={<Navigate to="/journal" replace />} />
        </Routes>
      </main>
      <Flash />
    </div>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Quiz from './pages/Quiz';
import Submissions from './pages/Submissions';
import Questions from './pages/Questions';
import Users from './pages/Users';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/courses" />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/quiz/:id" element={<Quiz />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/submissions" element={<Submissions />} />
          <Route path="/users" element={<Users />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

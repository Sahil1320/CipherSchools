import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AssignmentListPage } from './pages/AssignmentListPage.jsx'
import { AssignmentAttemptPage } from './pages/AssignmentAttemptPage.jsx'
import { Navbar } from './components/Navbar.jsx'
import { Footer } from './components/Footer.jsx'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="app-shell__main">
          <Routes>
            <Route path="/" element={<AssignmentListPage />} />
            <Route path="/assignments/:id" element={<AssignmentAttemptPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App

import { Link, Outlet } from '@tanstack/react-router'
import './App.css'

const App = () => {
  return (
    <div className="app-shell">
      <header className="navbar navbar-expand-sm navbar-dark bg-dark shadow-sm">
        <div className="container">
          <Link
            to="/"
            className="navbar-brand"
          >
            Task Manager
          </Link>
          <nav className="collapse navbar-collapse show">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link
                  to="/"
                  className="nav-link"
                  activeProps={{ className: 'nav-link active' }}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/tasks/new"
                  className="nav-link"
                  activeProps={{ className: 'nav-link active' }}
                >
                  Create Task
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="app-main">
        <div className="container py-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default App

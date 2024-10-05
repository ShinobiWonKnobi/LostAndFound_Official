import React from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Header: React.FC = () => {
  const { token, isAdmin, setToken, setIsAdmin } = useAuth();

  const handleLogout = () => {
    setToken(null);
    setIsAdmin(false);
  };

  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">College Lost &amp; Found</Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:text-blue-200">Home</Link></li>
            <li><Link to="/report-lost-item" className="hover:text-blue-200">Report Lost Item</Link></li>
            {isAdmin && <li><Link to="/admin" className="hover:text-blue-200">Admin</Link></li>}
            {!token && (
              <>
                <li><Link to="/login" className="hover:text-blue-200">Login</Link></li>
                <li><Link to="/register" className="hover:text-blue-200">Register</Link></li>
              </>
            )}
            {token && <li><button onClick={handleLogout} className="hover:text-blue-200">Logout</button></li>}
          </ul>
        </nav>
        <div className="relative">
          <input
            type="text"
            placeholder="Search lost items"
            className="pl-8 pr-2 py-1 rounded text-black"
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>
    </header>
  )
}

export default Header
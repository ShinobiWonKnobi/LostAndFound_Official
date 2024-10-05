import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, Edit, Trash2 } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

interface Item {
  _id: string;
  name: string;
  category: string;
  status: string;
  date: string;
}

const AdminDashboard: React.FC = () => {
  const [items, setItems] = useState<Item[]>([])
  const [showFound, setShowFound] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/items', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setItems(response.data)
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const toggleFoundVisibility = () => {
    setShowFound(!showFound)
  }

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setItems(items.filter(item => item._id !== id))
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/items/${id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setItems(items.map(item => 
        item._id === id ? { ...item, status: newStatus } : item
      ))
    } catch (error) {
      console.error('Error updating item status:', error)
    }
  }

  const filteredItems = showFound ? items : items.filter(item => item.status === 'Lost')

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <button
          onClick={toggleFoundVisibility}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
        >
          {showFound ? <EyeOff className="mr-2" size={18} /> : <Eye className="mr-2" size={18} />}
          {showFound ? 'Hide Found Items' : 'Show Found Items'}
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2">Item</th>
            <th className="text-left p-2">Category</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(item => (
            <tr key={item._id} className="border-b">
              <td className="p-2">{item.name}</td>
              <td className="p-2">{item.category}</td>
              <td className="p-2">
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(item._id, e.target.value)}
                  className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'Found' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                  }`}
                >
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </td>
              <td className="p-2">{new Date(item.date).toLocaleDateString()}</td>
              <td className="p-2">
                <button className="text-blue-600 hover:text-blue-800 mr-2">
                  <Edit size={18} />
                </button>
                <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(item._id)}>
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminDashboard
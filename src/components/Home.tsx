import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Search } from 'lucide-react'
import axios from 'axios'

interface LostItem {
  _id: string;
  name: string;
  category: string;
  lastSeen: string;
  description: string;
}

const Home: React.FC = () => {
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLostItems();
  }, []);

  const fetchLostItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/items');
      setLostItems(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch lost items. Please try again later.');
      setLostItems([]);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/search?query=${searchQuery}`);
      setLostItems(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to search lost items. Please try again later.');
      setLostItems([]);
    }
  };

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to the College Lost &amp; Found Portal</h1>
        <p className="text-xl">Help us reunite lost items with their owners!</p>
      </section>
      
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Search className="mx-auto mb-2" size={48} />
            <h3 className="font-semibold">Search</h3>
            <p>Look for your lost item in our database</p>
          </div>
          <div className="text-center">
            <AlertCircle className="mx-auto mb-2" size={48} />
            <h3 className="font-semibold">Report</h3>
            <p>Can't find your item? Report it as lost</p>
          </div>
          <div className="text-center">
            <svg className="mx-auto mb-2" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 className="font-semibold">Get Notified</h3>
            <p>We'll contact you if your item is found</p>
          </div>
        </div>
      </section>
      
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Search Lost Items</h2>
        <div className="flex mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for lost items"
            className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition duration-300"
          >
            Search
          </button>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="space-y-4">
          {lostItems.map((item) => (
            <div key={item._id} className="border p-4 rounded-md">
              <h3 className="font-semibold">{item.name}</h3>
              <p>Category: {item.category}</p>
              <p>Last Seen: {item.lastSeen}</p>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      <section className="text-center">
        <Link to="/report-lost-item" className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300">
          Report a Lost Item
        </Link>
      </section>
    </div>
  )
}

export default Home
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface Luggage {
  id: string;
  tag_number: string;
  description: string;
  status: string;
  current_location: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [luggage, setLuggage] = useState<Luggage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchLuggage() {
      const { data, error } = await supabase
        .from('luggage')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching luggage:', error);
        return;
      }

      setLuggage(data || []);
      setLoading(false);
    }

    fetchLuggage();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Luggage</h1>
        <Link
          to="/add-luggage"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add New Luggage
        </Link>
      </div>

      {luggage.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No luggage items found. Add your first one!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {luggage.map((item) => (
            <Link
              key={item.id}
              to={`/luggage/${item.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {item.tag_number}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    item.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    item.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Location:</span> {item.current_location}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Last updated: {format(new Date(item.updated_at), 'PPp')}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
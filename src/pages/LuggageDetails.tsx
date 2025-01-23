import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Luggage {
  id: string;
  tag_number: string;
  description: string;
  status: string;
  current_location: string;
  created_at: string;
  updated_at: string;
}

interface TrackingUpdate {
  id: string;
  location: string;
  status: string;
  notes: string;
  created_at: string;
}

export default function LuggageDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [luggage, setLuggage] = useState<Luggage | null>(null);
  const [updates, setUpdates] = useState<TrackingUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateForm, setUpdateForm] = useState({
    location: '',
    status: 'in_transit',
    notes: ''
  });

  useEffect(() => {
    if (!user || !id) {
      navigate('/login');
      return;
    }

    async function fetchData() {
      try {
        // Fetch luggage details
        const { data: luggageData, error: luggageError } = await supabase
          .from('luggage')
          .select('*')
          .eq('id', id)
          .single();

        if (luggageError) throw luggageError;
        setLuggage(luggageData);

        // Fetch tracking updates
        const { data: updatesData, error: updatesError } = await supabase
          .from('tracking_updates')
          .select('*')
          .eq('luggage_id', id)
          .order('created_at', { ascending: false });

        if (updatesError) throw updatesError;
        setUpdates(updatesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error loading luggage details');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, user, navigate]);

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    try {
      const { error } = await supabase.from('tracking_updates').insert([
        {
          luggage_id: id,
          location: updateForm.location,
          status: updateForm.status,
          notes: updateForm.notes
        }
      ]);

      if (error) throw error;

      toast.success('Update added successfully');
      
      // Refresh the updates list
      const { data: newUpdates } = await supabase
        .from('tracking_updates')
        .select('*')
        .eq('luggage_id', id)
        .order('created_at', { ascending: false });

      setUpdates(newUpdates || []);
      setUpdateForm({ location: '', status: 'in_transit', notes: '' });
    } catch (error) {
      console.error('Error adding update:', error);
      toast.error('Error adding update');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!luggage) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Luggage not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{luggage.tag_number}</h1>
            <p className="text-gray-600 mt-2">{luggage.description}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm ${
            luggage.status === 'delivered' ? 'bg-green-100 text-green-800' :
            luggage.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {luggage.status.replace('_', ' ')}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Current Location:</span> {luggage.current_location}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-medium">Last Updated:</span> {format(new Date(luggage.updated_at), 'PPp')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Update</h2>
        <form onSubmit={handleAddUpdate} className="space-y-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              id="location"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={updateForm.location}
              onChange={(e) => setUpdateForm({ ...updateForm, location: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={updateForm.status}
              onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
            >
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={updateForm.notes}
              onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Update
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tracking History</h2>
        {updates.length === 0 ? (
          <p className="text-gray-600">No updates yet</p>
        ) : (
          <div className="space-y-6">
            {updates.map((update) => (
              <div key={update.id} className="border-l-4 border-blue-500 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{update.location}</p>
                    <p className="text-sm text-gray-600 mt-1">{update.notes}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    update.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    update.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {update.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {format(new Date(update.created_at), 'PPp')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
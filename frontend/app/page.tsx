'use client';
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Users, Calendar, Plane, Plus, Home, MessageCircle, Send } from 'lucide-react';
import Navbar from './components/Navbar';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('trips'); // 'trips' or 'messages'
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    dates: '',
    imageurl: '',
    maxparticipants: 0,
    description: '',
    budget: '',
    duration: 0,
    triptype: '',
    activities: []
  });

  // Get userId from localStorage on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'trips') {
      fetchTrips();
    } else {
      if (userId) {
        fetchChats();
      }
    }
  }, [activeTab, userId]);

  const fetchTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        'https://backend-production-b554.up.railway.app/trips/'
      );
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      const data = await response.json();
      setTrips(data);
      setFilteredTrips(data);
    } catch (err) {
      setError('Failed to load trips. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChats = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        'https://backend-production-b554.up.railway.app/trips/chats',
        {
          headers: {
            'x-user-id': userId
          }
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }
      const data = await response.json();
      setChats(data);
    } catch (err) {
      setError('Failed to load chats. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (activeTab === 'trips') {
      const filtered = trips.filter(trip =>
        trip.title.toLowerCase().includes(term) ||
        trip.location.toLowerCase().includes(term) ||
        trip.description.toLowerCase().includes(term)
      );
      setFilteredTrips(filtered);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      setError('Please log in to create a trip');
      return;
    }

    try {
      const response = await fetch(
        'https://backend-production-b554.up.railway.app/trips/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create trip');
      }

      setShowCreateModal(false);
      setFormData({
        title: '',
        location: '',
        dates: '',
        imageurl: '',
        maxparticipants: 0,
        description: '',
        budget: '',
        duration: 0,
        triptype: '',
        activities: []
      });
      
      fetchTrips();
    } catch (err) {
      setError('Failed to create trip. Please try again.');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxparticipants' || name === 'duration' ? parseInt(value) : value
    }));
  };

  return (
    <>
    <Navbar />
    <div
      className="min-h-screen bg-cover bg-fixed"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 50%, rgba(240, 147, 251, 0.7) 100%), url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><pattern id="dots" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="2" fill="white" opacity="0.1"/></pattern></defs><rect width="1200" height="800" fill="none"/><path d="M100,200 Q300,150 500,200 T900,200" stroke="white" stroke-width="2" fill="none" opacity="0.05"/><circle cx="150" cy="300" r="80" fill="white" opacity="0.03"/><circle cx="1000" cy="400" r="120" fill="white" opacity="0.03"/><path d="M200,600 L250,550 L300,600" fill="white" opacity="0.04"/></svg>')`,
        backgroundSize: '100% 100%, auto'
      }}
    >
      {/* Header with Tabs */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4 pt-6">
            <h1 className="text-3xl font-bold text-white">Mera Musafir</h1>
            {activeTab === 'trips' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-white text-purple-600 hover:bg-gray-100 font-semibold py-2 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Create Trip
              </button>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-8 border-b border-white/20">
            <button
              onClick={() => setActiveTab('trips')}
              className={`flex items-center gap-2 py-4 px-2 font-semibold transition-all border-b-2 ${
                activeTab === 'trips'
                  ? 'text-white border-white'
                  : 'text-white/70 border-transparent hover:text-white'
              }`}
            >
              <Home className="w-5 h-5" />
              Discover Trips
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-2 py-4 px-2 font-semibold transition-all border-b-2 ${
                activeTab === 'messages'
                  ? 'text-white border-white'
                  : 'text-white/70 border-transparent hover:text-white'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              Messages ({chats.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Trips Tab */}
        {activeTab === 'trips' && (
          <>
            {/* Search Bar */}
            <div className="relative mb-8">
              <Search className="absolute z-10 left-4 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search trips by title, location, or description..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 text-white placeholder-white/70 rounded-lg outline-none focus:border-white/50 transition-all backdrop-blur-sm"
              />
            </div>

            {loading ? (
              <div className="flex justify-center items-center min-h-96">
                <div className="w-12 h-12 border-4 border-white border-t-purple-600 rounded-full animate-spin"></div>
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="text-center py-16">
                <Plane className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <p className="text-white/70 text-xl">No trips found. Start exploring or create your own adventure!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrips.map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => window.location.href = `/trips/${trip.id}`}
                    className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer group"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-r from-purple-400 to-pink-400 overflow-hidden">
                      {trip.imageurl ? (
                        <img
                          src={trip.imageurl}
                          alt={trip.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Plane className="w-12 h-12 text-white/50" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {trip.triptype}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          {trip.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2">{trip.description}</p>
                      </div>

                      {/* Trip Details */}
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <span>{trip.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <span>{trip.dates}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span>{trip.participants}/{trip.maxparticipants} participants</span>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="font-semibold text-gray-800">{trip.duration} days</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Budget</p>
                          <p className="font-semibold text-gray-800">{trip.budget}</p>
                        </div>
                      </div>

                      {/* Participants Avatars */}
                      {trip.participantlist && trip.participantlist.length > 0 && (
                        <div className="flex -space-x-2">
                          {trip.participantlist.slice(0, 3).map((participant, idx) => (
                            <div
                              key={idx}
                              className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                              title={participant.name}
                            >
                              {participant.initials}
                            </div>
                          ))}
                          {trip.participantlist.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                              +{trip.participantlist.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <>
            {loading ? (
              <div className="flex justify-center items-center min-h-96">
                <div className="w-12 h-12 border-4 border-white border-t-purple-600 rounded-full animate-spin"></div>
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center py-16">
                <MessageCircle className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <p className="text-white/70 text-xl">No chats yet. Join a trip to start chatting!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => window.location.href = `/chat/${chat.id}`}
                    className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer group p-6 space-y-4"
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                        {chat.name}
                      </h3>
                      <p className="text-gray-600 text-sm">Trip ID: {chat.trip_id}</p>
                    </div>

                    {/* Members */}
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-2">Members ({chat.members?.length || 0})</p>
                      <div className="flex flex-wrap gap-2">
                        {chat.members && chat.members.slice(0, 3).map((member, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs"
                          >
                            <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center text-xs font-bold">
                              {member.user?.name?.charAt(0) || 'U'}
                            </div>
                            <span>{member.user?.name || 'Unknown'}</span>
                          </div>
                        ))}
                        {chat.members && chat.members.length > 3 && (
                          <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-semibold">
                            +{chat.members.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Created {new Date(chat.created_at).toLocaleDateString()}
                      </p>
                      <Send className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Create a New Trip</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Trip Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="col-span-2 text-black px-4 py-2 border border-gray-300 placeholder:text-[#666] rounded-lg focus:border-purple-600 focus:outline-none"
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border text-black border-gray-300 rounded-lg placeholder:text-[#666] focus:border-purple-600 focus:outline-none"
                />
                <input
                  type="text"
                  name="dates"
                  placeholder="Dates (e.g., Dec 15-20)"
                  value={formData.dates}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border text-black border-gray-300 placeholder:text-[#666] rounded-lg focus:border-purple-600 focus:outline-none"
                />
                <input
                  type="url"
                  name="imageurl"
                  placeholder="Image URL"
                  value={formData.imageurl}
                  onChange={handleInputChange}
                  className="col-span-2 px-4 py-2 text-black border border-gray-300 placeholder:text-[#666] rounded-lg focus:border-purple-600 focus:outline-none"
                />
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="col-span-2 px-4 py-2 text-black border placeholder:text-[#666] border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
                <input
                  type="number"
                  name="duration"
                  placeholder="Duration (days)"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border text-black border-gray-300 placeholder:text-[#666] rounded-lg focus:border-purple-600 focus:outline-none"
                />
                <input
                  type="number"
                  name="maxparticipants"
                  placeholder="Max Participants"
                  value={formData.maxparticipants}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border text-black border-gray-300 placeholder:text-[#666] rounded-lg focus:border-purple-600 focus:outline-none"
                />
                <input
                  type="text"
                  name="budget"
                  placeholder="Budget (e.g., $1000-2000)"
                  value={formData.budget}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border text-black border-gray-300 placeholder:text-[#666] rounded-lg focus:border-purple-600 focus:outline-none"
                />
                <input
                  type="text"
                  name="triptype"
                  placeholder="Trip Type (e.g., Adventure, Relaxation)"
                  value={formData.triptype}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border text-black border-gray-300 placeholder:text-[#666] rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTrip}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
                >
                  Create Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default HomePage;
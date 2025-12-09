import React, { useState, useEffect } from "react";
import {
  MapPin,
  Users,
  Calendar,
  Clock,
  DollarSign,
  ArrowLeft,
  Loader,
} from "lucide-react";

const TripDetailPage = ({ tripId, onBack }) => {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("userId"));
    }
  }, []);

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  const fetchTripDetails = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch all trips and find the one with matching ID
      const response = await fetch(
        "https://backend-production-b554.up.railway.app/trips/"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch trips");
      }
      const allTrips = await response.json();
      const foundTrip = allTrips.find((trip) => trip.id === tripId);

      if (!foundTrip) {
        throw new Error("Trip not found");
      }

      setTrip(foundTrip);

      // Check if user has already joined
      if (foundTrip.participantlist && userId) {
        const userJoined = foundTrip.participantlist.some(
          (p) => p.id === parseInt(userId)
        );
        setHasJoined(userJoined);
      }
    } catch (err) {
      setError("Failed to load trip details. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTrip = async () => {
    if (!userId) {
      setError("Please log in to join a trip");

      return;
    }

    setJoining(true);
    try {
      const response = await fetch(
        `https://backend-production-b554.up.railway.app/trips/${tripId}/join-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to join trip");
      }

      const data = await response.json();
      setHasJoined(true);
      setShowConfirmation(false);

      // Redirect to chat after 1 second
      setTimeout(() => {
        window.location.href = `/chat/${data.chat_id}`;
      }, 1000);
    } catch (err) {
      setError("Failed to join trip. Please try again.");
      console.error(err);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">Trip not found</p>
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600">
      {/* Header with Back Button */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-50/20 border border-red-400/50 rounded-lg p-4 mb-6 backdrop-blur-sm">
            <p className="text-red-200 font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Hero Image */}
          <div className="relative h-96 bg-gradient-to-r from-purple-400 to-pink-400 overflow-hidden">
            {trip.imageurl ? (
              <img
                src={trip.imageurl}
                alt={trip.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-400">
                <span className="text-white/50 text-6xl">🗺️</span>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full font-semibold">
              {trip.triptype}
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Title and Description */}
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {trip.title}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                {trip.description}
              </p>
            </div>

            {/* Trip Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold text-sm">Location</span>
                </div>
                <p className="text-gray-800 font-semibold">{trip.location}</p>
              </div>

              <div className="bg-pink-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-pink-600 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold text-sm">Dates</span>
                </div>
                <p className="text-gray-800 font-semibold">{trip.dates}</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold text-sm">Duration</span>
                </div>
                <p className="text-gray-800 font-semibold">
                  {trip.duration} days
                </p>
              </div>

              <div className="bg-pink-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-pink-600 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-semibold text-sm">Budget</span>
                </div>
                <p className="text-gray-800 font-semibold">{trip.budget}</p>
              </div>
            </div>

            {/* Participants Section */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-800">
                  Participants ({trip.participants}/{trip.maxparticipants})
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                {trip.participantlist && trip.participantlist.length > 0 ? (
                  trip.participantlist.map((participant, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full"
                    >
                      <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-xs font-bold">
                        {participant.initials}
                      </div>
                      <span className="font-semibold">{participant.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No participants yet</p>
                )}
              </div>
            </div>

            {/* Activities Section */}
            {trip.activities && trip.activities.length > 0 && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Activities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {trip.activities.map((activity, idx) => (
                    <span
                      key={idx}
                      className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold text-sm"
                    >
                      {activity.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Join Button Section */}
            <div className="border-t pt-6 flex gap-4">
              {hasJoined ? (
                <div className="w-full">
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
                    <p className="text-green-700 font-semibold text-lg">
                      ✓ You're already part of this trip!
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      Access the group chat from your messages tab
                    </p>
                  </div>
                  <button
                    onClick={() => (window.location.href = "/")}
                    className="w-full mt-4 py-3 px-6 rounded-lg font-semibold text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    Go to Messages
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowConfirmation(true)}
                    disabled={
                      trip.participants >= trip.maxparticipants || joining
                    }
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold text-lg transition-all transform ${
                      trip.participants >= trip.maxparticipants
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105 active:scale-95"
                    }`}
                  >
                    {joining ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        Joining...
                      </span>
                    ) : trip.participants >= trip.maxparticipants ? (
                      "Trip Full"
                    ) : (
                      "Join Trip"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Confirm Join Trip
              </h2>
              <p className="text-gray-600">
                You're about to join{" "}
                <span className="font-semibold text-purple-600">
                  {trip.title}
                </span>
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Location:</span> {trip.location}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Dates:</span> {trip.dates}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Duration:</span> {trip.duration}{" "}
                days
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinTrip}
                disabled={joining}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold disabled:opacity-50"
              >
                {joining ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Joining...
                  </span>
                ) : (
                  "Confirm & Join"
                )}
              </button>
              
            </div>
            {error && (
                <div className="bg-red-50/20 border border-red-400/50 rounded-lg p-4 mb-6 backdrop-blur-sm">
                  <p className="text-red-500 font-medium">{error}</p>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetailPage;

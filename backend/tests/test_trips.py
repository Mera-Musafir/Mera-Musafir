import pytest
from fastapi import status

class TestTripsRoutes:
    """Test cases for trips routes"""
    
    def test_get_all_trips_empty(self, client):
        """Test getting all trips when database is empty"""
        response = client.get("/trips/")
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []
    
    def test_get_all_trips_with_data(self, client, test_trip):
        """Test getting all trips with data"""
        response = client.get("/trips/")
        assert response.status_code == status.HTTP_200_OK
        
        trips = response.json()
        assert len(trips) == 1
        
        trip = trips[0]
        assert trip["id"] == test_trip.id
        assert trip["title"] == "Test Paris Trip"
        assert trip["location"] == "Paris, France"
        assert trip["dates"] == "Dec 15-22, 2025"
        assert trip["participants"] == 2
        assert trip["maxparticipants"] == 8
        assert trip["description"] == "A wonderful trip to Paris"
        assert trip["budget"] == "$1,200-1,800"
        assert trip["duration"] == 7
        assert trip["triptype"] == "Cultural"
        
        # Check activities are included
        assert "activities" in trip
        assert len(trip["activities"]) == 3
        activity_names = [act["name"] for act in trip["activities"]]
        assert "Eiffel Tower" in activity_names
        assert "Louvre Museum" in activity_names
        assert "Seine River Cruise" in activity_names
    
    def test_get_trips_with_multiple_trips(self, client, db_session):
        """Test getting multiple trips with proper defaults"""
        from models.trips import Trip
        
        # Create multiple trips with all required fields
        trips_data = [
            {
                "title": "Tokyo Adventure",
                "location": "Tokyo, Japan",
                "dates": "Jan 10-18, 2026",
                "participants": 3,
                "maxparticipants": 10,
                "duration": 9,
                "participantlist": [
                    {"id": 1, "name": "User A", "initials": "UA"},
                    {"id": 2, "name": "User B", "initials": "UB"},
                    {"id": 3, "name": "User C", "initials": "UC"}
                ]
            },
            {
                "title": "Bali Retreat", 
                "location": "Bali, Indonesia",
                "dates": "Feb 5-14, 2026",
                "participants": 4,
                "maxparticipants": 6,
                "duration": 10,
                "participantlist": [
                    {"id": 1, "name": "User X", "initials": "UX"},
                    {"id": 2, "name": "User Y", "initials": "UY"},
                    {"id": 3, "name": "User Z", "initials": "UZ"},
                    {"id": 4, "name": "User W", "initials": "UW"}
                ]
            }
        ]
        
        for trip_data in trips_data:
            trip = Trip(**trip_data)
            db_session.add(trip)
        
        db_session.commit()
        
        response = client.get("/trips/")
        assert response.status_code == status.HTTP_200_OK
        
        trips = response.json()
        assert len(trips) == 2
        
        # Verify both trips are returned
        titles = [trip["title"] for trip in trips]
        assert "Tokyo Adventure" in titles
        assert "Bali Retreat" in titles

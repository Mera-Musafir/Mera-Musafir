import pytest
from fastapi import status

class TestMainRoutes:
    """Test cases for main application routes"""
    
    def test_root_endpoint(self, client):
        """Test the root endpoint returns correct response"""
        response = client.get("/")
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == {"title": "Mere Musafir"}
    
    def test_application_startup(self, client):
        """Test that the application starts up correctly"""
        # This test ensures the app can handle requests
        response = client.get("/")
        assert response.status_code == status.HTTP_200_OK

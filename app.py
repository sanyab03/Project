from flask import Flask, request, jsonify,render_template
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
OPENWEATHER_API_KEY = "b5353a7c0d55517a14d818a4881a0b49"
MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiaXNoYW4xMzMiLCJhIjoiY21leDV0dzNqMGQwdTJrczdtYTI3YTd3dCJ9.nWZ7_QLgUrjHt6SaVVCvhA"


@app.route("/")
def home():
    return render_template("index.html")  

@app.route('/api/weather', methods=['GET'])
def get_weather():
    """
    Get weather data for given coordinates
    Query parameters: lat, lng
    """
    try:
        lat = request.args.get('lat')
        lng = request.args.get('lng')
        
        if not lat or not lng:
            return jsonify({
                'error': 'Missing latitude or longitude parameters'
            }), 400
        
        # Validate coordinates
        try:
            lat_float = float(lat)
            lng_float = float(lng)
            if not (-90 <= lat_float <= 90) or not (-180 <= lng_float <= 180):
                raise ValueError("Invalid coordinate range")
        except ValueError:
            return jsonify({
                'error': 'Invalid coordinate values'
            }), 400
        
        # Fetch weather data from OpenWeatherMap
        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={OPENWEATHER_API_KEY}&units=metric"
        weather_response = requests.get(weather_url, timeout=10)
        
        if weather_response.status_code != 200:
            return jsonify({
                'error': 'Failed to fetch weather data'
            }), 500
        
        weather_data = weather_response.json()
        
        # Extract relevant weather information
        result = {
            'coordinates': {
                'lat': lat_float,
                'lng': lng_float
            },
            'weather': {
                'temperature': weather_data.get('main', {}).get('temp', 'N/A'),
                'feels_like': weather_data.get('main', {}).get('feels_like', 'N/A'),
                'humidity': weather_data.get('main', {}).get('humidity', 'N/A'),
                'pressure': weather_data.get('main', {}).get('pressure', 'N/A'),
                'condition': weather_data.get('weather', [{}])[0].get('description', 'N/A'),
                'main': weather_data.get('weather', [{}])[0].get('main', 'N/A'),
                'wind_speed': weather_data.get('wind', {}).get('speed', 'N/A'),
                'wind_direction': weather_data.get('wind', {}).get('deg', 'N/A'),
                'visibility': weather_data.get('visibility', 'N/A'),
                'clouds': weather_data.get('clouds', {}).get('all', 'N/A')
            },
            'location': {
                'name': weather_data.get('name', 'Unknown'),
                'country': weather_data.get('sys', {}).get('country', 'Unknown')
            }
        }
        
        return jsonify(result)
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'error': f'Network error: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/api/location', methods=['GET'])
def get_location():
    """
    Get location information for given coordinates using Mapbox reverse geocoding
    Query parameters: lat, lng
    """
    try:
        lat = request.args.get('lat')
        lng = request.args.get('lng')
        
        if not lat or not lng:
            return jsonify({
                'error': 'Missing latitude or longitude parameters'
            }), 400
        
        # Validate coordinates
        try:
            lat_float = float(lat)
            lng_float = float(lng)
            if not (-90 <= lat_float <= 90) or not (-180 <= lng_float <= 180):
                raise ValueError("Invalid coordinate range")
        except ValueError:
            return jsonify({
                'error': 'Invalid coordinate values'
            }), 400
        
        # Fetch location data from Mapbox
        geocoding_url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{lng},{lat}.json?access_token={MAPBOX_ACCESS_TOKEN}"
        geo_response = requests.get(geocoding_url, timeout=10)
        
        if geo_response.status_code != 200:
            return jsonify({
                'error': 'Failed to fetch location data'
            }), 500
        
        geo_data = geo_response.json()
        
        # Parse location information
        place, state, country = "", "", ""
        if geo_data.get('features'):
            for feature in geo_data['features']:
                place_types = feature.get('place_type', [])
                if 'place' in place_types and not place:
                    place = feature.get('text', '')
                elif 'region' in place_types and not state:
                    state = feature.get('text', '')
                elif 'country' in place_types and not country:
                    country = feature.get('text', '')
        
        result = {
            'coordinates': {
                'lat': lat_float,
                'lng': lng_float
            },
            'location': {
                'place': place or 'Unknown',
                'state': state or 'Unknown',
                'country': country or 'Unknown'
            }
        }
        
        return jsonify(result)
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'error': f'Network error: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/api/weather-location', methods=['GET'])
def get_weather_and_location():
    """
    Get both weather and location data for given coordinates
    Query parameters: lat, lng
    """
    try:
        lat = request.args.get('lat')
        lng = request.args.get('lng')
        
        if not lat or not lng:
            return jsonify({
                'error': 'Missing latitude or longitude parameters'
            }), 400
        
        # Validate coordinates
        try:
            lat_float = float(lat)
            lng_float = float(lng)
            if not (-90 <= lat_float <= 90) or not (-180 <= lng_float <= 180):
                raise ValueError("Invalid coordinate range")
        except ValueError:
            return jsonify({
                'error': 'Invalid coordinate values'
            }), 400
        
        # Fetch both weather and location data concurrently
        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={OPENWEATHER_API_KEY}&units=metric"
        geocoding_url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{lng},{lat}.json?access_token={MAPBOX_ACCESS_TOKEN}"
        
        # Make both API calls
        weather_response = requests.get(weather_url, timeout=10)
        geo_response = requests.get(geocoding_url, timeout=10)
        
        if weather_response.status_code != 200:
            return jsonify({
                'error': 'Failed to fetch weather data'
            }), 500
        
        if geo_response.status_code != 200:
            return jsonify({
                'error': 'Failed to fetch location data'
            }), 500
        
        weather_data = weather_response.json()
        geo_data = geo_response.json()
        
        # Parse location information
        place, state, country = "", "", ""
        if geo_data.get('features'):
            for feature in geo_data['features']:
                place_types = feature.get('place_type', [])
                if 'place' in place_types and not place:
                    place = feature.get('text', '')
                elif 'region' in place_types and not state:
                    state = feature.get('text', '')
                elif 'country' in place_types and not country:
                    country = feature.get('text', '')
        
        # Combine results
        result = {
            'coordinates': {
                'lat': lat_float,
                'lng': lng_float
            },
            'weather': {
                'temperature': weather_data.get('main', {}).get('temp', 'N/A'),
                'feels_like': weather_data.get('main', {}).get('feels_like', 'N/A'),
                'humidity': weather_data.get('main', {}).get('humidity', 'N/A'),
                'pressure': weather_data.get('main', {}).get('pressure', 'N/A'),
                'condition': weather_data.get('weather', [{}])[0].get('description', 'N/A'),
                'main': weather_data.get('weather', [{}])[0].get('main', 'N/A'),
                'wind_speed': weather_data.get('wind', {}).get('speed', 'N/A'),
                'wind_direction': weather_data.get('wind', {}).get('deg', 'N/A'),
                'visibility': weather_data.get('visibility', 'N/A'),
                'clouds': weather_data.get('clouds', {}).get('all', 'N/A')
            },
            'location': {
                'place': place or weather_data.get('name', 'Unknown'),
                'state': state or 'Unknown',
                'country': country or weather_data.get('sys', {}).get('country', 'Unknown')
            }
        }
        
        return jsonify(result)
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'error': f'Network error: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'weather-api'})

@app.route('/', methods=['GET'])
def index():
    """API documentation"""
    return jsonify({
        'message': 'Weather API',
        'endpoints': {
            '/api/weather': 'GET - Get weather data (params: lat, lng)',
            '/api/location': 'GET - Get location data (params: lat, lng)',
            '/api/weather-location': 'GET - Get both weather and location data (params: lat, lng)',
            '/health': 'GET - Health check'
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
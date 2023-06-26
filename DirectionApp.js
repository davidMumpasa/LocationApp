import React, { useEffect, useState } from 'react';
import { View, Button, TextInput, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';

const DirectionApp = () => {
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission not granted');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
    })();
  }, []);

  const handleDestinationChange = (text) => {
    setDestination(text);
  };

  const handleSearch = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      const origin = `${currentLocation.coords.latitude},${currentLocation.coords.longitude}`;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=YOUR_GOOGLE_MAPS_API_KEY`
      );
      const result = await response.json();

      if (result.routes && result.routes.length > 0) {
        const points = polyline.decode(result.routes[0].overview_polyline.points);
        const routeCoordinates = points.map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }));
        setRouteCoordinates(routeCoordinates);
      } else {
        console.error('No routes found.');
      }
    } catch (error) {
      console.error('Error retrieving directions:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {currentLocation && (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={3}
              strokeColor="blue"
            />
          )}
          <Marker coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }} />
        </MapView>
      )}
      <GooglePlacesAutocomplete
        placeholder="Enter destination"
        onPress={(data, details = null) => {
          setDestination(details.formatted_address);
        }}
        query={{
          key: 'key=AIzaSyAx_mxn7oiKmP5lT2bf0eynF99Iog--4GA',
          language: 'en',
          components: 'country:us' // Restrict results to a specific country (optional)
        }}
        renderTextInput={(props) => (
          <TextInput
            {...props}
            style={styles.input}
          />
        )}
      />
      <Button title="Search" onPress={handleSearch} />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default DirectionApp;

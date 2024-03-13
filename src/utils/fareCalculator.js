import axios from 'axios';
import { Constants } from 'expo-constants';

async function fetchDistance(origin, destination, apiKey) {
  try {
    const apiKey = Constants.manifest.extra.googleApiKey;
    const response = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${apiKey}`);
    console.log('Google Maps API response:', response.data); // gpt_pilot_debugging_log
    const distanceInMeters = response.data.rows[0].elements[0].distance.value;
    const distanceInMiles = distanceInMeters * 0.000621371;
    console.log('Calculated distance in miles:', distanceInMiles); // gpt_pilot_debugging_log
    return distanceInMiles;
  } catch (error) {
    console.error(`Error fetching distance: ${error.message}`, error.stack); // gpt_pilot_debugging_log
    throw new Error('Failed to fetch distance.');
  }
}

export const calculateFare = async (originCoords, destinationCoords, multiplier) => {
  try {
    const distanceInMiles = await fetchDistance(originCoords, destinationCoords, Constants.manifest.extra.googleApiKey);
    console.log(`Distance fetched from Google API: ${distanceInMiles} miles`); // gpt_pilot_debugging_log

    const baseFare = 10;
    const perMileFare = 3;

    let timeBasedMultiplier = 1;
    const currentHour = new Date().getHours();

    if (currentHour >= 22 || currentHour < 6) {
      timeBasedMultiplier = 2;
    }

    const estimatedFare = (baseFare + (distanceInMiles * perMileFare)) * multiplier * timeBasedMultiplier;
    console.log(`Fare calculated with distance ${distanceInMiles.toFixed(2)} miles, time-based multiplier ${timeBasedMultiplier}, and ride type multiplier ${multiplier}: $${estimatedFare.toFixed(2)}`); // gpt_pilot_debugging_log
    console.log(`Calculated Fare: ${estimatedFare.toFixed(2)}`); // gpt_pilot_debugging_log
    return estimatedFare.toFixed(2);
  } catch (error) {
    console.error(`Error calculating fare: ${error.message}`, error.stack); // gpt_pilot_debugging_log
    throw new Error('Failed to calculate fare.');
  }
};
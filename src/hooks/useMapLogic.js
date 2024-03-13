// useMapLogic.js
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectOrigin, selectDestination } from '../slices/navSlice';
import expoConstants from 'expo-constants';

export default function useMapLogic() {
  const origin = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!origin || !destination || !mapRef.current) {
      console.log('Missing origin, destination, or mapRef is not initialized.'); // gpt_pilot_debugging_log
      return;
    }
    try {
      mapRef.current.fitToSuppliedMarkers(['origin', 'destination'], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      });
      console.log('Map view adjusted to fit origin and destination markers.'); // gpt_pilot_debugging_log
    } catch (error) {
      console.error('Error adjusting map view to fit markers:', error.message, error.stack); // gpt_pilot_debugging_log
    }
  }, [origin, destination]);

  const googleApiKey = expoConstants.expoConfig.extra.googleApiKey; // Consider moving to .env management

  console.log('useMapLogic hook executed.'); // gpt_pilot_debugging_log

  return { mapRef, origin, destination, googleApiKey };
};
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
    if (!origin || !destination || !mapRef.current) return;
    mapRef.current.fitToSuppliedMarkers(['origin', 'destination'], {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
    });
  }, [origin, destination]);

  const googleApiKey = expoConstants.expoConfig.extra.googleApiKey; // Consider moving to .env management

  return { mapRef, origin, destination, googleApiKey };
};


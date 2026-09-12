import { API_BASE_URL } from '../../config';

export async function fetchMyTrips(token) {
  const response = await fetch(`${API_BASE_URL}/trips/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Could not load your trips');
  return payload;
}

export async function submitDeliveryProof(token, tripId, deliveryPhoto, deliveryNotes) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/delivery-proof`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ delivery_photo: deliveryPhoto, delivery_notes: deliveryNotes }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Could not submit delivery proof');
  return payload;
}

export async function submitCurrentLocation(token, vehicleId, coordinates) {
  const response = await fetch(`${API_BASE_URL}/locations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      vehicle_id: vehicleId,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Could not share your location');
  return payload;
}

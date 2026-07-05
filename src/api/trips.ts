import client from './client';
import type { CreateTripBody, RateTripBody, Trip, User } from '../types';

// --- Conductores ---

// Solo PASSENGER: conductores disponibles para aceptar viajes.
export async function getAvailableDrivers(): Promise<User[]> {
  const { data } = await client.get<User[]>('/drivers/available');
  return data;
}

// --- Viajes (pasajero) ---

// Solo PASSENGER: crea un viaje en estado PENDING.
export async function createTrip(body: CreateTripBody): Promise<Trip> {
  const { data } = await client.post<Trip>('/trips', body);
  return data;
}

// Solo PASSENGER: historial de viajes del pasajero autenticado.
export async function getMyTripsAsPassenger(): Promise<Trip[]> {
  const { data } = await client.get<Trip[]>('/trips');
  return data;
}

// Solo PASSENGER: califica un viaje COMPLETED (una sola vez).
export async function rateTrip(id: number, body: RateTripBody): Promise<Trip> {
  const { data } = await client.post<Trip>(`/trips/${id}/rate`, body);
  return data;
}

// --- Viajes (conductor) ---

// Solo DRIVER: viajes PENDING disponibles para aceptar.
export async function getPendingTrips(): Promise<Trip[]> {
  const { data } = await client.get<Trip[]>('/trips/pending');
  return data;
}

// Solo DRIVER: historial del conductor (aceptados y completados).
export async function getMyTripsAsDriver(): Promise<Trip[]> {
  const { data } = await client.get<Trip[]>('/trips/my');
  return data;
}

// Solo DRIVER: acepta un viaje PENDING -> IN_PROGRESS.
export async function acceptTrip(id: number): Promise<Trip> {
  const { data } = await client.patch<Trip>(`/trips/${id}/accept`);
  return data;
}

// Solo DRIVER asignado: marca IN_PROGRESS -> COMPLETED.
export async function completeTrip(id: number): Promise<Trip> {
  const { data } = await client.patch<Trip>(`/trips/${id}/complete`);
  return data;
}

// --- Común ---

// PASSENGER o DRIVER participante del viaje.
export async function getTrip(id: number): Promise<Trip> {
  const { data } = await client.get<Trip>(`/trips/${id}`);
  return data;
}

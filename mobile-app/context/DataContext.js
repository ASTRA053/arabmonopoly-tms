import React, { createContext, useContext, useMemo, useState } from 'react';

const DataContext = createContext(null);
const makeId = () => String(Date.now()) + Math.random().toString(16).slice(2);

export function DataProvider({ children }) {
  const [drivers, setDrivers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);

  const addItem = (setter, item) => setter((prev) => [...prev, { ...item, id: makeId() }]);
  const updateItem = (setter, item) => setter((prev) => prev.map((x) => (x.id === item.id ? item : x)));
  const deleteItem = (setter, id) => setter((prev) => prev.filter((x) => x.id !== id));

  const value = useMemo(
    () => ({
      drivers, admins, vehicles, trips, users, reports,

      addDriver: (item) => addItem(setDrivers, item),
      updateDriver: (item) => updateItem(setDrivers, item),
      deleteDriver: (id) => deleteItem(setDrivers, id),

      addAdmin: (item) => addItem(setAdmins, item),
      updateAdmin: (item) => updateItem(setAdmins, item),
      deleteAdmin: (id) => deleteItem(setAdmins, id),

      addVehicle: (item) => addItem(setVehicles, item),
      updateVehicle: (item) => updateItem(setVehicles, item),
      deleteVehicle: (id) => deleteItem(setVehicles, id),

      addTrip: (item) => addItem(setTrips, item),
      updateTrip: (item) => updateItem(setTrips, item),
      deleteTrip: (id) => deleteItem(setTrips, id),

      addUser: (item) => addItem(setUsers, item),
      updateUser: (item) => updateItem(setUsers, item),
      deleteUser: (id) => deleteItem(setUsers, id),

      addReport: (item) => addItem(setReports, item),
      updateReport: (item) => updateItem(setReports, item),
      deleteReport: (id) => deleteItem(setReports, id),
    }),
    [drivers, admins, vehicles, trips, users, reports]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
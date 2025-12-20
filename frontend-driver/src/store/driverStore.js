import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useDriverStore = create(
    persist(
        (set, get) => ({
            // Auth state
            token: null,
            driver: null,

            // Trip state
            activeTrip: null,
            activeCar: null,

            // Auth actions
            setAuth: (token, driver) => set({ token, driver }),
            logout: () => set({
                token: null,
                driver: null,
                activeTrip: null,
                activeCar: null
            }),

            // Trip actions
            setActiveTrip: (trip, car) => set({ activeTrip: trip, activeCar: car }),
            clearActiveTrip: () => set({ activeTrip: null, activeCar: null }),

            // Status helpers
            isOnTrip: () => get().activeTrip !== null,
        }),
        {
            name: 'driver-storage',
        }
    )
)

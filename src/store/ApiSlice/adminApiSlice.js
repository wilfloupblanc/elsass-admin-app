import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const adminApiSlice = createApi({
    reducerPath: 'adminApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        credentials: "include",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token')
            if (token) {
                headers.set('Authorization', `Bearer ${token}`)
            }
            return headers
        }
    }),
    tagTypes: ["admin"],
    endpoints: build => ({
        signIn: build.mutation({
            query: (credentials) => ({
                url: '/auth/sign-in',
                method: 'POST',
                body: credentials,
            }),
        }),
        getAuthUser: build.query({
            query: () => '/auth/user',
        }),
        signOut: build.mutation({
            query: () => ({
                url: '/auth/sign-out',
                method: 'GET',
            }),
            invalidatesTags: ['admin'],
        }),
        getBookings: build.query({
            query: () => '/booking/',
            providesTags: ["admin"],
        }),
        getUsers: build.query({
            query: () => '/user/',
            providesTags: ["admin"],
        }),
        getPayments: build.query({
            query: () => '/payments/',
            providesTags: ["admin"],
        }),
        getGiftVouchers: build.query({
            query: () => '/giftVoucher/',
            providesTags: ["admin"],
        }),
        getSimulators: build.query({
            query: () => '/simulator/',
            providesTags: ["admin"],
        }),
        updateSimulator: build.mutation({
            query: ({ id, ...body }) => ({
                url: `/simulator/${id}`,
                method: 'PUT',
                body
            }),
            invalidatesTags: ['admin'],
        }),
        updateBooking: build.mutation({
            query: ({ id, ...body }) => ({
                url: `/booking/${id}`,
                method: 'PUT',
                body
            }),
            invalidatesTags: ["admin"],
        }),
        getSessions: build.query({
            query: () => '/session/',
            providesTags: ['admin'],
        }),
        getAvailabilitiesByMonth: build.query({
            query: (month) => `/availability/month?month=${month}`,
            providesTags: ['admin'],
        }),
        createAvailability: build.mutation({
            query: (body) => ({
                url: '/availability/',
                method: 'POST',
                body
            }),
            invalidatesTags: ['admin'],
        }),
        updateAvailability: build.mutation({
            query: ({ id, ...body }) => ({
                url: `/availability/${id}`,
                method: 'PUT',
                body
            }),
            invalidatesTags: ['admin'],
        }),
        deleteAvailability: build.mutation({
            query: (id) => ({
                url: `/availability/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['admin'],
        }),
        getAvailabilitiesByWeek: build.query({
            query: (start) => `/availability/week?start=${start}`,
            providesTags: ['admin'],
        }),
        getSubscriptions: build.query({
            query: () => '/subscription/',
            providesTags: ['admin'],
        }),
        getEvents: build.query({
            query: () => '/event/',
            providesTags: ['admin'],
        }),
        createEvent: build.mutation({
            query: (body) => ({
                url: '/event/',
                method: 'POST',
                body
            }),
            invalidatesTags: ['admin'],
        }),
        updateEvent: build.mutation({
            query: ({ id, ...body }) => ({
                url: `/event/${id}`,
                method: 'PUT',
                body
            }),
            invalidatesTags: ['admin'],
        }),
        deleteEvent: build.mutation({
            query: (id) => ({
                url: `/event/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['admin'],
        }),
        checkInBooking: build.mutation({
            query: (id) => ({
                url: `/booking/${id}/checkin`,
                method: 'PUT',
            }),
            invalidatesTags: ['admin'],
        }),
        validateFreeSessionToken: build.mutation({
            query: (token) => ({
                url: `/freeSessionToken/validate/${token}`,
                method: 'PUT',
            }),
            invalidatesTags: ['admin'],
        }),
        getEventRegistrations: build.query({
            query: (eventId) => `/booking/event/${eventId}`,
            providesTags: ['admin'],
        }),
        toggleMaintenance: build.mutation({
            query: () => ({
                url: '/setting/maintenance/toggle',
                method: 'PATCH',
            }),
            invalidatesTags: ['admin'],
        }),
        getMaintenanceStatus: build.query({
            query: () => '/setting/maintenance/status',
            providesTags: ['admin'],
        }),
        updateSubscriptionSessions: build.mutation({
            query: ({ id, free_sessions_remaining }) => ({
                url: `/subscription/${id}/sessions`,
                method: 'PATCH',
                body: { free_sessions_remaining }
            }),
            invalidatesTags: ['admin'],
        }),
        adminCancelBooking: build.mutation({
            query: (id) => ({
                url: `/booking/${id}/cancel`,
                method: 'PUT',
            }),
            invalidatesTags: ['admin'],
        }),
        adminRestoreBooking: build.mutation({
            query: (id) => ({
                url: `/booking/${id}/restore`,
                method: 'PUT',
            }),
            invalidatesTags: ['admin'],
        }),
        getDiscountCodes: build.query({
            query: () => '/discount-code/',
            providesTags: ['admin'],
        }),
        createDiscountCode: build.mutation({
            query: (body) => ({
                url: '/discount-code/',
                method: 'POST',
                body
            }),
            invalidatesTags: ['admin'],
        }),
        deleteDiscountCode: build.mutation({
            query: (id) => ({
                url: `/discount-code/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['admin'],
        }),
    })
})

export const {
    useGetBookingsQuery,
    useGetUsersQuery,
    useGetPaymentsQuery,
    useGetGiftVouchersQuery,
    useGetSimulatorsQuery,
    useUpdateSimulatorMutation,
    useUpdateBookingMutation,
    useSignInMutation,
    useGetAuthUserQuery,
    useSignOutMutation,
    useGetSessionsQuery,
    useGetAvailabilitiesByMonthQuery,
    useCreateAvailabilityMutation,
    useUpdateAvailabilityMutation,
    useDeleteAvailabilityMutation,
    useGetAvailabilitiesByWeekQuery,
    useGetSubscriptionsQuery,
    useGetEventsQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
    useCheckInBookingMutation,
    useValidateFreeSessionTokenMutation,
    useGetEventRegistrationsQuery,
    useToggleMaintenanceMutation,
    useGetMaintenanceStatusQuery,
    useUpdateSubscriptionSessionsMutation,
    useAdminCancelBookingMutation,
    useAdminRestoreBookingMutation,
    useGetDiscountCodesQuery,
    useCreateDiscountCodeMutation,
    useDeleteDiscountCodeMutation,
} = adminApiSlice
import './Reservations.scss'
import { useState } from 'react'
import {
    useGetBookingsQuery,
    useGetUsersQuery,
    useGetSessionsQuery,
    useGetSimulatorsQuery,
    useUpdateBookingMutation
} from '../../store/ApiSlice/adminApiSlice'

export const Reservations = () => {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')

    const { data: bookingsData } = useGetBookingsQuery()
    const { data: usersData } = useGetUsersQuery()
    const { data: sessionsData } = useGetSessionsQuery()
    const { data: simulatorsData } = useGetSimulatorsQuery()
    const [updateBooking] = useUpdateBookingMutation()

    const bookings = bookingsData?.bookings ?? []
    const users = usersData?.users ?? []
    const sessions = sessionsData?.sessions ?? []
    const simulators = simulatorsData?.simulators ?? []

    const getUser = (user_id) => users.find(u => u.id == user_id)
    const getSession = (session_id) => sessions.find(s => s.id == session_id)
    const getSimulator = (simulator_id) => simulators.find(s => s.id == simulator_id)

    const getStatusLabel = (status) => {
        switch (status) {
            case 'confirmed': return 'Confirmé'
            case 'pending': return 'En attente'
            case 'pending_payment': return 'Paiement en attente'
            case 'cancelled': return 'Annulé'
            default: return status
        }
    }

    const getStatusClass = (status) => {
        switch (status) {
            case 'confirmed': return 'status--confirmed'
            case 'pending': return 'status--pending'
            case 'pending_payment': return 'status--pending'
            case 'cancelled': return 'status--cancelled'
            default: return ''
        }
    }

    const filteredBookings = bookings
        .filter(b => {
            if (filter === 'all') return true
            return b.status === filter
        })
        .filter(b => {
            if (!search) return true
            const user = getUser(b.user_id)
            const fullName = user ? `${user.firstname} ${user.lastname}`.toLowerCase() : ''
            return fullName.includes(search.toLowerCase())
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))

    const handleStatusChange = async (id, status) => {
        await updateBooking({ id, status })
    }

    return (
        <section className="reservations">
            <article className="reservations__topbar">
                <h1 className="reservations__title">Réservations</h1>
                <div className="reservations__filters">
                    <input
                        className="reservations__search"
                        type="text"
                        placeholder="Rechercher un pilote..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {['all', 'confirmed', 'pending', 'cancelled'].map(f => (
                        <button
                            key={f}
                            className={`reservations__filter ${filter === f ? 'reservations__filter--active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f === 'all' ? 'Tous' : getStatusLabel(f)}
                        </button>
                    ))}
                </div>
            </article>

            <article className="reservations__table-wrap">
                <table className="reservations__table">
                    <thead>
                    <tr>
                        <th>Pilote</th>
                        <th>Date</th>
                        <th>Horaire</th>
                        <th>Session</th>
                        <th>Simulateur</th>
                        <th>Pilotes</th>
                        <th>Montant</th>
                        <th>Statut</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredBookings.map(booking => {
                        const user = getUser(booking.user_id)
                        const session = getSession(booking.session_id)
                        const simulator = getSimulator(booking.simulator_id)
                        const initials = user
                            ? `${user.firstname[0]}${user.lastname[0]}`.toUpperCase()
                            : '?'

                        return (
                            <tr key={booking.id}>
                                <td>
                                    <div className="reservations__pilot">
                                        <div className="reservations__initials">{initials}</div>
                                        <div className="reservations__pilot-info">
                                                <span className="reservations__pilot-name">
                                                    {user ? `${user.firstname} ${user.lastname}` : `#${booking.user_id}`}
                                                </span>
                                            <span className="reservations__pilot-email">
                                                    {user?.email}
                                                </span>
                                        </div>
                                    </div>
                                </td>
                                <td>{new Date(booking.date).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}</td>
                                <td>{booking.start_time} — {booking.end_time}</td>
                                <td>{session ? `${session.duration_minutes} min` : '—'}</td>
                                <td>{simulator ? simulator.name : '—'}</td>
                                <td>{booking.pilots}</td>
                                <td>{booking.price_paid} €</td>
                                <td>
                                        <span className={`reservations__status ${getStatusClass(booking.status)}`}>
                                            {getStatusLabel(booking.status)}
                                        </span>
                                </td>
                                <td>
                                    <div className="reservations__actions">
                                        {booking.status !== 'cancelled' && (
                                            <button
                                                className="reservations__btn reservations__btn--cancel"
                                                onClick={() => handleStatusChange(booking.id, 'cancelled')}
                                            >
                                                Annuler
                                            </button>
                                        )}
                                        {booking.status === 'cancelled' && (
                                            <button
                                                className="reservations__btn reservations__btn--restore"
                                                onClick={() => handleStatusChange(booking.id, 'confirmed')}
                                            >
                                                Restaurer
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </article>
        </section>
    )
}
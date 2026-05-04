import {useNavigate} from "react-router";
import {
    useGetBookingsQuery,
    useGetGiftVouchersQuery,
    useGetPaymentsQuery,
    useGetSimulatorsQuery,
    useGetUsersQuery,
    useUpdateSimulatorMutation
} from "../../store/ApiSlice/adminApiSlice";

import "./Dashboard.scss"

export const Dashboard = () => {
    const navigate = useNavigate()

    const { data: bookingsData } = useGetBookingsQuery()
    const { data: usersData } = useGetUsersQuery()
    const { data: paymentsData } = useGetPaymentsQuery()
    const { data: giftVouchersData } = useGetGiftVouchersQuery()
    const { data: simulatorsData } = useGetSimulatorsQuery()
    const [updateSimulator] = useUpdateSimulatorMutation()

    const bookings = bookingsData?.bookings ?? []
    const users = usersData?.users ?? []
    const payments = paymentsData?.payments ?? []
    const giftVouchers = giftVouchersData?.giftvouchers ?? []
    const simulators = simulatorsData?.simulators ?? []

    const todayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.date).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })
        const todayDate = new Date().toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })
        return bookingDate === todayDate
    })

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthRevenue = payments
        .filter(p => {
            const d = new Date(p.created_at)
            return p.status === 'completed' && d.getMonth() === currentMonth && d.getFullYear() === currentYear
        })
        .reduce((acc, p) => acc + p.amount, 0)

    const newUsersThisMonth = users.filter(u => {
        const d = new Date(u.created_at)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const activeGiftVouchers = giftVouchers.filter(gv => gv.status === 'valid')

    const recentBookings = [...bookings]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4)

    const getStatusLabel = (status) => {
        switch (status) {
            case 'confirmed': return 'Confirmé'
            case 'pending': return 'En attente'
            case 'cancelled': return 'Annulé'
            default: return status
        }
    }

    const getStatusClass = (status) => {
        switch (status) {
            case 'confirmed': return 'status--confirmed'
            case 'pending': return 'status--pending'
            case 'cancelled': return 'status--cancelled'
            default: return ''
        }
    }

    const handleToggleSimulator = async (sim) => {
        await updateSimulator({ id: sim.id, is_active: !sim.is_active })
    }

    return (
        <section className="dashboard">
            <article className="dashboard__topbar">
                <h1 className="dashboard__title">Dashboard</h1>
                <div className="dashboard__topbar-right">
                    <span className="dashboard__date">
                        {new Date().toLocaleDateString('fr-FR', {weekday: "long", day: "numeric", month: "long", year: "numeric"})}
                    </span>
                </div>
            </article>

            <article className="dashboard__stats">
                <div className="dashboard__stat-card">
                    <div className="dashboard__stat-accent" style={{ background: '#00b2ff' }} />
                    <p className="dashboard__stat-label">Réservations aujourd'hui</p>
                    <span className="dashboard__stat-value">{todayBookings.length}</span>
                </div>
                <div className="dashboard__stat-card">
                    <div className="dashboard__stat-accent" style={{ background: '#00c764' }} />
                    <p className="dashboard__stat-label">Revenus du mois</p>
                    <span className="dashboard__stat-value">{monthRevenue.toFixed(2)} €</span>
                </div>
                <div className="dashboard__stat-card">
                    <div className="dashboard__stat-accent" style={{ background: '#8968cd' }} />
                    <p className="dashboard__stat-label">Nouveaux utilisateurs</p>
                    <span className="dashboard__stat-value">{newUsersThisMonth.length}</span>
                </div>
                <div className="dashboard__stat-card">
                    <div className="dashboard__stat-accent" style={{ background: '#ff7e70' }} />
                    <p className="dashboard__stat-label">Bons cadeaux actifs</p>
                    <span className="dashboard__stat-value">{activeGiftVouchers.length}</span>
                </div>
            </article>

            <article className="dashboard__scanner-cta" onClick={() => navigate('/scan')}>
                <div className="dashboard__scanner-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/>
                        <rect x="3" y="16" width="5" height="5" rx="1"/><line x1="16" y1="16" x2="21" y2="16"/>
                        <line x1="16" y1="19" x2="21" y2="19"/><line x1="19" y1="16" x2="19" y2="21"/>
                    </svg>
                </div>
                <div className="dashboard__scanner-text">
                    <span className="dashboard__scanner-title">Scanner un ticket pilote</span>
                    <span className="dashboard__scanner-sub">Accès rapide à la vérification des réservations à l'accueil</span>
                </div>
                <span className="dashboard__scanner-arrow">→</span>
            </article>

            <article className="dashboard__bottom">
                <div className="dashboard__card">
                    <div className="dashboard__card-header">
                        <span className="dashboard__card-title">Réservations récentes</span>
                        <span className="dashboard__card-link" onClick={() => navigate('/reservations')}>Voir tout</span>
                    </div>
                    {recentBookings.map(booking => {
                        const user = users.find(u => u.id == booking.user_id)
                        const initials = user
                            ? `${user.firstname[0]}${user.lastname[0]}`.toUpperCase()
                            : '?'
                        return (
                            <div key={booking.id} className="dashboard__booking-row">
                                <div className="dashboard__booking-initials">{initials}</div>
                                <div className="dashboard__booking-info">
                                    <span className="dashboard__booking-name">
                                        {user ? `${user.firstname} ${user.lastname}` : `Réservation #${booking.id}`}
                                    </span>
                                    <span className="dashboard__booking-detail">
                                        {new Date(booking.date).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })} · {booking.start_time} - {booking.end_time}
                                    </span>
                                </div>
                                <span className={`dashboard__status ${getStatusClass(booking.status)}`}>
                                    {getStatusLabel(booking.status)}
                                </span>
                            </div>
                        )
                    })}
                </div>

                <div className="dashboard__card">
                    <div className="dashboard__card-header">
                        <span className="dashboard__card-title">État des simulateurs</span>
                    </div>
                    {simulators.map(sim => (
                        <div
                            key={sim.id}
                            className="dashboard__sim-row"
                            onClick={() => handleToggleSimulator(sim)}
                            title={sim.is_active ? 'Cliquer pour désactiver' : 'Cliquer pour activer'}
                        >
                            <span className={`dashboard__sim-dot ${sim.is_active ? 'dashboard__sim-dot--on' : 'dashboard__sim-dot--off'}`} />
                            <span className="dashboard__sim-name">{sim.name}</span>
                            <span className="dashboard__sim-status" style={{ width: '7rem', textAlign: 'right', display: 'inline-block' }}>
                                {sim.is_active ? 'Actif' : 'Hors ligne'}
                            </span>
                        </div>
                    ))}
                </div>
            </article>
        </section>
    )
}
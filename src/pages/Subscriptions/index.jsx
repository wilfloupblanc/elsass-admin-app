import './Subscriptions.scss'
import { useState } from 'react'
import { useGetSubscriptionsQuery, useGetUsersQuery } from '../../store/ApiSlice/adminApiSlice'

export const Subscriptions = () => {
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')

    const { data: subscriptionsData } = useGetSubscriptionsQuery()
    const { data: usersData } = useGetUsersQuery()

    const subscriptions = subscriptionsData?.subscriptions ?? []
    const users = usersData?.users ?? []

    const getUser = (id) => users.find(u => u.id == id)

    const formatDate = (date) => {
        if (!date) return '—'
        return new Date(date).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })
    }

    const filteredSubscriptions = subscriptions
        .filter(s => {
            if (filter === 'active') return s.status === 'active'
            if (filter === 'cancelled') return s.status === 'cancelled'
            if (filter === 'pending_cancellation') return s.status === 'pending_cancellation'
            if (filter === 'STARTER') return s.plan === 'STARTER' && s.status === 'active'
            if (filter === 'PLUS') return s.plan === 'PLUS' && s.status === 'active'
            if (filter === 'ULTRA') return s.plan === 'ULTRA' && s.status === 'active'
            return true
        })
        .filter(s => {
            if (!search) return true
            const user = getUser(s.user_id)
            const name = `${user?.firstname ?? ''} ${user?.lastname ?? ''} ${user?.email ?? ''}`.toLowerCase()
            return name.includes(search.toLowerCase())
        })
        .sort((a, b) => new Date(b.current_period_start) - new Date(a.current_period_start))

    const activeSubs = subscriptions.filter(s => s.status === 'active')

    const stats = {
        active: activeSubs.length,
        sessionUsed: subscriptions
            .filter(s => s.status === 'active' || s.status === 'pending_cancellation')
            .reduce((acc, s) => acc + (s.monthly_free_session_used ? 1 : 0), 0),
        sessionAvailable: subscriptions
            .filter(s => s.status === 'active' || s.status === 'pending_cancellation')
            .reduce((acc, s) => acc + (s.free_sessions_remaining ?? 0), 0),
        starter: activeSubs.filter(s => s.plan === 'STARTER').length,
        plus: activeSubs.filter(s => s.plan === 'PLUS').length,
        ultra: activeSubs.filter(s => s.plan === 'ULTRA').length,
    }

    const getPlanClass = (plan) => {
        switch (plan) {
            case 'STARTER': return 'subscriptions__plan--starter'
            case 'PLUS': return 'subscriptions__plan--plus'
            case 'ULTRA': return 'subscriptions__plan--ultra'
            default: return ''
        }
    }

    return (
        <section className="subscriptions">
            <article className="subscriptions__topbar">
                <h1 className="subscriptions__title">Abonnements</h1>
                <div className="subscriptions__topbar-right">
                    <input
                        className="subscriptions__search"
                        type="text"
                        placeholder="Rechercher un membre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="subscriptions__filters">
                        {[
                            { key: 'all', label: 'Tous' },
                            { key: 'active', label: 'Actifs' },
                            { key: 'pending_cancellation', label: 'En cours d\'annulation' },
                            { key: 'cancelled', label: 'Inactifs' },
                            { key: 'STARTER', label: 'Starter' },
                            { key: 'PLUS', label: 'Plus' },
                            { key: 'ULTRA', label: 'Ultra' },
                        ].map(f => (
                            <button
                                key={f.key}
                                className={`subscriptions__filter ${filter === f.key ? 'subscriptions__filter--active' : ''}`}
                                onClick={() => setFilter(f.key)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </article>

            <article className="subscriptions__stats">
                <div className="subscriptions__stat">
                    <span className="subscriptions__stat-label">Membres actifs</span>
                    <span className="subscriptions__stat-value">{stats.active}</span>
                </div>
                <div className="subscriptions__stat">
                    <span className="subscriptions__stat-label">Sessions utilisées (période en cours)</span>
                    <span className="subscriptions__stat-value">{stats.sessionUsed}</span>
                    <span className="subscriptions__stat-sub">Sur {stats.active} membres actifs</span>
                </div>
                <div className="subscriptions__stat">
                    <span className="subscriptions__stat-label">Sessions non utilisées (période en cours)</span>
                    <span className="subscriptions__stat-value subscriptions__stat-value--warning">{stats.sessionAvailable}</span>
                    <span className="subscriptions__stat-sub subscriptions__stat-sub--warning">À relancer</span>
                </div>
            </article>

            <article className="subscriptions__plans">
                <h2 className="subscriptions__plans-title">Répartition par plan</h2>
                <div className="subscriptions__plans-grid">
                    {[
                        { key: 'starter', label: 'Starter', count: stats.starter },
                        { key: 'plus', label: 'Plus', count: stats.plus },
                        { key: 'ultra', label: 'Ultra', count: stats.ultra },
                    ].map(p => (
                        <div key={p.key} className={`subscriptions__plan subscriptions__plan--${p.key}`}>
                            <span className="subscriptions__plan-label">{p.label}</span>
                            <span className="subscriptions__plan-count">{p.count}</span>
                            <span className="subscriptions__plan-sub">
                                {stats.active > 0 ? Math.round((p.count / stats.active) * 100) : 0}% des membres actifs
                            </span>
                        </div>
                    ))}
                </div>
            </article>

            <article className="subscriptions__table-wrap">
                <table className="subscriptions__table">
                    <thead>
                    <tr>
                        <th>Membre</th>
                        <th>Plan</th>
                        <th>Abonné depuis</th>
                        <th>Prochain renouvellement</th>
                        <th>Sessions offertes</th>
                        <th>Statut</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredSubscriptions.map(sub => {
                        const user = getUser(sub.user_id)
                        const initials = user
                            ? `${user.firstname[0]}${user.lastname[0]}`.toUpperCase()
                            : '?'
                        return (
                            <tr key={sub.id}>
                                <td>
                                    <div className="subscriptions__user">
                                        <div className="subscriptions__initials">{initials}</div>
                                        <div className="subscriptions__user-info">
                                                <span className="subscriptions__user-name">
                                                    {user ? `${user.firstname} ${user.lastname}` : `#${sub.user_id}`}
                                                </span>
                                            <span className="subscriptions__user-email">{user?.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                        <span className={`subscriptions__plan-badge ${getPlanClass(sub.plan)}`}>
                                            {sub.plan}
                                        </span>
                                </td>
                                <td>{formatDate(sub.current_period_start)}</td>
                                <td>{sub.status === 'active' || sub.status === 'pending_cancellation' ? formatDate(sub.current_period_end) : '?'}</td>
                                <td>
                                    {sub.status === 'active' || sub.status === 'pending_cancellation' ? (
                                        <span className={`subscriptions__session ${sub.monthly_free_session_used ? 'subscriptions__session--used' : 'subscriptions__session--available'}`}>
                                            {sub.monthly_free_session_used ? 'Toutes utilisées' : `${sub.free_sessions_remaining} Disponible`}
                                        </span>
                                    ) : '?'}
                                </td>
                                <td>
                                        <span className={`subscriptions__status subscriptions__status--${sub.status === 'active' ? 'active' : sub.status === 'pending_cancellation' ? 'pending' : 'cancelled'}`}>
                                            {sub.status === 'active' ? 'Actif' : sub.status === 'pending_cancellation' ? 'Annulation en cours' : 'Inactif'}
                                        </span>
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
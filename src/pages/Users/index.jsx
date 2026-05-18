import './Users.scss'
import { useState } from 'react'
import { useGetUsersQuery, useGetSubscriptionsQuery } from '../../store/ApiSlice/adminApiSlice'

export const Users = () => {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [selectedUser, setSelectedUser] = useState(null)

    const { data: usersData } = useGetUsersQuery()
    const { data: subscriptionsData } = useGetSubscriptionsQuery()

    const users = usersData?.users ?? []
    const subscriptions = subscriptionsData?.subscriptions ?? []

    const getUserSubscription = (userId) => {
        return subscriptions.find(s => s.user_id == userId && (s.status === 'active' || s.status === 'pending_cancellation'))
    }

    const filteredUsers = users
        .filter(u => {
            if (filter === 'members') return u.is_member
            if (filter === 'non-members') return !u.is_member
            return true
        })
        .filter(u => {
            if (!search) return true
            const fullName = `${u.firstname} ${u.lastname} ${u.email}`.toLowerCase()
            return fullName.includes(search.toLowerCase())
        })

    const getInitials = (user) => {
        return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase()
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })
    }

    return (
        <section className="users">
            <article className="users__topbar">
                <h1 className="users__title">Utilisateurs</h1>
                <input
                    className="users__search"
                    type="text"
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </article>

            <article className="users__filters">
                {[
                    { key: 'all', label: 'Tous' },
                    { key: 'members', label: 'Membres' },
                    { key: 'non-members', label: 'Non membres' },
                ].map(f => (
                    <button
                        key={f.key}
                        className={`users__filter ${filter === f.key ? 'users__filter--active' : ''}`}
                        onClick={() => setFilter(f.key)}
                    >
                        {f.label}
                    </button>
                ))}
            </article>

            <article className="users__content">
                <div className="users__list">
                    {filteredUsers.map(user => {

                        return (
                            <div
                                key={user.id}
                                className={`users__row ${selectedUser?.id === user.id ? 'users__row--selected' : ''}`}
                                onClick={() => setSelectedUser(user)}
                            >
                                <div className="users__initials">{getInitials(user)}</div>
                                <div className="users__info">
                                    <span className="users__name">{user.firstname} {user.lastname}</span>
                                    <span className="users__email">{user.email}</span>
                                </div>
                                <div className="users__badges">
                                    {user.is_member && <span className="users__badge users__badge--member">Membre</span>}
                                    <span className="users__badge users__badge--role">{user.role === 'ROLE_ADMIN' ? 'Admin' : 'Client'}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {selectedUser && (
                    <div className="users__detail">
                        <div className="users__detail-header">
                            <div className="users__detail-avatar">{getInitials(selectedUser)}</div>
                            <div className="users__detail-identity">
                                <h2 className="users__detail-name">{selectedUser.firstname} {selectedUser.lastname}</h2>
                                <span className="users__detail-email">{selectedUser.email}</span>
                            </div>
                        </div>

                        <div className="users__detail-section">
                            <span className="users__detail-section-title">INFORMATIONS</span>
                            <div className="users__detail-row">
                                <span className="users__detail-label">Inscrit le</span>
                                <span className="users__detail-value">{formatDate(selectedUser.created_at)}</span>
                            </div>
                            <div className="users__detail-row">
                                <span className="users__detail-label">Rôle</span>
                                <span className="users__detail-value">{selectedUser.role === 'ROLE_ADMIN' ? 'Administrateur' : 'Client'}</span>
                            </div>
                            <div className="users__detail-row">
                                <span className="users__detail-label">Statut</span>
                                <span className="users__detail-value">{selectedUser.is_member ? 'Membre actif' : 'Non membre'}</span>
                            </div>
                        </div>

                        {getUserSubscription(selectedUser.id) && (
                            <div className="users__detail-section">
                                <span className="users__detail-section-title">ABONNEMENT</span>
                                <div className="users__detail-row">
                                    <span className="users__detail-label">Depuis</span>
                                    <span className="users__detail-value">
                                        {formatDate(getUserSubscription(selectedUser.id).current_period_start)}
                                    </span>
                                </div>
                                <div className="users__detail-row">
                                    <span className="users__detail-label">Prochain renouvellement</span>
                                    <span className="users__detail-value">
                                        {formatDate(getUserSubscription(selectedUser.id).current_period_end)}
                                    </span>
                                </div>
                                <div className="users__detail-row">
                                    <span className="users__detail-label">Session mensuelle</span>
                                    <span className="users__detail-value">
                                        {getUserSubscription(selectedUser.id).monthly_free_session_used ? 'Utilisée' : 'Disponible'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </article>
        </section>
    )
}
import './GiftVouchers.scss'
import { useState } from 'react'
import {
    useGetGiftVouchersQuery,
    useGetUsersQuery,
    useGetSessionsQuery,
    useUpdateGiftVoucherMutation,
} from '../../store/ApiSlice/adminApiSlice'

export const GiftVouchers = () => {
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')

    const { data: giftVouchersData } = useGetGiftVouchersQuery()
    const { data: usersData } = useGetUsersQuery()
    const { data: sessionsData } = useGetSessionsQuery()
    const [updateGiftVoucher] = useUpdateGiftVoucherMutation()

    const giftVouchers = giftVouchersData?.giftvouchers ?? []
    const users = usersData?.users ?? []
    const sessions = sessionsData?.sessions ?? []

    const getUser = (id) => users.find(u => u.id == id)
    const getSession = (id) => sessions.find(s => s.id == id)

    const getStatusLabel = (status) => {
        switch (status) {
            case 'valid': return 'Actif'
            case 'used': return 'Utilisé'
            case 'expired': return 'Expiré'
            case 'free_member': return 'Session membre'
            default: return status
        }
    }

    const getStatusClass = (status) => {
        switch (status) {
            case 'valid': return 'gift-vouchers__status--valid'
            case 'used': return 'gift-vouchers__status--used'
            case 'expired': return 'gift-vouchers__status--expired'
            case 'free_member': return 'gift-vouchers__status--member'
            default: return ''
        }
    }

    const handleStatusChange = async (id, newStatus) => {
        await updateGiftVoucher({
            id,
            status: newStatus,
            used_at: newStatus === 'used' ? new Date().toISOString() : null
        })
    }

    const filteredVouchers = giftVouchers
        .filter(gv => {
            if (filter === 'all') return true
            return gv.status === filter
        })
        .filter(gv => {
            if (!search) return true
            const user = getUser(gv.purchaser_user_id)
            const name = `${gv.recipient_name} ${user?.firstname ?? ''} ${user?.lastname ?? ''}`.toLowerCase()
            return name.includes(search.toLowerCase())
        })
        .sort((a, b) => new Date(b.expires_at) - new Date(a.expires_at))

    const formatDate = (date) => {
        if (!date) return '—'
        return new Date(date).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })
    }

    return (
        <section className="gift-vouchers">
            <article className="gift-vouchers__topbar">
                <h1 className="gift-vouchers__title">Bons Cadeaux</h1>
                <input
                    className="gift-vouchers__search"
                    type="text"
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </article>

            <article className="gift-vouchers__filters">
                {[
                    { key: 'all', label: 'Tous' },
                    { key: 'valid', label: 'Actifs' },
                    { key: 'used', label: 'Utilisés' },
                    { key: 'free_member', label: 'Sessions membre' },
                    { key: 'expired', label: 'Expirés' },
                ].map(f => (
                    <button
                        key={f.key}
                        className={`gift-vouchers__filter ${filter === f.key ? 'gift-vouchers__filter--active' : ''}`}
                        onClick={() => setFilter(f.key)}
                    >
                        {f.label}
                    </button>
                ))}
            </article>

            <article className="gift-vouchers__table-wrap">
                <table className="gift-vouchers__table">
                    <thead>
                    <tr>
                        <th>Destinataire</th>
                        <th>Email destinataire</th>
                        <th>Acheteur</th>
                        <th>Session</th>
                        <th>Montant</th>
                        <th>Expiration</th>
                        <th>Utilisé le</th>
                        <th>Statut</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredVouchers.map(gv => {
                        const buyer = getUser(gv.purchaser_user_id)
                        const session = getSession(gv.session_id)
                        return (
                            <tr key={gv.id}>
                                <td>{gv.recipient_name}</td>
                                <td>{gv.recipient_email}</td>
                                <td>
                                    {buyer
                                        ? `${buyer.firstname} ${buyer.lastname}`
                                        : `#${gv.purchaser_user_id}`}
                                </td>
                                <td>{session ? `${session.duration_minutes} min` : '—'}</td>
                                <td>{gv.amount_paid > 0 ? `${gv.amount_paid} €` : 'Gratuit'}</td>
                                <td>{formatDate(gv.expires_at)}</td>
                                <td>{formatDate(gv.used_at)}</td>
                                <td>
                                    <select
                                        className={`gift-vouchers__status ${getStatusClass(gv.status)}`}
                                        value={gv.status}
                                        onChange={(e) => handleStatusChange(gv.id, e.target.value)}
                                    >
                                        <option value="valid">Actif</option>
                                        <option value="used">Utilisé</option>
                                    </select>
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
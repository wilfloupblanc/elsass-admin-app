import './DiscountCodes.scss'
import { useState } from 'react'
import {
    useGetDiscountCodesQuery,
    useCreateDiscountCodeMutation,
    useDeleteDiscountCodeMutation
} from '../../store/ApiSlice/adminApiSlice'

export const DiscountCodes = () => {
    const [showModal, setShowModal] = useState(false)
    const [newCode, setNewCode] = useState({
        code: '',
        type: 'percent',
        value: '',
        applies_to: 'both',
        expires_at: '',
        max_uses: ''
    })

    const { data } = useGetDiscountCodesQuery()
    const [createDiscountCode] = useCreateDiscountCodeMutation()
    const [deleteDiscountCode] = useDeleteDiscountCodeMutation()

    const codes = data?.codes ?? []

    const formatDate = (date) => {
        if (!date) return '—'
        return new Date(date).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })
    }

    const getAppliesToLabel = (applies_to) => {
        if (applies_to === 'session') return 'Session'
        if (applies_to === 'gift_voucher') return 'Bon cadeau'
        return 'Les deux'
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        await createDiscountCode({
            ...newCode,
            value: Number(newCode.value),
            max_uses: newCode.max_uses ? Number(newCode.max_uses) : null,
            expires_at: newCode.expires_at || null
        })
        setShowModal(false)
        setNewCode({ code: '', type: 'percent', value: '', applies_to: 'both', expires_at: '', max_uses: '' })
    }

    return (
        <section className="discount-codes">
            <article className="discount-codes__topbar">
                <h1 className="discount-codes__title">Codes de réduction</h1>
                <button className="discount-codes__add-btn" onClick={() => setShowModal(true)}>
                    + Nouveau code
                </button>
            </article>

            <article className="discount-codes__table-wrap">
                <table className="discount-codes__table">
                    <thead>
                    <tr>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Valeur</th>
                        <th>S'applique à</th>
                        <th>Expiration</th>
                        <th>Utilisations</th>
                        <th>Statut</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {codes.map(code => (
                        <tr key={code.id}>
                            <td><span className="discount-codes__code">{code.code}</span></td>
                            <td>{code.type === 'percent' ? 'Pourcentage' : 'Montant fixe'}</td>
                            <td>{code.type === 'percent' ? `${code.value}%` : `${code.value.toFixed(2)} €`}</td>
                            <td>{getAppliesToLabel(code.applies_to)}</td>
                            <td>{formatDate(code.expires_at)}</td>
                            <td>
                                {code.max_uses !== null
                                    ? `${code.uses_count} / ${code.max_uses}`
                                    : `${code.uses_count} / ∞`
                                }
                            </td>
                            <td>
                                    <span className={`discount-codes__status discount-codes__status--${code.is_active ? 'active' : 'inactive'}`}>
                                        {code.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                            </td>
                            <td>
                                <button
                                    className="discount-codes__delete-btn"
                                    onClick={() => deleteDiscountCode(code.id)}
                                >
                                    ×
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </article>

            {showModal && (
                <div className="discount-codes__modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="discount-codes__modal" onClick={e => e.stopPropagation()}>
                        <h2 className="discount-codes__modal-title">Nouveau code de réduction</h2>
                        <form className="discount-codes__modal-form" onSubmit={handleCreate}>
                            <div className="discount-codes__modal-field">
                                <label>Code</label>
                                <input
                                    type="text"
                                    value={newCode.code}
                                    onChange={e => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                                    placeholder="ex: SUMMER20"
                                    required
                                />
                            </div>
                            <div className="discount-codes__modal-row">
                                <div className="discount-codes__modal-field">
                                    <label>Type</label>
                                    <select
                                        value={newCode.type}
                                        onChange={e => setNewCode({ ...newCode, type: e.target.value })}
                                    >
                                        <option value="percent">Pourcentage</option>
                                        <option value="fixed">Montant fixe</option>
                                    </select>
                                </div>
                                <div className="discount-codes__modal-field">
                                    <label>Valeur {newCode.type === 'percent' ? '(%)' : '(€)'}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={newCode.type === 'percent' ? 100 : undefined}
                                        value={newCode.value}
                                        onChange={e => setNewCode({ ...newCode, value: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="discount-codes__modal-field">
                                <label>S'applique à</label>
                                <select
                                    value={newCode.applies_to}
                                    onChange={e => setNewCode({ ...newCode, applies_to: e.target.value })}
                                >
                                    <option value="both">Les deux</option>
                                    <option value="session">Session uniquement</option>
                                    <option value="gift_voucher">Bon cadeau uniquement</option>
                                </select>
                            </div>
                            <div className="discount-codes__modal-row">
                                <div className="discount-codes__modal-field">
                                    <label>Date d'expiration <span>(optionnel)</span></label>
                                    <input
                                        type="date"
                                        value={newCode.expires_at}
                                        onChange={e => setNewCode({ ...newCode, expires_at: e.target.value })}
                                    />
                                </div>
                                <div className="discount-codes__modal-field">
                                    <label>Nb max d'utilisations <span>(optionnel)</span></label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newCode.max_uses}
                                        onChange={e => setNewCode({ ...newCode, max_uses: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="discount-codes__modal-actions">
                                <button type="button" className="discount-codes__modal-cancel" onClick={() => setShowModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="discount-codes__modal-submit">
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    )
}
import './Scan.scss'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useGetBookingsQuery, useGetUsersQuery, useCheckInBookingMutation, useValidateFreeSessionTokenMutation } from '../../store/ApiSlice/adminApiSlice'

export const Scan = () => {
    const [scannedId, setScannedId] = useState(null)
    const [scannedToken, setScannedToken] = useState(null)
    const [scannedType, setScannedType] = useState(null) // 'booking' | 'freeSession'
    const [freeSessionResult, setFreeSessionResult] = useState(null)
    const [history, setHistory] = useState([])
    const [buffer, setBuffer] = useState('')
    const [lastKeyTime, setLastKeyTime] = useState(0)
    const ghostRef = useRef(null)

    const { data: bookingsData, refetch: refetchBookings } = useGetBookingsQuery()
    const { data: usersData } = useGetUsersQuery()
    const [checkIn] = useCheckInBookingMutation()
    const [validateFreeSessionToken] = useValidateFreeSessionTokenMutation()

    const bookings = bookingsData?.bookings ?? []
    const users = usersData?.users ?? []

    const booking = scannedId && scannedType === 'booking'
        ? bookings.find(b => b.id == scannedId)
        : null

    const user = booking
        ? users.find(u => u.id == booking.user_id)
        : null

    const isEventBooking = booking?.event_id !== null && booking?.event_id !== undefined

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
            case 'confirmed': return 'scan__status--confirmed'
            case 'pending': return 'scan__status--pending'
            case 'pending_payment': return 'scan__status--pending'
            case 'cancelled': return 'scan__status--cancelled'
            default: return ''
        }
    }

    const handleScan = useCallback((code) => {
        const value = code.includes('/') ? code.split('/').pop() : code

        if (value.length === 64 && /^[a-f0-9]+$/.test(value)) {
            setScannedType('freeSession')
            setScannedToken(value)
            setScannedId(null)
            setFreeSessionResult(null)
        } else {
            setScannedType('booking')
            setScannedId(value)
            setScannedToken(null)
            setFreeSessionResult(null)
        }
    }, [])

    const handleCheckIn = async () => {
        try {
            await checkIn(scannedId).unwrap()
            await refetchBookings()
        } catch (error) {
            console.error('Erreur check-in:', error)
        }
    }

    // Dès qu'un token free session est scanné, on l'invalide immédiatement
    useEffect(() => {
        if (!scannedToken || scannedType !== 'freeSession') return

        const doValidate = async () => {
            try {
                const result = await validateFreeSessionToken(scannedToken).unwrap()
                setFreeSessionResult({ valid: true, ...result })
            } catch (error) {
                setFreeSessionResult({
                    valid: false,
                    reason: error?.data?.reason ?? 'Session déjà utilisée',
                    used_at: error?.data?.used_at ?? null
                })
            }
        }

        doValidate()
    }, [scannedToken, scannedType])

    useEffect(() => {
        if (!scannedId || !booking || !user) return
        setHistory(prev => [{
            id: scannedId,
            name: `${user.firstname} ${user.lastname}`,
            type: 'booking'
        }, ...prev].slice(0, 5))
    }, [scannedId, booking, user])

    useEffect(() => {
        if (!freeSessionResult?.valid) return
        setHistory(prev => [{
            id: scannedToken.slice(0, 8) + '...',
            name: `${freeSessionResult.user.firstname} ${freeSessionResult.user.lastname}`,
            type: 'freeSession'
        }, ...prev].slice(0, 5))
    }, [freeSessionResult])

    useEffect(() => {
        ghostRef.current?.focus()
    }, [])

    useEffect(() => {
        const handleKeyDown = (e) => {
            const now = Date.now()
            const delay = now - lastKeyTime
            setLastKeyTime(now)

            if (e.key === 'Enter') {
                if (buffer.length > 0) {
                    handleScan(buffer.trim())
                    setBuffer('')
                }
                return
            }

            if (e.key.length > 1) return

            if (delay > 100 && buffer.length > 0) {
                setBuffer('')
            }

            setBuffer(prev => prev + e.key)
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [buffer, lastKeyTime, handleScan])

    return (
        <section className="scan">
            <article className="scan__topbar">
                <h1 className="scan__title">Scanner QR — Accueil pilotes</h1>
                <div className="scan__pulse-wrap">
                    <span className="scan__pulse" />
                    <span className="scan__pulse-label">En attente d'un scan</span>
                </div>
            </article>

            <article className="scan__body">
                <div className="scan__waiting">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3c3c3c" strokeWidth="1.5" strokeLinecap="round">
                        <rect x="3" y="3" width="5" height="5" rx="1"/>
                        <rect x="16" y="3" width="5" height="5" rx="1"/>
                        <rect x="3" y="16" width="5" height="5" rx="1"/>
                        <rect x="8.5" y="8.5" width="3" height="3" rx=".5" fill="#3c3c3c" stroke="none"/>
                        <line x1="16" y1="16" x2="21" y2="16"/>
                        <line x1="16" y1="19" x2="21" y2="19"/>
                        <line x1="19" y1="16" x2="19" y2="21"/>
                    </svg>
                    <p className="scan__waiting-label">Pointez la douchette vers le ticket</p>
                </div>

                {/* RÉSULTAT RÉSERVATION */}
                {scannedType === 'booking' && scannedId && (
                    <div className="scan__result">
                        {booking ? (
                            <>
                                <div className={`scan__status ${getStatusClass(booking.status)}`}>
                                    <span className="scan__status-dot" />
                                    {getStatusLabel(booking.status)}
                                </div>
                                <h2 className="scan__pilot-name">
                                    {user ? `${user.firstname} ${user.lastname}` : `Utilisateur #${booking.user_id}`}
                                </h2>
                                <div className="scan__divider" />
                                <div className="scan__info-grid">
                                    {isEventBooking ? (
                                        <>
                                            <div className="scan__info-item">
                                                <span className="scan__info-label">Type</span>
                                                <span className="scan__info-value">Événement</span>
                                            </div>
                                            <div className="scan__info-item">
                                                <span className="scan__info-label">Date</span>
                                                <span className="scan__info-value">
                                                    {new Date(booking.date).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}
                                                </span>
                                            </div>
                                            <div className="scan__info-item">
                                                <span className="scan__info-label">Pilotes</span>
                                                <span className="scan__info-value">{booking.pilots}</span>
                                            </div>
                                            <div className="scan__info-item">
                                                <span className="scan__info-label">Prix payé</span>
                                                <span className="scan__info-value">{booking.price_paid?.toFixed(2)}€</span>
                                            </div>
                                            <div className="scan__info-item">
                                                <span className="scan__info-label">Réservation</span>
                                                <span className="scan__info-value">#{booking.id}</span>
                                            </div>
                                            <div className="scan__info-item">
                                                <span className="scan__info-label">Email</span>
                                                <span className="scan__info-value">{user?.email ?? '?'}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="scan__info-item">
                                                <span className="scan__info-label">Simulateur</span>
                                                <span className="scan__info-value">#{booking.simulator_id}</span>
                                            </div>
                                            <div className="scan__info-item">
                                                <span className="scan__info-label">Date</span>
                                                <span className="scan__info-value">
                                                    {new Date(booking.date).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}
                                                </span>
                                            </div>
                                            <div className="scan__info-item">
                                                <span className="scan__info-label">Créneau</span>
                                                <span className="scan__info-value">{booking.start_time} → {booking.end_time}</span>
                                            </div>
                                            <div className="scan__info-item">
                                                <span className="scan__info-label">Pilotes</span>
                                                <span className="scan__info-value">{booking.pilots}</span>
                                            </div>
                                            <div className="scan__info-item">
                                                <span className="scan__info-label">Réservation</span>
                                                <span className="scan__info-value">#{booking.id}</span>
                                            </div>
                                            <div className="scan__info-item">
                                                <span className="scan__info-label">Email</span>
                                                <span className="scan__info-value">{user?.email ?? '?'}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="scan__divider" />

                                {booking.checked_in ? (
                                    <div className="scan__already-checked">
                                        Déjà validé le {new Date(booking.checked_in_at).toLocaleString('fr-FR')}
                                    </div>
                                ) : booking.status === 'confirmed' ? (
                                    <button className="scan__checkin-btn" onClick={handleCheckIn}>
                                        Valider l'entrée
                                    </button>
                                ) : null}
                            </>
                        ) : (
                            <div className="scan__not-found">
                                Réservation introuvable pour l'ID : {scannedId}
                            </div>
                        )}
                    </div>
                )}

                {/* RÉSULTAT SESSION GRATUITE */}
                {scannedType === 'freeSession' && scannedToken && (
                    <div className="scan__result">
                        {freeSessionResult === null ? (
                            <div className="scan__waiting-label">Validation en cours...</div>
                        ) : freeSessionResult.valid ? (
                            <>
                                <div className="scan__status scan__status--confirmed">
                                    <span className="scan__status-dot" />
                                    Session gratuite validée
                                </div>
                                <h2 className="scan__pilot-name">
                                    {freeSessionResult.user.firstname} {freeSessionResult.user.lastname}
                                </h2>
                                <div className="scan__divider" />
                                <div className="scan__info-grid">
                                    <div className="scan__info-item">
                                        <span className="scan__info-label">Plan</span>
                                        <span className="scan__info-value">{freeSessionResult.subscription.plan}</span>
                                    </div>
                                    <div className="scan__info-item">
                                        <span className="scan__info-label">Email</span>
                                        <span className="scan__info-value">{freeSessionResult.user.email}</span>
                                    </div>
                                    <div className="scan__info-item">
                                        <span className="scan__info-label">Sessions restantes</span>
                                        <span className="scan__info-value" style={{ color: '#00c764' }}>
                                            {freeSessionResult.free_sessions_remaining}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="scan__not-found">
                                {freeSessionResult.reason}
                                {freeSessionResult.used_at && (
                                    <span> — utilisée le {new Date(freeSessionResult.used_at).toLocaleString('fr-FR')}</span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </article>

            {history.length > 0 && (
                <article className="scan__history">
                    <span className="scan__history-title">SCANS PRÉCÉDENTS</span>
                    {history.map((h, i) => (
                        <div key={i} className="scan__history-item">
                            <span className="scan__history-dot" />
                            <span className="scan__history-name">{h.name}</span>
                            <span className="scan__history-detail">
                                {h.type === 'freeSession' ? 'Session gratuite' : `#${h.id}`}
                            </span>
                        </div>
                    ))}
                </article>
            )}

            <input
                ref={ghostRef}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                onBlur={() => ghostRef.current?.focus()}
                readOnly
            />
        </section>
    )
}
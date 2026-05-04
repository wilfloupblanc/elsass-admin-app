import './Availabilities.scss'
import { useState, useMemo, useCallback } from 'react'
import {
    useCreateAvailabilityMutation,
    useUpdateAvailabilityMutation,
    useDeleteAvailabilityMutation,
    useGetAvailabilitiesByWeekQuery,
} from '../../store/ApiSlice/adminApiSlice'
import React from 'react'

const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const getMonday = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    d.setHours(0, 0, 0, 0)
    return d
}

const TIME_SLOTS = (() => {
    const slots = []
    for (let h = 10; h <= 20; h++) {
        for (let m = 0; m < 60; m += 15) {
            if (h === 20 && m > 15) break
            slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
        }
    }
    return slots
})()

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export const Availabilities = () => {
    const [weekStart, setWeekStart] = useState(getMonday(new Date()))
    const [showModal, setShowModal] = useState(false)
    const [newSlot, setNewSlot] = useState({
        date: '',
        start_time: '',
        slots_total: 6,
        slots_remaining: 6,
        is_open: true
    })
    const [editingSlot, setEditingSlot] = useState(null)
    const [editingValue, setEditingValue] = useState(0)

    const { data, isLoading, isFetching } = useGetAvailabilitiesByWeekQuery(
        formatDate(weekStart),
        { refetchOnMountOrArgChange: true }
    )
    const [createAvailability] = useCreateAvailabilityMutation()
    const [updateAvailability] = useUpdateAvailabilityMutation()
    const [deleteAvailability] = useDeleteAvailabilityMutation()

    const availabilities = data?.availabilities ?? []
    const today = formatDate(new Date())

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(weekStart)
            d.setDate(d.getDate() + i)
            return d
        })
    }, [weekStart])

    const availabilitiesByDay = useMemo(() => {
        const map = {}
        weekDays.forEach(day => {
            const dateStr = formatDate(day)
            map[dateStr] = availabilities
                .filter(a => {
                    const d = new Date(a.date).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })
                    const [dd, mm, yyyy] = d.split('/')
                    return `${yyyy}-${mm}-${dd}` === dateStr
                })
                .sort((a, b) => {
                    const aTime = a.start_time ?? ''
                    const bTime = b.start_time ?? ''
                    return aTime.localeCompare(bTime)
                })
        })
        return map
    }, [availabilities, weekDays])

    const getWeekLabel = useMemo(() => {
        const first = weekDays[0]
        const last = weekDays[6]
        const firstStr = first.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: first.getMonth() !== last.getMonth() ? 'long' : undefined
        })
        const lastStr = last.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        return `${firstStr} — ${lastStr}`
    }, [weekDays])

    const prevWeek = useCallback(() => {
        const d = new Date(weekStart)
        d.setDate(d.getDate() - 7)
        setWeekStart(d)
    }, [weekStart])

    const nextWeek = useCallback(() => {
        const d = new Date(weekStart)
        d.setDate(d.getDate() + 7)
        setWeekStart(d)
    }, [weekStart])

    const getSlotForTime = useCallback((dayAvailabilities, time) => {
        return dayAvailabilities.find(a => a.start_time?.slice(0, 5) === time)
    }, [])

    const getSlotClass = useCallback((slot, day) => {
        const dayDate = new Date(formatDate(day))
        const todayDate = new Date(today)
        if (dayDate < todayDate) return 'availabilities__slot--past'
        if (!slot.is_open) return 'availabilities__slot--closed'
        if (slot.slots_remaining === 0) return 'availabilities__slot--full'
        return 'availabilities__slot--open'
    }, [today])

    const handleToggleOpen = useCallback(async (slot) => {
        await updateAvailability({ id: slot.id, is_open: !slot.is_open })
    }, [updateAvailability])

    const handleDelete = useCallback(async (e, id) => {
        e.stopPropagation()
        await deleteAvailability(id)
    }, [deleteAvailability])

    const handleEditStart = useCallback((e, slot) => {
        e.stopPropagation()
        setEditingSlot(slot.id)
        setEditingValue(slot.slots_remaining)
    }, [])

    const handleEditSave = useCallback(async (slot) => {
        await updateAvailability({ id: slot.id, slots_remaining: Number(editingValue) })
        setEditingSlot(null)
    }, [updateAvailability, editingValue])

    const handleCreate = async (e) => {
        e.preventDefault()
        await createAvailability(newSlot)
        setShowModal(false)
        setNewSlot({ date: '', start_time: '', slots_total: 6, slots_remaining: 6, is_open: true })
    }

    return (
        <section className="availabilities">
            <article className="availabilities__topbar">
                <h1 className="availabilities__title">Disponibilités</h1>
                <div className="availabilities__controls">
                    <div className="availabilities__week-nav">
                        <button className="availabilities__week-btn" onClick={prevWeek}>←</button>
                        <span className="availabilities__week-label">{getWeekLabel}</span>
                        <button className="availabilities__week-btn" onClick={nextWeek}>→</button>
                    </div>
                    <button className="availabilities__add-btn" onClick={() => setShowModal(true)}>
                        + Nouveau créneau
                    </button>
                </div>
            </article>

            <article className="availabilities__legend">
                <div className="availabilities__legend-item">
                    <span className="availabilities__legend-dot availabilities__legend-dot--open" />
                    Disponible
                </div>
                <div className="availabilities__legend-item">
                    <span className="availabilities__legend-dot availabilities__legend-dot--full" />
                    Complet
                </div>
                <div className="availabilities__legend-item">
                    <span className="availabilities__legend-dot availabilities__legend-dot--closed" />
                    Fermé
                </div>
            </article>

            <article className="availabilities__agenda-wrap">
                {isLoading || isFetching ? (
                    <div className="availabilities__loading">Chargement...</div>
                ) : (
                    <div className="availabilities__agenda">
                        <div className="availabilities__corner" />
                        {weekDays.map((day, i) => (
                            <div key={i} className="availabilities__day-header">
                                <span className="availabilities__day-name">{DAY_LABELS[i]}</span>
                                <span className={`availabilities__day-date ${formatDate(day) === today ? 'availabilities__day-date--today' : ''}`}>
                                    {day.getDate()}
                                </span>
                            </div>
                        ))}
                        {TIME_SLOTS.map(time => (
                            <React.Fragment key={time}>
                                <div className="availabilities__time-cell">{time}</div>
                                {weekDays.map((day, i) => {
                                    const dayAvailabilities = availabilitiesByDay[formatDate(day)] ?? []
                                    const slot = getSlotForTime(dayAvailabilities, time)
                                    return (
                                        <div key={`cell-${i}-${time}`} className="availabilities__cell">
                                            {slot && (
                                                <div
                                                    className={`availabilities__slot ${getSlotClass(slot, day)}`}
                                                    onClick={() => handleToggleOpen(slot)}
                                                    title={slot.is_open ? 'Cliquer pour fermer' : 'Cliquer pour ouvrir'}
                                                >
                                                    {editingSlot === slot.id ? (
                                                        <input
                                                            className="availabilities__slot-input"
                                                            type="number"
                                                            min="0"
                                                            max={slot.slots_total}
                                                            value={editingValue}
                                                            onChange={e => setEditingValue(e.target.value)}
                                                            onBlur={() => handleEditSave(slot)}
                                                            onKeyDown={e => e.key === 'Enter' && handleEditSave(slot)}
                                                            onClick={e => e.stopPropagation()}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span onClick={(e) => slot.is_open && handleEditStart(e, slot)}>
                                                            {slot.is_open ? `${slot.slots_remaining}/${slot.slots_total}` : 'Fermé'}
                                                        </span>
                                                    )}
                                                    <button
                                                        className="availabilities__slot-delete"
                                                        onClick={(e) => handleDelete(e, slot.id)}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </article>

            {showModal && (
                <div className="availabilities__modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="availabilities__modal" onClick={e => e.stopPropagation()}>
                        <h2 className="availabilities__modal-title">Nouveau créneau</h2>
                        <form className="availabilities__modal-form" onSubmit={handleCreate}>
                            <div className="availabilities__modal-field">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={newSlot.date}
                                    onChange={e => setNewSlot({ ...newSlot, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="availabilities__modal-field">
                                <label>Heure de début</label>
                                <input
                                    type="time"
                                    value={newSlot.start_time}
                                    onChange={e => setNewSlot({ ...newSlot, start_time: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="availabilities__modal-field">
                                <label>Nombre de places</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={newSlot.slots_total}
                                    onChange={e => setNewSlot({
                                        ...newSlot,
                                        slots_total: Number(e.target.value),
                                        slots_remaining: Number(e.target.value)
                                    })}
                                    required
                                />
                            </div>
                            <div className="availabilities__modal-actions">
                                <button type="button" className="availabilities__modal-cancel" onClick={() => setShowModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="availabilities__modal-submit">
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
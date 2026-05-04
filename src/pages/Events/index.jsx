import './Events.scss'
import { useState } from 'react'
import {
    useGetEventsQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
} from '../../store/ApiSlice/adminApiSlice'

const VEHICLE_CATEGORIES = [
    'GT3', 'GT4', 'GTE', 'Hypercar / LMH', 'LMP2',
    'Formula 2', 'Formula 1', 'Touring Car', 'Rally'
]

export const Events = () => {
    const [filter, setFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [editingEvent, setEditingEvent] = useState(null)
    const [vehicleInput, setVehicleInput] = useState('')
    const [form, setForm] = useState({
        title: '',
        description: '',
        date: '',
        start_time: '',
        end_time: '',
        simulators_count: 1,
        pilots_per_simulator: 1,
        price: 0,
        vehicles: [],
        vehicle_categories: [],
        access: 'all',
    })

    const { data: eventsData } = useGetEventsQuery()
    const [createEvent] = useCreateEventMutation()
    const [updateEvent] = useUpdateEventMutation()
    const [deleteEvent] = useDeleteEventMutation()

    const events = eventsData?.events ?? []
    const today = new Date().toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })

    const getEventStatus = (event) => {
        const eventDate = new Date(event.date).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })
        if (eventDate === today) return 'today'
        if (new Date(event.date) > new Date()) return 'upcoming'
        return 'past'
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'today': return "Aujourd'hui"
            case 'upcoming': return 'À venir'
            case 'past': return 'Passé'
        }
    }

    const getStatusClass = (status) => {
        switch (status) {
            case 'today': return 'events__pill--today'
            case 'upcoming': return 'events__pill--upcoming'
            case 'past': return 'events__pill--past'
        }
    }

    const filteredEvents = events
        .filter(e => {
            const status = getEventStatus(e)
            if (filter === 'upcoming') return status === 'upcoming'
            if (filter === 'today') return status === 'today'
            if (filter === 'past') return status === 'past'
            return true
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))

    const handleOpenCreate = () => {
        setEditingEvent(null)
        setVehicleInput('')
        setForm({
            title: '',
            description: '',
            date: '',
            start_time: '',
            end_time: '',
            simulators_count: 1,
            pilots_per_simulator: 1,
            price: 0,
            vehicles: [],
            vehicle_categories: [],
            access: 'all',
        })
        setShowModal(true)
    }

    const handleOpenEdit = (event) => {
        setEditingEvent(event)
        setVehicleInput('')
        setForm({
            title: event.title,
            description: event.description ?? '',
            date: event.date?.toString().split('T')[0],
            start_time: event.start_time,
            end_time: event.end_time,
            simulators_count: event.simulators_count,
            pilots_per_simulator: event.pilots_per_simulator,
            price: event.price,
            vehicles: event.vehicles ? JSON.parse(event.vehicles) : [],
            vehicle_categories: event.vehicle_categories ? JSON.parse(event.vehicle_categories) : [],
            access: event.access ?? 'all',
        })
        setShowModal(true)
    }

    const handleAddVehicle = () => {
        if (vehicleInput.trim()) {
            setForm({ ...form, vehicles: [...form.vehicles, vehicleInput.trim()] })
            setVehicleInput('')
        }
    }

    const handleRemoveVehicle = (index) => {
        setForm({ ...form, vehicles: form.vehicles.filter((_, i) => i !== index) })
    }

    const handleToggleCategory = (cat) => {
        const updated = form.vehicle_categories.includes(cat)
            ? form.vehicle_categories.filter(c => c !== cat)
            : [...form.vehicle_categories, cat]
        setForm({ ...form, vehicle_categories: updated })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const payload = {
            ...form,
            vehicles: JSON.stringify(form.vehicles),
            vehicle_categories: JSON.stringify(form.vehicle_categories),
        }
        if (editingEvent) {
            await updateEvent({ id: editingEvent.id, ...payload })
        } else {
            await createEvent(payload)
        }
        setShowModal(false)
    }

    const handleDelete = async (id) => {
        await deleteEvent(id)
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'Europe/Paris'
        })
    }

    const bannerColors = [
        'linear-gradient(135deg,#1a2a3a,#0d1f2d)',
        'linear-gradient(135deg,#1a2d1a,#0d2010)',
        'linear-gradient(135deg,#2a1a2a,#1d0d1d)',
        'linear-gradient(135deg,#2a2a1a,#1d1d0d)',
        'linear-gradient(135deg,#2a1a1a,#1d0d0d)',
        'linear-gradient(135deg,#1a1a2a,#0d0d1d)',
    ]

    const bannerEmojis = ['🏁', '🎮', '🏆', '🎯', '🚀', '⚡']

    return (
        <section className="events">
            <article className="events__topbar">
                <h1 className="events__title">Événements</h1>
                <button className="events__add-btn" onClick={handleOpenCreate}>
                    + Nouvel événement
                </button>
            </article>

            <article className="events__tabs">
                {[
                    { key: 'all', label: 'Tous' },
                    { key: 'upcoming', label: 'À venir' },
                    { key: 'today', label: "Aujourd'hui" },
                    { key: 'past', label: 'Passés' },
                ].map(t => (
                    <button
                        key={t.key}
                        className={`events__tab ${filter === t.key ? 'events__tab--active' : ''}`}
                        onClick={() => setFilter(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </article>

            <article className="events__grid">
                {filteredEvents.map((event, i) => {
                    const status = getEventStatus(event)
                    const vehicles = event.vehicles ? JSON.parse(event.vehicles) : []
                    const categories = event.vehicle_categories ? JSON.parse(event.vehicle_categories) : []
                    return (
                        <div key={event.id} className={`events__card ${status === 'past' ? 'events__card--past' : ''}`}>
                            <div className="events__banner" style={{ background: bannerColors[i % bannerColors.length] }}>
                                <span className="events__banner-emoji">{bannerEmojis[i % bannerEmojis.length]}</span>
                                <span className="events__date-badge">{formatDate(event.date)}</span>
                            </div>
                            <div className="events__body">
                                <div className="events__card-title-row">
                                    <span className="events__card-title">{event.title}</span>
                                    {event.access === 'members' && (
                                        <span className="events__access-badge">Membres</span>
                                    )}
                                </div>
                                {event.description && (
                                    <p className="events__card-desc">{event.description}</p>
                                )}
                                {categories.length > 0 && (
                                    <div className="events__card-categories">
                                        {categories.map((c, j) => (
                                            <span key={j} className="events__category-tag">{c}</span>
                                        ))}
                                    </div>
                                )}
                                {vehicles.length > 0 && (
                                    <div className="events__card-vehicles">
                                        {vehicles.map((v, j) => (
                                            <span key={j} className="events__vehicle-tag events__vehicle-tag--display">{v}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="events__card-footer">
                                    <span className="events__card-meta">
                                        {event.start_time?.slice(0, 5)} — {event.end_time?.slice(0, 5)} · {event.simulators_count} sim · {event.pilots_per_simulator} pilote{event.pilots_per_simulator > 1 ? 's' : ''}/sim · {event.price} €
                                    </span>
                                    <span className={`events__pill ${getStatusClass(status)}`}>
                                        {getStatusLabel(status)}
                                    </span>
                                </div>
                                <div className="events__card-actions">
                                    <button className="events__action-btn" onClick={() => handleOpenEdit(event)}>
                                        Modifier
                                    </button>
                                    <button className="events__action-btn events__action-btn--danger" onClick={() => handleDelete(event.id)}>
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </article>

            {showModal && (
                <div className="events__modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="events__modal" onClick={e => e.stopPropagation()}>
                        <h2 className="events__modal-title">
                            {editingEvent ? "Modifier l'événement" : 'Nouvel événement'}
                        </h2>
                        <form className="events__modal-form" onSubmit={handleSubmit}>
                            <div className="events__modal-field">
                                <label>Titre</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="Ex: Championnat SimRacing Alsace"
                                    required
                                />
                            </div>
                            <div className="events__modal-field">
                                <label>Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Décrivez l'événement..."
                                />
                            </div>
                            <div className="events__modal-field">
                                <label>Accès</label>
                                <select
                                    value={form.access}
                                    onChange={e => setForm({ ...form, access: e.target.value })}
                                >
                                    <option value="all">Ouvert à tous</option>
                                    <option value="members">Membres uniquement</option>
                                </select>
                            </div>
                            <div className="events__modal-field">
                                <label>Catégories de véhicules</label>
                                <div className="events__categories">
                                    {VEHICLE_CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            className={`events__category-btn ${form.vehicle_categories.includes(cat) ? 'events__category-btn--active' : ''}`}
                                            onClick={() => handleToggleCategory(cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="events__modal-field">
                                <label>Véhicules disponibles</label>
                                <div className="events__vehicle-input">
                                    <input
                                        type="text"
                                        value={vehicleInput}
                                        onChange={e => setVehicleInput(e.target.value)}
                                        placeholder="Ex: Ferrari 488"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleAddVehicle()
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="events__vehicle-add"
                                        onClick={handleAddVehicle}
                                    >
                                        Ajouter
                                    </button>
                                </div>
                                {form.vehicles.length > 0 && (
                                    <div className="events__vehicle-list">
                                        {form.vehicles.map((v, i) => (
                                            <div key={i} className="events__vehicle-tag">
                                                <span>{v}</span>
                                                <button type="button" onClick={() => handleRemoveVehicle(i)}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="events__modal-row">
                                <div className="events__modal-field">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={e => setForm({ ...form, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="events__modal-field">
                                    <label>Heure de début</label>
                                    <input
                                        type="time"
                                        value={form.start_time}
                                        onChange={e => setForm({ ...form, start_time: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="events__modal-row">
                                <div className="events__modal-field">
                                    <label>Heure de fin</label>
                                    <input
                                        type="time"
                                        value={form.end_time}
                                        onChange={e => setForm({ ...form, end_time: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="events__modal-field">
                                    <label>Simulateurs utilisés</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="6"
                                        value={form.simulators_count}
                                        onChange={e => setForm({ ...form, simulators_count: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="events__modal-row">
                                <div className="events__modal-field">
                                    <label>Pilotes par simulateur</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={form.pilots_per_simulator}
                                        onChange={e => setForm({ ...form, pilots_per_simulator: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="events__modal-field">
                                    <label>Prix par simulateur (€)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price}
                                        onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="events__modal-actions">
                                <button type="button" className="events__modal-cancel" onClick={() => setShowModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="events__modal-submit">
                                    {editingEvent ? 'Mettre à jour' : "Créer l'événement"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    )
}
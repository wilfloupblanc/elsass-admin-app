import "./Sidebar.scss"
import { NavLink } from "react-router"
import { PageColors } from "../../PageColors"
import {useGetMaintenanceStatusQuery, useToggleMaintenanceMutation} from "../../../store/ApiSlice/adminApiSlice";
import {useState} from "react";

export const Sidebar = ({ className }) => {
    const { data } = useGetMaintenanceStatusQuery()
    const [toggleMaintenance, { data: toggleData }] = useToggleMaintenanceMutation()
    const [showConfirm, setShowConfirm] = useState(false)

    const isMaintenance = toggleData?.maintenance ?? data?.maintenance ?? false

    return (
        <aside className={className}>
            <section className="layout__sidebar__title">
                <h2>Elsass SimRacing</h2>
                <p>Administration</p>
            </section>
            <section className="layout__sidebar__pages">
                <NavLink to="/" end style={({ isActive }) => ({
                    color: isActive ? PageColors.dashboard : '',
                    background: isActive ? `${PageColors.dashboard}22` : 'transparent',
                })}>
                    <div style={{ background: PageColors.dashboard }} />
                    <h3>Dashboard</h3>
                </NavLink>
                <NavLink to="/reservations" style={({ isActive }) => ({
                    color: isActive ? PageColors.reservations : '',
                    background: isActive ? `${PageColors.reservations}22` : 'transparent',
                })}>
                    <div style={{ background: PageColors.reservations }} />
                    <h3>Réservations</h3>
                </NavLink>
                <NavLink to="/availabilities" style={({ isActive }) => ({
                    color: isActive ? PageColors.disponibilites : '',
                    background: isActive ? `${PageColors.disponibilites}22` : 'transparent',
                })}>
                    <div style={{ background: PageColors.disponibilites }} />
                    <h3>Disponibilités</h3>
                </NavLink>
                <NavLink to="/users" style={({ isActive }) => ({
                    color: isActive ? PageColors.users : '',
                    background: isActive ? `${PageColors.users}22` : 'transparent',
                })}>
                    <div style={{ background: PageColors.users }} />
                    <h3>Utilisateurs</h3>
                </NavLink>
                <NavLink to="/giftVouchers" style={({ isActive }) => ({
                    color: isActive ? PageColors.giftVouchers : '',
                    background: isActive ? `${PageColors.giftVouchers}22` : 'transparent',
                })}>
                    <div style={{ background: PageColors.giftVouchers }} />
                    <h3>Bons Cadeaux</h3>
                </NavLink>
                <NavLink to="/subscriptions" style={({isActive}) => ({
                    color: isActive ? PageColors.subscriptions : '',
                    background: isActive ? `${PageColors.subscriptions}22` : 'transparent',
                })}>
                    <div style={{ background: PageColors.subscriptions }} />
                    <h3>Abonnements</h3>
                </NavLink>
                <NavLink to="/events" style={({isActive}) => ({
                    color: isActive ? PageColors.events : '',
                    background: isActive ? `${PageColors.events}22` : 'transparent',
                })}>
                    <div style={{ background: PageColors.events }} />
                    <h3>Evénements</h3>
                </NavLink>
                <NavLink to="/discount-code" style={({isActive}) => ({
                    color: isActive ? PageColors.discountCodes : '',
                    background: isActive ? `${PageColors.discountCodes}22` : 'transparent',
                })}>
                    <div style={{ background: PageColors.discountCodes}} />
                    <h3>Codes de Réduction</h3>
                </NavLink>
            </section>
            <section className="layout__sidebar__tools">
                <NavLink to="/scan" style={({ isActive }) => ({
                    color: isActive ? PageColors.scanner : '',
                    background: isActive ? `${PageColors.scanner}22` : 'transparent',
                })}>
                    <div style={{ background: PageColors.scanner }} />
                    <h3>Scanner QR</h3>
                </NavLink>
                <button
                    className={`layout__sidebar__maintenance ${isMaintenance ? "layout__sidebar__maintenance--active" : ""}`}
                    onClick={() => setShowConfirm(true)}
                >
                    <div style={{ background: isMaintenance ? "#ef4444" : "#22c55e" }} />
                    <h3>{isMaintenance ? "Maintenance ON" : "Maintenance OFF"}</h3>
                </button>
            </section>

            {showConfirm && (
                <div className="layout__sidebar__overlay" onClick={() => setShowConfirm(false)}>
                    <div className="layout__sidebar__confirm" onClick={e => e.stopPropagation()}>
                        <h3>{isMaintenance ? 'Désactiver la maintenance ?' : 'Activer la maintenance ?'}</h3>
                        <p>{isMaintenance ? 'Le site sera à nouveau accessible aux clients.' : 'Le site sera inaccessible aux clients.'}</p>
                        <div className="layout__sidebar__confirm-actions">
                            <button onClick={() => setShowConfirm(false)}>Annuler</button>
                            <button
                                className="confirm"
                                onClick={() => { toggleMaintenance(); setShowConfirm(false) }}
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    )
}
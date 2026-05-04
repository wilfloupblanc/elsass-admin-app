import "./Sidebar.scss"
import { NavLink } from "react-router"
import { PageColors } from "../../PageColors"

export const Sidebar = ({ className }) => {
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
            </section>
            <section className="layout__sidebar__tools">
                <NavLink to="/scan" style={({ isActive }) => ({
                    color: isActive ? PageColors.scanner : '',
                    background: isActive ? `${PageColors.scanner}22` : 'transparent',
                })}>
                    <div style={{ background: PageColors.scanner }} />
                    <h3>Scanner QR</h3>
                </NavLink>
            </section>
        </aside>
    )
}
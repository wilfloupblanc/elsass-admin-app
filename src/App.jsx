import './App.scss'
import {Navigate, Route, Routes} from "react-router";
import {Dashboard} from "./pages/Dashboard";
import {Layout} from "./components/Layout"
import {Reservations} from "./pages/Reservations";
import {Availabilities} from "./pages/Availabilities";
import {Users} from "./pages/Users";
import {GiftVouchers} from "./pages/GiftVouchers";
import {Scan} from "./pages/Scan";
import {Subscriptions} from "./pages/Subscriptions";
import {useGetAuthUserQuery} from "./store/ApiSlice/adminApiSlice";
import {Login} from "./pages/Login";
import {Events} from "./pages/Events";
import {DiscountCodes} from "./pages/DiscountCodes";

function App() {
    const { data: authUser, isLoading } = useGetAuthUserQuery()

    if (isLoading) return null

    const isAuthenticated = !!authUser?.id && authUser.role === 'ROLE_ADMIN'

    return (
        <Routes>
            <Route path="/login" element={
                isAuthenticated ? <Navigate to="/" /> : <Login />
            } />
            <Route path="/*" element={
                isAuthenticated
                ? <Layout>
                    <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path="/reservations" element={<Reservations />} />
                        <Route path="/availabilities" element={<Availabilities />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/giftVouchers" element={<GiftVouchers />} />
                        <Route path="/subscriptions" element={<Subscriptions />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/discount-code" element={<DiscountCodes />} />
                        <Route path="/scan" element={<Scan />} />
                    </Routes>
                </Layout> : <Navigate to="/login" />
            }/>
        </Routes>
    )

}

export default App

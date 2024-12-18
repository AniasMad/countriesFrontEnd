import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'

// Outlet acts as a placeholder for child routes
// We've created a protected 'parent' route at '/' which returns this ProtectedRoute
// Within that is a nested 'child' route 'festivals/:id' which returns SingleFestival

// When the user goes to /festivals/:id, the request is caught in here first
// We check if there's a token. If there is, we return an <Outlet>, which passes the user into the child route (festivals/:id)
// If there is no token, we return a Navigate element, which sends the user back to the homepage and passes a state message
const ProtectedRoute = () => {
    const {token} = useAuth();

    if (!token) {
        return (
            <Navigate
                to={'/'}
                state={{ msg: 'Unauthorised user! Please login to access that page' }}
            />
        )
    }

    return (
        <Outlet />
    )

}

export default ProtectedRoute;
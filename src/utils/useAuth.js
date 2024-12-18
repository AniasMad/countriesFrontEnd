import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'

// create context, which will store some state
// we don't bother exporting this, as we will only use it in this file
const AuthContext = createContext();

// inside our components, we could directly call useContext(AuthContext) to get the current value of the context
// instead we just make this custom hook to make it easier to use
export const useAuth = () => {
    return useContext(AuthContext);
};

// chidren is a special prop
// it's like a placeholder for whatever JSX is going to be rendered inside this component
// meaning we can call <AuthProvider> {some jsx goes here} </AuthProvider>
export const AuthProvider = ({ children }) => {
    // on initial load, check if there is a token in local storage
    // we're creating a state variable and setting its initial value using a function
    // this would be just the same as initialising the state to null, then setting it in a useEffect
    const [token, setToken] = useState(() => {

        if (localStorage.getItem('token')) {
            return localStorage.getItem('token');
        }
        else {
            return null;
        }
    });

    const login = (email, password) => {
        // do login stuff...
        // set localStorage token
        // set token in state
        axios
            .post(`https://fed-medical-clinic-api.vercel.app/login`, {
                email,
                password,
            })
            .then((res) => {
                setToken(res.data.token);
                localStorage.setItem("token", res.data.token);
            })
            .catch((err) => {
                console.error(err);
                alert('Login failed')
            });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    const value = {
        token,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

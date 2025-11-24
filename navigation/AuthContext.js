import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({children}) => {
    const [authUser, setAuthUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);

    useEffect(() => {
        if (authUser) {
          setUserLoggedIn(true);
        } else {
          setUserLoggedIn(false);
        }
      }, [authUser]);

      return (
        <AuthContext.Provider value={{ authUser, setAuthUser, userLoggedIn }}>
          {children}
        </AuthContext.Provider>
      );

}
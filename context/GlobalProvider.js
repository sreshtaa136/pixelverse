import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../lib/appwrite";
import useAuth from "@/useAuth";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: userDetails, loading: userLoading } = useAuth();

  async function refreshUserData() {
    if (userLoading) return; // Don't update if Firebase is still loading
    setLoading(true);
    if (userDetails) {
      setIsLogged(true);
      setUser(userDetails);
      console.log("SESSION EXISTS. USER: ", userDetails);
    } else {
      setIsLogged(false);
      setUser(null);
      console.log("SESSION DOES NOT EXIST.");
    }
    setLoading(false);
    // getCurrentUser()
    //   .then((res) => {
    //     if (res) {
    //       setIsLogged(true);
    //       setUser(res);
    //     } else {
    //       setIsLogged(false);
    //       setUser(null);
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
  }

  useEffect(() => {
    refreshUserData();
  }, [userDetails, loading]);

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        loading,
        refreshUserData,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;

import React, { useState } from "react";
import axios from "axios";
import Login from "./Login";
import Register from "./Register";
import HomePageGuest from "./HomePageGuest";
import HomePageUser from "./HomePageUser"; // Make sure to import the HomePageUser component

function Welcome({ model, setModel }) {
  const [activeComponent, setActiveComponent] = useState("welcome");

  const handleLoginSuccess = (email) => {
    handleUserInfo(email);
    setActiveComponent("homeUser"); // Redirect to HomePageUser after successful login
  };

  const handleRegisterSuccess = () => {
    setActiveComponent("login"); // Redirect to Login component after successful registration
  };

  const handleLogout = () => {
    setActiveComponent("welcome"); // Redirect to the initial welcome screen
  };

  const handleRegisterClick = () => {
    setActiveComponent("register"); // Redirect to Register component
  };

  const handleUserInfo = async (email) => {
    //console.log(email);
    // Assuming 'email' is defined and holds the value of the user's email
    await axios
      .get("http://localhost:8000/user", { params: { email: email } })
      .then((response) => {
        const { user } = response.data;
        setModel((prevModel) => ({ ...prevModel, user })); // Correctly update only the user part of the state
      })
      .catch((error) => {
        console.error("There was an error fetching the data:", error);
      });
  };

  const updateModel = async () => {
    await axios
      .get("http://localhost:8000/")
      .then((response) => {
        const { questions, tags, answers } = response.data;
        setModel((prevModel) => ({
          ...prevModel, // This spreads the existing state, keeping all previous values intact
          questions: questions,
          tags: tags,
          answers: answers,
        }));
        if(model.user.email!= null)
        handleUserInfo(model.user.email);
      })
      .catch((error) => {
        console.error("There was an error fetching the data:", error);
      });
  };

  // useEffect(() => {
  //   updateModel();
  // }, []);

  const renderComponent = () => {
    switch (activeComponent) {
      case "login":
        return <Login onLoginSuccess={handleLoginSuccess} />;
      case "register":
        return <Register onRegisterSuccess={handleRegisterSuccess} />;
      case "guest":
        return (
          <HomePageGuest
            model={model}
            updateModel={updateModel}
            onRegisterClick={handleRegisterClick}
          />
        );
      case "homeUser":
        return (
          <HomePageUser
            model={model}
            updateModel={updateModel}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <div>
            <h1>Welcome to Fake Stack Overflow</h1>
            <button onClick={() => setActiveComponent("register")}>
              Register
            </button>
            <button onClick={() => setActiveComponent("login")}>Login</button>
            <button onClick={() => setActiveComponent("guest")}>
              Continue as Guest
            </button>
          </div>
        );
    }
  };

  return <div>{renderComponent()}</div>;
}
export default Welcome;

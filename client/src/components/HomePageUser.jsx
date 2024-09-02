import React, { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import Questions from "./Questions";
import Tags from "./Tags";
import "../stylesheets/App.css";
import UserProfile from "./UserProfile";
import AdminProfile from "./AdminProfile";

function HomePageUser({ model, updateModel, onLogout }) {
  // updateModel();
  const [activeComponent, setActiveComponent] = useState("questions");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [questionsKey, setQuestionsKey] = useState(0);
  const [searchKey, setSearchKey] = useState(0);
  const [tagsKey, setTagsKey] = useState(0);
  const [userProfileKey, setUserProfileKey] = useState(0);
  const userRole = model.user && model.user.role;

  const handleSearchInput = (event) => {
    //Entire thing was changed
    if (event.key === "Enter") {
      event.preventDefault();
      const query = event.target.value;
      console.log("Setting searchQue:", query);
      setSearchQuery(query);
      setActiveComponent("search");
      setSearchKey((prevKey) => prevKey + 1);
      setShowSearchBar(true);
    }
  };

  const handleQuestionsButtonClick = () => {
    setActiveComponent("questions");
    setQuestionsKey((prevKey) => prevKey + 1);
  };

  if (showSearchBar === null) {
    <p>do nothing</p>;
  }
  const handleTagsButtonClick = () => {
    setActiveComponent("tags");
    setTagsKey((prevKey) => prevKey + 1);
  };

  const handleUserProfile = () => {
    setActiveComponent("user_profile");
    setUserProfileKey((prevKey) => prevKey + 1);
    updateModel();
  };

  useEffect(() => {
    const handleFocus = () => {
      updateModel();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [updateModel]);

  const renderComponent = () => {
    switch (activeComponent) {
      case "questions":
        console.log(model);
        return (
          <Questions
            key={questionsKey}
            model={model}
            updateModel={updateModel}
            activeComponent={activeComponent}
          />
        );
      case "tags":
        return <Tags key={tagsKey} model={model} updateModel={updateModel} />;
      case "search": //Added this case
        console.log("in switch");
        console.log(model);
        console.log(searchQuery);
        return (
          <SearchBar key={searchKey} searchQue={searchQuery} model={model} />
        );
      case "user_profile":
          if (userRole === "admin") {
            return (
              <AdminProfile
                key={userProfileKey}
                model={model}
                updateModel={updateModel}
              />
            );
          } else {
            return (
              <UserProfile
                key={userProfileKey}
                model={model}
                updateModel={updateModel}
              />
            );
          }
      default:
        return (
          <Questions
            key={questionsKey}
            model={model}
            updateModel={updateModel}
            activeComponent={activeComponent}
          />
        );
    }
  };

  return (
    <section className="fakeso">
      <div id="mainHeader">
        <div id="h1_div">
          <h1 id="title">Fake Stack Overflow</h1>
          <button onClick={handleUserProfile}>User Profile</button>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>{" "}
          {/* Add logout button */}
        </div>
        <div id="input_div">
          <input
            type="text"
            className="search_bar"
            placeholder="Search..."
            onKeyDown={handleSearchInput}
          />
        </div>
      </div>
      <div id="contentContainer">
        <div id="sideBlock">
          <div id="questions" onClick={handleQuestionsButtonClick}>
            <button>Questions</button>
          </div>
          <div id="tags" onClick={handleTagsButtonClick}>
            <button>Tags</button>
          </div>
        </div>
        <div id="componentContainer">{renderComponent()}</div>
      </div>
      {/* Removed a line  */}
    </section>
  );
}

export default HomePageUser;

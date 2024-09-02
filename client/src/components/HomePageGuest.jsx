import React, { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import QuestionsGuest from "./QuestionsGuest";
import TagsGuest from "./TagsGuest";
import "../stylesheets/App.css";

function HomePageGuest({ model, updateModel, onRegisterClick }) {
  const [activeComponent, setActiveComponent] = useState("questions");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [questionsKey, setQuestionsKey] = useState(0);
  const [searchKey, setSearchKey] = useState(0);
  const [tagsKey, setTagsKey] = useState(0);

  const handleSearchInput = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const query = event.target.value;
      console.log('Setting searchQue:', query);
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

  const handleTagsButtonClick = () => {
    setActiveComponent("tags");
    setTagsKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    console.log(model.user);
    console.log(model);
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
        return (
          <QuestionsGuest
            key={questionsKey}
            model={model}
            updateModel={updateModel}
            activeComponent={activeComponent}
          />
        );
      case "tags":
        return <TagsGuest key={tagsKey} model={model} updateModel={updateModel} />;
      case "search":
        console.log("in switch");
        console.log(model);
        console.log(searchQuery);
        return (
          <SearchBar key={searchKey} searchQue={searchQuery} model={model} />
        );
      default:
        return null;
    }
  };

  return (
    <section className="fakeso">
      <div id="mainHeader">
        <div id="h1_div">
          <h1 id="title">Fake Stack Overflow</h1>
          <button onClick={onRegisterClick} className="signup-button">
            Signup/Register
          </button>{" "}
          {/* Add Signup/Register button */}
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
    </section>
  );
}

export default HomePageGuest;

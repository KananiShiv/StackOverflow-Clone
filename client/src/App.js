import React, { useState } from 'react';
import Welcome from "./components/Welcome";

function App() {
  const [model, setModel] = useState({ questions: [], tags: [], answers: [], user: [] });

  return (
    <div>
      <Welcome model={model} setModel={setModel} />
    </div>
  );
}

export default App;

import { useEffect, useState } from "react";
import api from "./lib/api";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/test")
      .then((res) => setMessage(res.data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">React + Laravel Test</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;

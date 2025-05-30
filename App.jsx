
import React, { useState } from "react";
import "./index.css";

const SurveyForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    favoriteColor: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.name) tempErrors.name = "Name is required";
    if (!formData.age || isNaN(formData.age)) tempErrors.age = "Valid age is required";
    if (!formData.favoriteColor) tempErrors.favoriteColor = "Favorite color is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const existingData = JSON.parse(localStorage.getItem("surveyResults")) || [];
      localStorage.setItem("surveyResults", JSON.stringify([...existingData, formData]));
      alert("Survey submitted!");
      setFormData({ name: "", age: "", favoriteColor: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">Survey Form</h2>
      <div className="mb-4">
        <label className="block mb-1">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>
      <div className="mb-4">
        <label className="block mb-1">Age</label>
        <input
          type="text"
          name="age"
          value={formData.age}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
        {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
      </div>
      <div className="mb-4">
        <label className="block mb-1">Favorite Color</label>
        <input
          type="text"
          name="favoriteColor"
          value={formData.favoriteColor}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
        {errors.favoriteColor && <p className="text-red-500 text-sm">{errors.favoriteColor}</p>}
      </div>
      <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
        Submit
      </button>
    </form>
  );
};

const SurveyResults = () => {
  const results = JSON.parse(localStorage.getItem("surveyResults")) || [];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Survey Results</h2>
      {results.length === 0 ? (
        <p>No survey responses yet.</p>
      ) : (
        <ul className="space-y-2">
          {results.map((entry, index) => (
            <li key={index} className="p-4 bg-white shadow rounded">
              <p><strong>Name:</strong> {entry.name}</p>
              <p><strong>Age:</strong> {entry.age}</p>
              <p><strong>Favorite Color:</strong> {entry.favoriteColor}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function SurveyApp() {
  const [currentView, setCurrentView] = useState("survey");

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Survey Application</h1>
          <div className="space-x-4">
            <button
              onClick={() => setCurrentView("survey")}
              className={\`py-1 px-4 rounded \${currentView === "survey" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}\`}
            >
              Survey Form
            </button>
            <button
              onClick={() => setCurrentView("results")}
              className={\`py-1 px-4 rounded \${currentView === "results" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}\`}
            >
              Survey Results
            </button>
          </div>
        </div>
      </nav>
      <main className="py-10 px-4">
        {currentView === "survey" ? <SurveyForm /> : <SurveyResults />}
      </main>
    </div>
  );
}

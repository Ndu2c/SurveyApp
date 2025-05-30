import React, { useState } from 'react';

const SurveyApp = () => {
  // In-memory database (array of survey responses)
  const [surveys, setSurveys] = useState([]);
  const [currentView, setCurrentView] = useState('survey');
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    contactNumber: '',
    favoriteFoods: {
      pizza: false,
      pasta: false,
      papAndWors: false,
      other: false
    },
    ratings: {
      watchMovies: '',
      listenToRadio: '',
      eatOut: '',
      watchTV: ''
    }
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        favoriteFoods: {
          ...prev.favoriteFoods,
          [name]: checked
        }
      }));
    } else if (name.startsWith('rating-')) {
      const ratingKey = name.replace('rating-', '');
      setFormData(prev => ({
        ...prev,
        ratings: {
          ...prev.ratings,
          [ratingKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Check required text fields
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';

    // Age validation
    if (formData.dateOfBirth) {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 5 || age > 120) {
        newErrors.dateOfBirth = 'Age must be between 5 and 120';
      }
    }

    // Rating validation - all ratings must be selected
    const ratingKeys = Object.keys(formData.ratings);
    ratingKeys.forEach(key => {
      if (!formData.ratings[key]) {
        newErrors[`rating-${key}`] = 'Please select a rating';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      const age = calculateAge(formData.dateOfBirth);
      const newSurvey = {
        id: Date.now(),
        ...formData,
        age: age,
        ratings: {
          watchMovies: parseInt(formData.ratings.watchMovies),
          listenToRadio: parseInt(formData.ratings.listenToRadio),
          eatOut: parseInt(formData.ratings.eatOut),
          watchTV: parseInt(formData.ratings.watchTV)
        },
        submittedAt: new Date().toISOString()
      };

      setSurveys(prev => [...prev, newSurvey]);
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        dateOfBirth: '',
        contactNumber: '',
        favoriteFoods: {
          pizza: false,
          pasta: false,
          papAndWors: false,
          other: false
        },
        ratings: {
          watchMovies: '',
          listenToRadio: '',
          eatOut: '',
          watchTV: ''
        }
      });
      setErrors({});
      
      alert('Survey submitted successfully!');
    }
  };

  // Calculate survey results
  const calculateResults = () => {
    if (surveys.length === 0) return null;

    const totalSurveys = surveys.length;
    const ages = surveys.map(s => s.age);
    const avgAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;
    const oldestAge = Math.max(...ages);
    const youngestAge = Math.min(...ages);
    
    // Food percentages
    const pizzaLovers = surveys.filter(s => s.favoriteFoods.pizza).length;
    const pastaLovers = surveys.filter(s => s.favoriteFoods.pasta).length;
    const papAndWorsLovers = surveys.filter(s => s.favoriteFoods.papAndWors).length;
    
    const pizzaPercentage = (pizzaLovers / totalSurveys) * 100;
    const pastaPercentage = (pastaLovers / totalSurveys) * 100;
    const papAndWorsPercentage = (papAndWorsLovers / totalSurveys) * 100;
    
    // Rating averages
    const watchMoviesAvg = surveys.reduce((sum, s) => sum + s.ratings.watchMovies, 0) / totalSurveys;
    const listenToRadioAvg = surveys.reduce((sum, s) => sum + s.ratings.listenToRadio, 0) / totalSurveys;
    const eatOutAvg = surveys.reduce((sum, s) => sum + s.ratings.eatOut, 0) / totalSurveys;
    const watchTVAvg = surveys.reduce((sum, s) => sum + s.ratings.watchTV, 0) / totalSurveys;

    return {
      totalSurveys,
      avgAge: avgAge.toFixed(1),
      oldestAge,
      youngestAge,
      pizzaPercentage: pizzaPercentage.toFixed(1),
      pastaPercentage: pastaPercentage.toFixed(1),
      papAndWorsPercentage: papAndWorsPercentage.toFixed(1),
      watchMoviesAvg: watchMoviesAvg.toFixed(1),
      listenToRadioAvg: listenToRadioAvg.toFixed(1),
      eatOutAvg: eatOutAvg.toFixed(1),
      watchTVAvg: watchTVAvg.toFixed(1)
    };
  };

  const results = calculateResults();

  // Survey Form Component
  const SurveyForm = () => (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <div className="space-y-6">
        {/* Personal Details Section */}
        <div className="border border-gray-300 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Personal Details:</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 w-32">
                Full Names
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-64 p-1 text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 ${
                  errors.fullName ? 'border-red-500' : ''
                }`}
              />
              {errors.fullName && <p className="text-red-500 text-sm ml-2">{errors.fullName}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 w-32">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-64 p-1 text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm ml-2">{errors.email}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 w-32">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className={`w-64 p-1 text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 ${
                  errors.dateOfBirth ? 'border-red-500' : ''
                }`}
              />
              {errors.dateOfBirth && <p className="text-red-500 text-sm ml-2">{errors.dateOfBirth}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 w-32">
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                className={`w-64 p-1 text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 ${
                  errors.contactNumber ? 'border-red-500' : ''
                }`}
              />
              {errors.contactNumber && <p className="text-red-500 text-sm ml-2">{errors.contactNumber}</p>}
            </div>
          </div>
        </div>

        {/* Favorite Food Section */}
        <div className="mt-6">
          <div className="flex items-start">
            <h3 className="text-sm font-medium text-gray-700 flex-shrink-0">What is your favorite food?</h3>
            <div className="ml-4 flex flex-wrap gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="pizza"
                  checked={formData.favoriteFoods.pizza}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-2 border-blue-500 rounded focus:ring-blue-500 focus:ring-2"
                  style={{
                    accentColor: '#3b82f6'
                  }}
                />
                <span className="text-sm text-gray-700">Pizza</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="pasta"
                  checked={formData.favoriteFoods.pasta}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-2 border-blue-500 rounded focus:ring-blue-500 focus:ring-2"
                  style={{
                    accentColor: '#3b82f6'
                  }}
                />
                <span className="text-sm text-gray-700">Pasta</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="papAndWors"
                  checked={formData.favoriteFoods.papAndWors}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-2 border-blue-500 rounded focus:ring-blue-500 focus:ring-2"
                  style={{
                    accentColor: '#3b82f6'
                  }}
                />
                <span className="text-sm text-gray-700">Pap and Wors</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="other"
                  checked={formData.favoriteFoods.other}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-2 border-blue-500 rounded focus:ring-blue-500 focus:ring-2"
                  style={{
                    accentColor: '#3b82f6'
                  }}
                />
                <span className="text-sm text-gray-700">Other</span>
              </label>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="mt-6">
          <p className="text-sm font-medium mb-4 text-gray-700">
            Please rate your level of agreement on a scale from 1 to 5, with 1 being "strongly agree" and 5 being "strongly disagree."
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-2 border-blue-500">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border-2 border-blue-500 p-2 text-left text-sm font-medium text-gray-700"></th>
                  <th className="border-2 border-blue-500 p-2 text-center text-sm font-medium text-gray-700">Strongly Agree</th>
                  <th className="border-2 border-blue-500 p-2 text-center text-sm font-medium text-gray-700">Agree</th>
                  <th className="border-2 border-blue-500 p-2 text-center text-sm font-medium text-gray-700">Neutral</th>
                  <th className="border-2 border-blue-500 p-2 text-center text-sm font-medium text-gray-700">Disagree</th>
                  <th className="border-2 border-blue-500 p-2 text-center text-sm font-medium text-gray-700">Strongly Disagree</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'watchMovies', label: 'I like to watch movies' },
                  { key: 'listenToRadio', label: 'I like to listen to radio' },
                  { key: 'eatOut', label: 'I like to eat out' },
                  { key: 'watchTV', label: 'I like to watch TV' }
                ].map((item) => (
                  <tr key={item.key} className="bg-white">
                    <td className="border-2 border-blue-500 p-2 text-sm text-gray-700">{item.label}</td>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <td key={rating} className="border-2 border-blue-500 p-2 text-center">
                        <input
                          type="radio"
                          name={`rating-${item.key}`}
                          value={rating}
                          checked={formData.ratings[item.key] === rating.toString()}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600"
                          style={{
                            accentColor: '#3b82f6'
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Display rating errors */}
          {Object.keys(errors).filter(key => key.startsWith('rating-')).map(key => (
            <p key={key} className="text-red-500 text-sm mt-1">{errors[key]}</p>
          ))}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white py-2 px-8 rounded hover:bg-blue-700 transition duration-200 font-medium"
          >
            SUBMIT
          </button>
        </div>
      </div>
    </div>
  );

  // Results Component
  const SurveyResults = () => (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Survey Results</h2>
      
      {!results ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No Surveys Available</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>Total number of surveys :</span>
              <span className="font-medium">{results.totalSurveys} surveys</span>
            </div>
            
            <div className="flex justify-between">
              <span>Average Age :</span>
              <span className="font-medium">{results.avgAge} average age</span>
            </div>
            
            <div className="flex justify-between">
              <span>Oldest person who participated in survey :</span>
              <span className="font-medium">{results.oldestAge} max age</span>
            </div>
            
            <div className="flex justify-between">
              <span>Youngest person who participated in survey :</span>
              <span className="font-medium">{results.youngestAge} min age</span>
            </div>
            
            <div className="flex justify-between">
              <span>Percentage of people who like Pizza :</span>
              <span className="font-medium">{results.pizzaPercentage} % Pizza</span>
            </div>
            
            <div className="flex justify-between">
              <span>Percentage of people who like Pasta :</span>
              <span className="font-medium">{results.pastaPercentage} % Pasta</span>
            </div>
            
            <div className="flex justify-between">
              <span>Percentage of people who like Pap and Wors :</span>
              <span className="font-medium">{results.papAndWorsPercentage} % Pap and Wors</span>
            </div>
            
            <div className="flex justify-between">
              <span>People like to watch movies :</span>
              <span className="font-medium">{results.watchMoviesAvg} average of rating</span>
            </div>
            
            <div className="flex justify-between">
              <span>People like to listen to radio :</span>
              <span className="font-medium">{results.listenToRadioAvg} average of rating</span>
            </div>
            
            <div className="flex justify-between">
              <span>People like to eat out :</span>
              <span className="font-medium">{results.eatOutAvg} average of rating</span>
            </div>
            
            <div className="flex justify-between">
              <span>People like to watch TV :</span>
              <span className="font-medium">{results.watchTVAvg} average of rating</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-medium text-gray-800">Surveys</h1>
            <div className="space-x-4">
              <button
                onClick={() => setCurrentView('survey')}
                className={`px-4 py-2 text-sm transition duration-200 ${
                  currentView === 'survey'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                FILL OUT SURVEY
              </button>
              <button
                onClick={() => setCurrentView('results')}
                className={`px-4 py-2 text-sm transition duration-200 ${
                  currentView === 'results'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                VIEW RESULTS
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        {currentView === 'survey' ? <SurveyForm /> : <SurveyResults />}
      </main>
    </div>
  );
};

export default SurveyApp;

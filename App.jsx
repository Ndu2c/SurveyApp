import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCGms0tN_SQTx8abtVJ494hV8mvXArVF8M",
    authDomain: "survey-app-b16d6.firebaseapp.com",
    projectId: "survey-app-b16d6",
    storageBucket: "survey-app-b16d6.appspot.com",
    messagingSenderId: "85316083468",
    appId: "1:85316083468:web:7a26996bfb7fc48c8b7329"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SurveyApp = () => {
    const [surveys, setSurveys] = useState([]);
    const [currentView, setCurrentView] = useState('survey');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState('fullName');

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

    // Fetch surveys from Firestore on component mount
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'surveys'), (snapshot) => {
            const surveysData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSurveys(surveysData);
        });

        return () => unsubscribe();
    }, []);

    // Handle input changes and set focus
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Set the focused field
        setFocusedField(name);
      
        setFormData(prev => {
            if (type === 'checkbox') {
                return {
                    ...prev,
                    favoriteFoods: {
                        ...prev.favoriteFoods,
                        [name]: checked
                    }
                };
            } 
            else if (name.startsWith('rating-')) {
                const ratingKey = name.replace('rating-', '');
                return {
                    ...prev,
                    ratings: {
                        ...prev.ratings,
                        [ratingKey]: value
                    }
                };
            } 
            else {
                return {
                    ...prev,
                    [name]: value
                };
            }
        });
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

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email.trim() && !emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

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
    const handleSubmit = async () => {
        if (validateForm()) {
            const age = calculateAge(formData.dateOfBirth);
            const newSurvey = {
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

            try {
                setLoading(true);
                
                // Add survey to Firestore
                await addDoc(collection(db, 'surveys'), newSurvey);

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
                setFocusedField('fullName');

                alert('Survey submitted successfully!');
            } catch (error) {
                console.error("Error adding survey: ", error);
                alert("Failed to submit survey");
            } finally {
                setLoading(false);
            }
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
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-6">
            {/* Personal Details */}
            <div className="border border-gray-300 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Personal Details:</h3>
                <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700 w-32">Full Names</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        autoFocus={focusedField === 'fullName'}
                        className={`w-64 p-1 text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 ${errors.fullName ? 'border-red-500' : ''}`}
                    />
                    {errors.fullName && <p className="text-red-500 text-sm ml-2">{errors.fullName}</p>}
                </div>
                <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700 w-32">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        autoFocus={focusedField === 'email'}
                        className={`w-64 p-1 text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && <p className="text-red-500 text-sm ml-2">{errors.email}</p>}
                </div>
                <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700 w-32">Date of Birth</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        autoFocus={focusedField === 'dateOfBirth'}
                        className={`w-64 p-1 text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                    />
                    {errors.dateOfBirth && <p className="text-red-500 text-sm ml-2">{errors.dateOfBirth}</p>}
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 w-32">Contact Number</label>
                    <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        autoFocus={focusedField === 'contactNumber'}
                        className={`w-64 p-1 text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 ${errors.contactNumber ? 'border-red-500' : ''}`}
                    />
                    {errors.contactNumber && <p className="text-red-500 text-sm ml-2">{errors.contactNumber}</p>}
                </div>
            </div>
    
            {/* Favorite Foods */}
            <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700">What is your favorite food?</h3>
                <div className="flex flex-wrap gap-6">
                    {['pizza', 'pasta', 'papAndWors', 'other'].map(food => (
                        <label key={food} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name={food}
                                checked={formData.favoriteFoods[food]}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 border-2 border-blue-500 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-700">
                                {food === 'papAndWors' ? 'Pap and Wors' : food.charAt(0).toUpperCase() + food.slice(1)}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
    
            {/* Ratings Table */}
            <div>
                <p className="text-sm font-medium mb-4 text-gray-700">
                    Please rate your level of agreement (1 = Strongly Agree, 5 = Strongly Disagree)
                </p>
                <div className="overflow-x-auto">
                    <table className="w-full border-2 border-blue-500">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border-2 border-blue-500 p-2 text-left text-sm font-medium text-gray-700"></th>
                                {[1, 2, 3, 4, 5].map(num => (
                                    <th key={num} className="border-2 border-blue-500 p-2 text-center text-sm font-medium text-gray-700">
                                        {num === 1 ? 'Strongly Agree' : num === 5 ? 'Strongly Disagree' : num === 3 ? 'Neutral' : num === 2 ? 'Agree' : 'Disagree'}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { key: 'watchMovies', label: 'I like to watch movies' },
                                { key: 'listenToRadio', label: 'I like to listen to radio' },
                                { key: 'eatOut', label: 'I like to eat out' },
                                { key: 'watchTV', label: 'I like to watch TV' }
                            ].map(item => (
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
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {Object.keys(errors).filter(key => key.startsWith('rating-')).map(key => (
                    <p key={key} className="text-red-500 text-sm mt-1">{errors[key]}</p>
                ))}
            </div>
    
            <div className="text-center">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`bg-blue-600 text-white py-2 px-8 rounded hover:bg-blue-700 transition duration-200 font-medium ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? 'SUBMITTING...' : 'SUBMIT'}
                </button>
            </div>
        </div>
    );

    // Results Component
    const SurveyResults = () => (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Survey Results</h2>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Loading survey data...</p>
                </div>
            ) : !results ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No Surveys Available</p>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">Survey Statistics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total surveys completed:</span>
                                <span className="font-medium">{results.totalSurveys}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Average age:</span>
                                <span className="font-medium">{results.avgAge}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Oldest participant:</span>
                                <span className="font-medium">{results.oldestAge}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Youngest participant:</span>
                                <span className="font-medium">{results.youngestAge}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">Favorite Foods</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Pizza:</span>
                                <span className="font-medium">{results.pizzaPercentage}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Pasta:</span>
                                <span className="font-medium">{results.pastaPercentage}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Pap and Wors:</span>
                                <span className="font-medium">{results.papAndWorsPercentage}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">Average Ratings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">I like to watch movies:</span>
                                <span className="font-medium">{results.watchMoviesAvg}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">I like to listen to radio:</span>
                                <span className="font-medium">{results.listenToRadioAvg}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">I like to eat out:</span>
                                <span className="font-medium">{results.eatOutAvg}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">I like to watch TV:</span>
                                <span className="font-medium">{results.watchTVAvg}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between">
                    <h1 className="text-lg font-medium">Surveys</h1>
                    <div className="space-x-4">
                        <button
                            onClick={() => setCurrentView('survey')}
                            className={`px-4 py-2 text-sm ${
                                currentView === 'survey' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
                            }`}
                        >
                            FILL OUT SURVEY
                        </button>
                        <button
                            onClick={() => setCurrentView('results')}
                            className={`px-4 py-2 text-sm ${
                                currentView === 'results' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
                            }`}
                        >
                            VIEW RESULTS
                        </button>
                    </div>
                </div>
            </nav>

            <main className="py-8 px-4">
                {loading && currentView === 'survey' ? (
                    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
                        <p className="text-gray-500">Submitting survey...</p>
                    </div>
                ) : currentView === 'survey' ? (
                    <SurveyForm />
                ) : (
                    <SurveyResults />
                )}
            </main>
        </div>
    );
};

export default SurveyApp;
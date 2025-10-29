"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function DietPredictionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    gender: "male",
    weight: "",
    height: "",
    activityLevel: "moderate",
    goal: "maintain weight",
    dietaryRestrictions: "none",
    medicalConditions: "none"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowResults(false);

    try {
      // Get AI prediction first
      const predictionResponse = await fetch('/api/diet/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const predictionData = await predictionResponse.json();

      if (predictionData.success) {
        setPrediction(predictionData.prediction);
        setShowResults(true);

        // Save diet data with prediction
        const saveResponse = await fetch('/api/diet/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            prediction: predictionData.prediction
          })
        });

        if (saveResponse.ok) {
          // Save user to localStorage
          localStorage.setItem('user', JSON.stringify({
            name: formData.name,
            email: formData.email
          }));
        }
      } else {
        alert('Failed to generate prediction. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  if (showResults && prediction) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="results-container">
            <div className="results-header">
              <h1 className="results-title">🎉 Your Personalized AI Diet Plan</h1>
              <p className="results-subtitle">Based on your profile analysis</p>
            </div>

            {/* Health Metrics */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">📊</div>
                <div className="metric-label">BMI</div>
                <div className="metric-value">{prediction.bmi}</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">🔥</div>
                <div className="metric-label">Daily Calories</div>
                <div className="metric-value">{prediction.calories}</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">⚡</div>
                <div className="metric-label">BMR</div>
                <div className="metric-value">{prediction.bmr}</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">💯</div>
                <div className="metric-label">Health Score</div>
                <div className="metric-value">{prediction.healthScore}</div>
              </div>
            </div>

            {/* Macros */}
            <div className="section-card">
              <h2>🍽️ Daily Macronutrient Targets</h2>
              <div className="macros-grid">
                <div className="macro-item protein">
                  <div className="macro-icon">💪</div>
                  <div className="macro-name">Protein</div>
                  <div className="macro-amount">{prediction.macros.protein}g</div>
                </div>
                <div className="macro-item carbs">
                  <div className="macro-icon">🍞</div>
                  <div className="macro-name">Carbs</div>
                  <div className="macro-amount">{prediction.macros.carbs}g</div>
                </div>
                <div className="macro-item fats">
                  <div className="macro-icon">🥑</div>
                  <div className="macro-name">Fats</div>
                  <div className="macro-amount">{prediction.macros.fats}g</div>
                </div>
                <div className="macro-item fiber">
                  <div className="macro-icon">🌾</div>
                  <div className="macro-name">Fiber</div>
                  <div className="macro-amount">{prediction.macros.fiber}g</div>
                </div>
              </div>
              <div className="hydration">
                <span className="hydration-icon">💧</span>
                <span>Drink <strong>{prediction.hydration} liters</strong> of water daily</span>
              </div>
            </div>

            {/* Insights */}
            <div className="section-card">
              <h2>💡 AI Insights & Recommendations</h2>
              <ul className="insights-list">
                {prediction.insights.map((insight, index) => (
                  <li key={index} className="insight-item">{insight}</li>
                ))}
              </ul>
            </div>

            {/* Focus & Avoid */}
            <div className="guidelines-grid">
              <div className="section-card focus-card">
                <h2>✅ Focus On</h2>
                <ul className="guidelines-list">
                  {prediction.focusAreas.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="section-card avoid-card">
                <h2>❌ Avoid</h2>
                <ul className="guidelines-list">
                  {prediction.avoidAreas.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sample Meal Plan */}
            <div className="section-card">
              <h2>📅 Sample Daily Meal Plan</h2>
              <div className="meal-plan">
                {prediction.mealPlan.map((meal, index) => (
                  <div key={index} className="meal-item">
                    <span className="meal-number">{index + 1}</span>
                    <span className="meal-text">{meal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Additional Insights */}
            {prediction.aiInsights && (
              <div className="section-card ai-insights">
                <h2>🤖 Additional AI Insights</h2>
                <p className="ai-text">{prediction.aiInsights}</p>
              </div>
            )}

            <button onClick={goToDashboard} className="dashboard-button">
              📊 Go to Dashboard
            </button>
          </div>
        </div>

        <style jsx>{`
          .results-container {
            max-width: 1000px;
            margin: 0 auto;
          }

          .results-header {
            text-align: center;
            margin-bottom: 3rem;
          }

          .results-title {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
          }

          .results-subtitle {
            font-size: 1.125rem;
            color: #666;
          }

          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .metric-card {
            background: white;
            padding: 2rem;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          }

          .metric-icon {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
          }

          .metric-label {
            color: #666;
            font-size: 0.95rem;
            margin-bottom: 0.5rem;
          }

          .metric-value {
            font-size: 2rem;
            font-weight: 700;
            color: #667eea;
          }

          .section-card {
            background: white;
            padding: 2rem;
            border-radius: 16px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          }

          .section-card h2 {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            color: #333;
          }

          .macros-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .macro-item {
            padding: 1.5rem;
            border-radius: 12px;
            text-align: center;
          }

          .macro-item.protein { background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); }
          .macro-item.carbs { background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); }
          .macro-item.fats { background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%); }
          .macro-item.fiber { background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); }

          .macro-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }

          .macro-name {
            font-weight: 600;
            color: #555;
            margin-bottom: 0.5rem;
          }

          .macro-amount {
            font-size: 1.5rem;
            font-weight: 700;
            color: #333;
          }

          .hydration {
            padding: 1rem;
            background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);
            border-radius: 12px;
            text-align: center;
            font-size: 1.125rem;
          }

          .hydration-icon {
            font-size: 1.5rem;
            margin-right: 0.5rem;
          }

          .insights-list {
            list-style: none;
            padding: 0;
          }

          .insight-item {
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 0.75rem;
            border-left: 4px solid #667eea;
            line-height: 1.6;
          }

          .guidelines-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .focus-card { border-top: 4px solid #4caf50; }
          .avoid-card { border-top: 4px solid #f44336; }

          .guidelines-list {
            list-style: none;
            padding: 0;
          }

          .guidelines-list li {
            padding: 0.75rem 1rem;
            background: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 0.5rem;
          }

          .focus-card .guidelines-list li::before {
            content: "✓ ";
            color: #4caf50;
            font-weight: bold;
            margin-right: 0.5rem;
          }

          .avoid-card .guidelines-list li::before {
            content: "✗ ";
            color: #f44336;
            font-weight: bold;
            margin-right: 0.5rem;
          }

          .meal-plan {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .meal-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 12px;
          }

          .meal-number {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            flex-shrink: 0;
          }

          .meal-text {
            flex: 1;
            line-height: 1.6;
          }

          .ai-insights {
            background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%);
          }

          .ai-text {
            line-height: 1.8;
            color: #555;
            white-space: pre-wrap;
          }

          .dashboard-button {
            width: 100%;
            padding: 1.25rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1.125rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .dashboard-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
          }

          @media (max-width: 768px) {
            .results-title {
              font-size: 2rem;
            }

            .metrics-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .guidelines-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">🎯 AI Diet Prediction</h1>
          <p className="page-subtitle">
            Let our AI analyze your profile and create a personalized nutrition plan
          </p>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="diet-form">
            {/* Personal Information */}
            <div className="form-section">
              <h2 className="section-heading">👤 Personal Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>

                <div className="form-group">
                  <label>Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="10"
                    max="120"
                    placeholder="25"
                  />
                </div>

                <div className="form-group">
                  <label>Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Body Metrics */}
            <div className="form-section">
              <h2 className="section-heading">📏 Body Metrics</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Weight (kg) *</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                    min="20"
                    max="300"
                    step="0.1"
                    placeholder="70"
                  />
                </div>

                <div className="form-group">
                  <label>Height (cm) *</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    required
                    min="100"
                    max="250"
                    placeholder="170"
                  />
                </div>
              </div>
            </div>

            {/* Lifestyle & Goals */}
            <div className="form-section">
              <h2 className="section-heading">🎯 Lifestyle & Goals</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Activity Level *</label>
                  <select name="activityLevel" value={formData.activityLevel} onChange={handleChange}>
                    <option value="sedentary">Sedentary (Little/no exercise)</option>
                    <option value="light">Light (Exercise 1-3 days/week)</option>
                    <option value="moderate">Moderate (Exercise 3-5 days/week)</option>
                    <option value="active">Active (Exercise 6-7 days/week)</option>
                    <option value="very active">Very Active (Intense exercise daily)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Health Goal *</label>
                  <select name="goal" value={formData.goal} onChange={handleChange}>
                    <option value="lose weight">Lose Weight</option>
                    <option value="maintain weight">Maintain Weight</option>
                    <option value="gain weight">Gain Weight</option>
                    <option value="build muscle">Build Muscle</option>
                    <option value="improve health">Improve Overall Health</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Health Information */}
            <div className="form-section">
              <h2 className="section-heading">⚕️ Health Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Dietary Restrictions</label>
                  <select name="dietaryRestrictions" value={formData.dietaryRestrictions} onChange={handleChange}>
                    <option value="none">None</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten-free">Gluten-Free</option>
                    <option value="lactose-intolerant">Lactose Intolerant</option>
                    <option value="halal">Halal</option>
                    <option value="kosher">Kosher</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Medical Conditions</label>
                  <select name="medicalConditions" value={formData.medicalConditions} onChange={handleChange}>
                    <option value="none">None</option>
                    <option value="diabetes">Diabetes</option>
                    <option value="hypertension">Hypertension</option>
                    <option value="heart disease">Heart Disease</option>
                    <option value="obesity">Obesity</option>
                    <option value="thyroid">Thyroid Issues</option>
                    <option value="pcos">PCOS</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing with AI...
                </>
              ) : (
                "🚀 Generate AI Diet Plan"
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .form-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .diet-form {
          background: white;
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .form-section {
          margin-bottom: 2.5rem;
        }

        .section-heading {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 600;
          color: #555;
          font-size: 0.95rem;
        }

        .form-group input,
        .form-group select {
          padding: 0.875rem;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .submit-button {
          width: 100%;
          padding: 1.25rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .diet-form {
            padding: 2rem 1.5rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
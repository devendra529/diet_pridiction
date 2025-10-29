"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import * as tf from "@tensorflow/tfjs";
import { Chart, registerables } from "chart.js";
import "../../styles/dashboard.css";
import Header from "@/components/Header";

// Register Chart.js components
if (typeof window !== 'undefined') {
  Chart.register(...registerables);
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dietData, setDietData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dietPlan, setDietPlan] = useState(null);
  const [nutritionPrediction, setNutritionPrediction] = useState(null);
  const [healthScore, setHealthScore] = useState(0);
  const [foodSearch, setFoodSearch] = useState("");
  const [nutritionData, setNutritionData] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Chart refs
  const macroChartRef = useRef(null);
  const progressChartRef = useRef(null);
  const calorieChartRef = useRef(null);
  const macroChartInstance = useRef(null);
  const progressChartInstance = useRef(null);
  const calorieChartInstance = useRef(null);

  // Utility functions wrapped in useCallback
  const calculateBMI = useCallback((weight, height) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  }, []);

  const calculateBMR = useCallback((weight, height, age, gender) => {
    return gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  }, []);

  const calculateTDEE = useCallback((bmr, activityLevel) => {
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      "very active": 1.9,
    };
    return Math.round(bmr * (multipliers[activityLevel?.toLowerCase()] || 1.2));
  }, []);

  const calculateHealthScore = useCallback((data) => {
    if (!data) return;
    const bmi = calculateBMI(data.weight, data.height);
    let score = 100;

    if (bmi < 18.5 || bmi > 30) score -= 20;
    else if (bmi < 20 || bmi > 27) score -= 10;

    if (data.activityLevel === "sedentary") score -= 15;
    if (data.medicalConditions && data.medicalConditions !== "none") score -= 15;

    setHealthScore(Math.max(0, score));
  }, [calculateBMI]);

  const predictNutrition = useCallback(async (data) => {
    if (!data) return;

    try {
      const model = tf.sequential({
        layers: [
          tf.layers.dense({ units: 64, activation: "relu", inputShape: [5] }),
          tf.layers.dense({ units: 32, activation: "relu" }),
          tf.layers.dense({ units: 3, activation: "linear" }),
        ],
      });

      const normalizedInput = tf.tensor2d([
        [
          data.weight / 100,
          data.height / 200,
          data.age / 100,
          data.gender === "male" ? 1 : 0,
          ["sedentary", "light", "moderate", "active", "very active"].indexOf(
            data.activityLevel?.toLowerCase()
          ) / 4,
        ],
      ]);

      const prediction = model.predict(normalizedInput);
      await prediction.array();

      const bmr = calculateBMR(data.weight, data.height, data.age, data.gender);
      const tdee = calculateTDEE(bmr, data.activityLevel);

      let calorieTarget = tdee;
      if (data.goal?.toLowerCase().includes("lose")) calorieTarget -= 500;
      else if (data.goal?.toLowerCase().includes("gain")) calorieTarget += 500;

      setNutritionPrediction({
        calories: Math.round(calorieTarget),
        protein: Math.round(data.weight * 2.2),
        carbs: Math.round((calorieTarget * 0.4) / 4),
        fats: Math.round((calorieTarget * 0.3) / 9),
        fiber: 30,
        water: Math.round(data.weight * 0.033),
      });

      normalizedInput.dispose();
      prediction.dispose();
    } catch (err) {
      console.error("Prediction error:", err);
    }
  }, [calculateBMR, calculateTDEE]);

  const generateDietPlan = useCallback(async (data) => {
    if (!data) return;

    const diseaseSpecificDiets = {
      diabetes: {
        focus: ["Low GI foods", "Fiber-rich meals", "Controlled portions"],
        avoid: ["Refined sugar", "White bread", "Sugary drinks"],
        meals: {
          breakfast: ["Oatmeal with berries", "Greek yogurt with nuts", "Veggie omelet"],
          lunch: ["Grilled chicken salad", "Quinoa bowl", "Lentil soup"],
          dinner: ["Baked fish with broccoli", "Tofu stir-fry", "Turkey with sweet potato"],
          snacks: ["Almonds", "Apple slices", "Carrot sticks"],
        },
      },
      hypertension: {
        focus: ["Low sodium", "Potassium-rich foods", "DASH diet"],
        avoid: ["Processed foods", "Salty snacks", "Canned soups"],
        meals: {
          breakfast: ["Banana smoothie", "Whole grain toast with avocado", "Low-fat yogurt"],
          lunch: ["Spinach salad", "Brown rice with beans", "Grilled vegetables"],
          dinner: ["Salmon with asparagus", "Chicken breast with quinoa", "Vegetable curry"],
          snacks: ["Fresh fruits", "Unsalted nuts", "Greek yogurt"],
        },
      },
      obesity: {
        focus: ["Calorie deficit", "High protein", "Fiber-rich foods"],
        avoid: ["Fast food", "Sugary beverages", "Fried foods"],
        meals: {
          breakfast: ["Protein smoothie", "Egg whites with vegetables", "Greek yogurt parfait"],
          lunch: ["Large salad with grilled chicken", "Vegetable soup", "Quinoa bowl"],
          dinner: ["Grilled fish with steamed vegetables", "Lean meat with salad", "Tofu stir-fry"],
          snacks: ["Vegetables with hummus", "Fruits", "Air-popped popcorn"],
        },
      },
      default: {
        focus: ["Balanced nutrition", "Whole foods", "Regular meals"],
        avoid: ["Processed foods", "Excess sugar", "Unhealthy fats"],
        meals: {
          breakfast: ["Oats with fruits", "Whole grain toast with eggs", "Smoothie bowl"],
          lunch: ["Balanced plate", "Whole grain pasta", "Buddha bowl"],
          dinner: ["Grilled protein with vegetables", "Stir-fry with rice", "Balanced curry"],
          snacks: ["Fruits", "Nuts", "Yogurt"],
        },
      },
    };

    const condition = data.medicalConditions?.toLowerCase() || "default";
    let selectedPlan = diseaseSpecificDiets.default;

    for (const [disease, plan] of Object.entries(diseaseSpecificDiets)) {
      if (condition.includes(disease)) {
        selectedPlan = plan;
        break;
      }
    }

    setDietPlan({
      condition: condition === "default" ? "General Health" : condition,
      ...selectedPlan,
    });
  }, []);

  // Fetch user diet data
  const fetchDietData = useCallback(async (email) => {
    try {
      const response = await fetch(`/api/diet/get?email=${email}`);
      const data = await response.json();
      setDietData(data.dietData);

      await generateDietPlan(data.dietData);
      await predictNutrition(data.dietData);
      calculateHealthScore(data.dietData);
    } catch (err) {
      console.error("Failed to fetch diet data:", err);
    } finally {
      setLoading(false);
    }
  }, [generateDietPlan, predictNutrition, calculateHealthScore]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/auth/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchDietData(parsedUser.email);
  }, [router, fetchDietData]);

  // Fetch nutrition data from API
  const searchFood = async (e) => {
    e.preventDefault();
    if (!foodSearch.trim()) return;

    setSearchLoading(true);
    try {
      const response = await fetch(`/api/nutrition?food=${encodeURIComponent(foodSearch)}`);
      const data = await response.json();
      
      if (data.success && data.foods.length > 0) {
        setNutritionData(data.foods[0]);
      } else {
        alert("Food not found. Try a different search term.");
        setNutritionData(null);
      }
    } catch (error) {
      console.error("Failed to fetch nutrition data:", error);
      alert("Failed to fetch nutrition data");
    } finally {
      setSearchLoading(false);
    }
  };

  // Create Charts
  useEffect(() => {
    if (!nutritionPrediction || !dietData) return;

    // Macro Distribution Chart
    if (macroChartRef.current) {
      if (macroChartInstance.current) {
        macroChartInstance.current.destroy();
      }

      const ctx = macroChartRef.current.getContext("2d");
      macroChartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Protein", "Carbs", "Fats"],
          datasets: [{
            data: [
              nutritionPrediction.protein,
              nutritionPrediction.carbs,
              nutritionPrediction.fats,
            ],
            backgroundColor: [
              "rgba(255, 99, 132, 0.8)",
              "rgba(54, 162, 235, 0.8)",
              "rgba(255, 206, 86, 0.8)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
            ],
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 15,
                font: { size: 13, weight: "600" },
                color: "#333",
              },
            },
            title: {
              display: true,
              text: "Daily Macronutrient Distribution (g)",
              font: { size: 16, weight: "bold" },
              color: "#333",
              padding: 15,
            },
          },
        },
      });
    }

    // Progress Chart
    if (progressChartRef.current) {
      if (progressChartInstance.current) {
        progressChartInstance.current.destroy();
      }

      const ctx = progressChartRef.current.getContext("2d");
      const currentWeight = dietData.weight;
      const targetWeight = dietData.goal?.toLowerCase().includes("lose") 
        ? currentWeight - 5 
        : dietData.goal?.toLowerCase().includes("gain")
        ? currentWeight + 5
        : currentWeight;

      progressChartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
          datasets: [
            {
              label: "Current Weight (kg)",
              data: [
                currentWeight,
                currentWeight - 0.5,
                currentWeight - 1,
                currentWeight - 1.5,
                currentWeight - 2,
                currentWeight - 2.5,
              ],
              borderColor: "rgba(102, 126, 234, 1)",
              backgroundColor: "rgba(102, 126, 234, 0.1)",
              tension: 0.4,
              fill: true,
              pointRadius: 5,
              pointHoverRadius: 7,
            },
            {
              label: "Target Weight (kg)",
              data: Array(6).fill(targetWeight),
              borderColor: "rgba(76, 175, 80, 1)",
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              borderDash: [10, 5],
              tension: 0,
              fill: false,
              pointRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 15,
                font: { size: 13, weight: "600" },
                color: "#333",
              },
            },
            title: {
              display: true,
              text: "Weight Progress Tracking",
              font: { size: 16, weight: "bold" },
              color: "#333",
              padding: 15,
            },
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: { color: "rgba(0, 0, 0, 0.05)" },
              ticks: { font: { size: 11 }, color: "#666" },
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 11 }, color: "#666" },
            },
          },
        },
      });
    }

    // Calorie Breakdown Chart
    if (calorieChartRef.current) {
      if (calorieChartInstance.current) {
        calorieChartInstance.current.destroy();
      }

      const ctx = calorieChartRef.current.getContext("2d");
      calorieChartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Protein", "Carbs", "Fats"],
          datasets: [{
            label: "Calories per Macronutrient",
            data: [
              nutritionPrediction.protein * 4,
              nutritionPrediction.carbs * 4,
              nutritionPrediction.fats * 9,
            ],
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
            ],
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: "Calorie Distribution by Macros",
              font: { size: 16, weight: "bold" },
              color: "#333",
              padding: 15,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "rgba(0, 0, 0, 0.05)" },
              ticks: { font: { size: 11 }, color: "#666" },
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 11 }, color: "#666" },
            },
          },
        },
      });
    }

    return () => {
      if (macroChartInstance.current) macroChartInstance.current.destroy();
      if (progressChartInstance.current) progressChartInstance.current.destroy();
      if (calorieChartInstance.current) calorieChartInstance.current.destroy();
    };
  }, [nutritionPrediction, dietData]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Analyzing your health data...</p>
      </div>
    );
  }

  const bmi = dietData ? calculateBMI(dietData.weight, dietData.height) : 0;
  const bmiCategory = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";

  return (
    <><div className="dashboard-container">
      <Header />
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Welcome, {user?.name || "User"}! 👋</h1>
          <p className="subtitle">Your personalized health & nutrition dashboard</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          <span>🚪</span> Logout
        </button>
      </header>

      <div className="dashboard-grid">
        {/* Health Score Card */}
        <div className="card health-score-card">
          <h2>🎯 Health Score</h2>
          <div className="score-display">
            <div className="score-circle">
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="85" fill="none" stroke="#e0e0e0" strokeWidth="12" />
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke={healthScore > 70 ? "#4CAF50" : healthScore > 50 ? "#FF9800" : "#F44336"}
                  strokeWidth="12"
                  strokeDasharray={`${(healthScore / 100) * 534} 534`}
                  transform="rotate(-90 100 100)"
                  strokeLinecap="round" />
              </svg>
              <div className="score-text">{healthScore}</div>
            </div>
            <div className="score-info">
              <div className="metric-item">
                <span className="metric-label">BMI</span>
                <span className="metric-value">{bmi}</span>
                <span className="metric-category">{bmiCategory}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="card profile-card">
          <h2>👤 Your Profile</h2>
          <div className="profile-grid">
            <div className="profile-item">
              <span className="icon">📧</span>
              <div>
                <span className="label">Email</span>
                <span className="value">{user?.email}</span>
              </div>
            </div>
            <div className="profile-item">
              <span className="icon">🎂</span>
              <div>
                <span className="label">Age</span>
                <span className="value">{dietData?.age} years</span>
              </div>
            </div>
            <div className="profile-item">
              <span className="icon">⚖️</span>
              <div>
                <span className="label">Weight</span>
                <span className="value">{dietData?.weight} kg</span>
              </div>
            </div>
            <div className="profile-item">
              <span className="icon">📏</span>
              <div>
                <span className="label">Height</span>
                <span className="value">{dietData?.height} cm</span>
              </div>
            </div>
            <div className="profile-item">
              <span className="icon">👤</span>
              <div>
                <span className="label">Gender</span>
                <span className="value">{dietData?.gender}</span>
              </div>
            </div>
            <div className="profile-item">
              <span className="icon">🏃</span>
              <div>
                <span className="label">Activity</span>
                <span className="value">{dietData?.activityLevel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Targets */}
        {nutritionPrediction && (
          <div className="card nutrition-card full-width">
            <h2>🍽️ Daily Nutrition Targets</h2>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <span className="nutrition-icon">🔥</span>
                <div className="nutrition-details">
                  <span className="nutrition-label">Calories</span>
                  <span className="nutrition-value">{nutritionPrediction.calories}</span>
                  <span className="nutrition-unit">kcal</span>
                </div>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-icon">💪</span>
                <div className="nutrition-details">
                  <span className="nutrition-label">Protein</span>
                  <span className="nutrition-value">{nutritionPrediction.protein}</span>
                  <span className="nutrition-unit">grams</span>
                </div>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-icon">🍞</span>
                <div className="nutrition-details">
                  <span className="nutrition-label">Carbs</span>
                  <span className="nutrition-value">{nutritionPrediction.carbs}</span>
                  <span className="nutrition-unit">grams</span>
                </div>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-icon">🥑</span>
                <div className="nutrition-details">
                  <span className="nutrition-label">Fats</span>
                  <span className="nutrition-value">{nutritionPrediction.fats}</span>
                  <span className="nutrition-unit">grams</span>
                </div>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-icon">🌾</span>
                <div className="nutrition-details">
                  <span className="nutrition-label">Fiber</span>
                  <span className="nutrition-value">{nutritionPrediction.fiber}</span>
                  <span className="nutrition-unit">grams</span>
                </div>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-icon">💧</span>
                <div className="nutrition-details">
                  <span className="nutrition-label">Water</span>
                  <span className="nutrition-value">{nutritionPrediction.water}</span>
                  <span className="nutrition-unit">liters</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {nutritionPrediction && (
          <>
            <div className="card chart-card">
              <canvas ref={macroChartRef}></canvas>
            </div>

            <div className="card chart-card">
              <canvas ref={calorieChartRef}></canvas>
            </div>

            <div className="card chart-card full-width">
              <canvas ref={progressChartRef}></canvas>
            </div>
          </>
        )}

        {/* Food Search */}
        <div className="card food-search-card full-width">
          <h2>🔍 Search Food Nutrition</h2>
          <form onSubmit={searchFood} className="search-form">
            <input
              type="text"
              value={foodSearch}
              onChange={(e) => setFoodSearch(e.target.value)}
              placeholder="Search for any food (e.g., apple, chicken breast)"
              className="search-input" />
            <button type="submit" className="search-button" disabled={searchLoading}>
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </form>

          {nutritionData && (
            <div className="nutrition-result">
              <h3>{nutritionData.name}</h3>
              <p className="brand-name">{nutritionData.brandName}</p>
              <div className="nutrition-facts">
                <div className="fact-item">
                  <span className="fact-label">Calories:</span>
                  <span className="fact-value">{nutritionData.nutrients.calories || "N/A"} kcal</span>
                </div>
                <div className="fact-item">
                  <span className="fact-label">Protein:</span>
                  <span className="fact-value">{nutritionData.nutrients.protein || "N/A"} g</span>
                </div>
                <div className="fact-item">
                  <span className="fact-label">Carbs:</span>
                  <span className="fact-value">{nutritionData.nutrients.carbs || "N/A"} g</span>
                </div>
                <div className="fact-item">
                  <span className="fact-label">Fat:</span>
                  <span className="fact-value">{nutritionData.nutrients.fat || "N/A"} g</span>
                </div>
                <div className="fact-item">
                  <span className="fact-label">Fiber:</span>
                  <span className="fact-value">{nutritionData.nutrients.fiber || "N/A"} g</span>
                </div>
              </div>
              <p className="serving-info">
                Per {nutritionData.servingSize} {nutritionData.servingUnit}
              </p>
            </div>
          )}
        </div>

        {/* Diet Plan */}
        {dietPlan && (
          <div className="card diet-plan-card full-width">
            <h2>🥗 Your Personalized Diet Plan</h2>
            <div className="plan-header">
              <span className="plan-badge">Optimized for: {dietPlan.condition}</span>
            </div>

            <div className="plan-sections">
              <div className="plan-section focus-section">
                <h3>✅ Focus On</h3>
                <ul>
                  {dietPlan.focus.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="plan-section avoid-section">
                <h3>❌ Avoid</h3>
                <ul>
                  {dietPlan.avoid.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="meals-container">
              <h3>📅 Sample Meal Plan</h3>
              <div className="meals-grid">
                {Object.entries(dietPlan.meals).map(([mealType, items]) => (
                  <div key={mealType} className="meal-card">
                    <h4>
                      {mealType === "breakfast" && "🌅"}
                      {mealType === "lunch" && "☀️"}
                      {mealType === "dinner" && "🌙"}
                      {mealType === "snacks" && "🍎"}
                      {" "}
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </h4>
                    <ul>
                      {items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Health Goals */}
        <div className="card goals-card full-width">
          <h2>🎯 Health Goals & Insights</h2>
          <div className="goals-content">
            <div className="goal-item primary">
              <span className="goal-icon">🎯</span>
              <div>
                <strong>Primary Goal</strong>
                <p>{dietData?.goal}</p>
              </div>
            </div>
            {dietData?.dietaryRestrictions && dietData.dietaryRestrictions !== "none" && (
              <div className="goal-item">
                <span className="goal-icon">🚫</span>
                <div>
                  <strong>Dietary Restrictions</strong>
                  <p>{dietData.dietaryRestrictions}</p>
                </div>
              </div>
            )}
            {dietData?.medicalConditions && dietData.medicalConditions !== "none" && (
              <div className="goal-item medical">
                <span className="goal-icon">⚕️</span>
                <div>
                  <strong>Medical Conditions</strong>
                  <p>{dietData.medicalConditions}</p>
                </div>
              </div>
            )}
            <div className="goal-item insight">
              <span className="goal-icon">💡</span>
              <div>
                <strong>AI Insight</strong>
                <p>
                  {dietData?.goal?.toLowerCase().includes("lose")
                    ? "Focus on a sustainable calorie deficit of 500 kcal per day for safe weight loss."
                    : dietData?.goal?.toLowerCase().includes("gain")
                      ? "Increase your calorie intake with nutrient-dense foods and strength training."
                      : "Maintain a balanced diet and stay consistent with your meal plan for optimal results."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div><header /></>
  );
}
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../../styles/diet-form.css';

export default function DietFormPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: '',
    activityLevel: '',
    goal: '',
    dietaryRestrictions: '',
    medicalConditions: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/diet/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          dietData: formData
        })
      });

      if (response.ok) {
        const updatedUser = { ...user, hasDietData: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        router.push('/dashboard');
      }
    } catch (err) {
      alert('Failed to save data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="diet-form-container">
      <div className="diet-form-box">
        <div className="form-header">
          <h1>Tell Us About Yourself</h1>
          <p>Help us create your personalized diet plan</p>
        </div>

        <form onSubmit={handleSubmit} className="diet-form">
          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                placeholder="Enter your age"
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
                placeholder="Your weight"
              />
            </div>

            <div className="form-group">
              <label>Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                required
                placeholder="Your height"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Activity Level</label>
            <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} required>
              <option value="">Select your activity level</option>
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Light (exercise 1-3 days/week)</option>
              <option value="moderate">Moderate (exercise 3-5 days/week)</option>
              <option value="active">Active (exercise 6-7 days/week)</option>
              <option value="veryActive">Very Active (physical job or 2x training)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Health Goal</label>
            <select name="goal" value={formData.goal} onChange={handleChange} required>
              <option value="">Select your goal</option>
              <option value="weightLoss">Weight Loss</option>
              <option value="weightGain">Weight Gain</option>
              <option value="maintenance">Maintain Weight</option>
              <option value="muscle">Build Muscle</option>
            </select>
          </div>

          <div className="form-group">
            <label>Dietary Restrictions (Optional)</label>
            <input
              type="text"
              name="dietaryRestrictions"
              value={formData.dietaryRestrictions}
              onChange={handleChange}
              placeholder="e.g., Vegetarian, Vegan, Gluten-free"
            />
          </div>

          <div className="form-group">
            <label>Medical Conditions (Optional)</label>
            <textarea
              name="medicalConditions"
              value={formData.medicalConditions}
              onChange={handleChange}
              placeholder="Any medical conditions we should know about?"
              rows="3"
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Saving...' : 'Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

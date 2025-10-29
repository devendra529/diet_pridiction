import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import Footer from '../components/Footer';
import '../styles/globals.css';

export default function Home() {
  return (
    <>
      <header className="header">
        <div className="logo">🥗 DietPredict</div>

        <div className="authButtons">
          <Link href="/auth/login" className="button loginButton">
            Login
          </Link>
          <Link href="/auth/signup" className="button signupButton">
            Sign Up
          </Link>
        </div>
      </header>

      <Hero />

      {/* How to Use Section */}
      <section className="section">
        <h2 className="section-title">How to Use DietPredict</h2>
        <div className="cards-grid">
          <Card
            icon="📝"
            title="1. Create Profile"
            text="Sign up and tell us about your age, weight, height, activity level, and health goals."
          />
          <Card
            icon="🤖"
            title="2. AI Analysis"
            text="Our AI analyzes your data and generates personalized meal recommendations."
          />
          <Card
            icon="🍽️"
            title="3. Get Your Plan"
            text="Receive a customized weekly meal plan with recipes and shopping lists."
          />
          <Card
            icon="📊"
            title="4. Track Progress"
            text="Monitor your nutrition intake and see your progress towards your goals."
          />
        </div>
      </section>

      {/* Why Diet is Important Section */}
      <section className="section light-bg">
        <h2 className="section-title">Why Diet Matters</h2>
        <div className="cards-grid">
          <Card
            icon="💪"
            title="Energy & Vitality"
            text="Proper nutrition fuels your body, boosting energy levels and overall vitality for daily activities."
          />
          <Card
            icon="❤️"
            title="Disease Prevention"
            text="A balanced diet reduces risk of chronic diseases like diabetes, heart disease, and obesity."
          />
          <Card
            icon="🧠"
            title="Mental Clarity"
            text="Good nutrition supports brain function, improving focus, memory, and mental well-being."
          />
        </div>
      </section>

      {/* What to Eat Section */}
      <section className="section">
        <h2 className="section-title">Essential Food Groups</h2>
        <div className="cards-grid">
          <Card icon="🥦" title="Vegetables & Fruits" text="Rich in vitamins, minerals, and fiber. Aim for colorful variety daily." />
          <Card icon="🍗" title="Lean Proteins" text="Essential for muscle repair and growth. Include fish, chicken, legumes, and tofu." />
          <Card icon="🌾" title="Whole Grains" text="Provide sustained energy and fiber. Choose brown rice, quinoa, and oats." />
          <Card icon="🥑" title="Healthy Fats" text="Support brain and heart health. Include avocados, nuts, seeds, and olive oil." />
          <Card icon="🥛" title="Dairy & Alternatives" text="Calcium for strong bones. Choose low-fat options or fortified alternatives." />
          <Card icon="💧" title="Water & Hydration" text="Essential for all body functions. Drink 8+ glasses daily for optimal health." />
        </div>
      </section>

      <Footer />
    </>
  );
}

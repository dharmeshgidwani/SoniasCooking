import "../css/AboutUs.css"; // Import the modern CSS

const AboutUs = () => {
  return (
    <div className="about-container">
      <h1>About Us</h1>
      <p>
        Welcome to <strong>My Cooking Channel</strong>, where we turn simple ingredients into mouthwatering dishes!  
        Cooking is not just about food; it’s an <strong>art, passion, and love</strong> that brings people together.  
      </p>

      <h2>🎬 Our YouTube Channel</h2>
      <p>
        At <strong>My Cooking Channel</strong>, we share **delicious recipes**, **cooking tips**, and **step-by-step guides**  
        to help you become a master chef in your own kitchen. Whether you're a beginner or a seasoned cook,  
        you’ll find something exciting to try.  
      </p>
      <p>
        Our videos cover:
        <ul>
          <li>🍜 **Quick & Easy Recipes** for busy days</li>
          <li>🍰 **Desserts & Baking** to satisfy your sweet tooth</li>
          <li>🌱 **Healthy & Nutritious Meals** for a balanced diet</li>
          <li>🔥 **Traditional & Modern Dishes** with a twist</li>
        </ul>
      </p>

      <h2>👨‍🍳 Why Choose Us?</h2>
      <p>
        We believe that <strong>cooking should be fun and effortless</strong>.  
        Our recipes are <strong>well-explained, easy to follow, and absolutely delicious</strong>.  
        Every dish is crafted with love, ensuring the best flavors in every bite.  
      </p>

      <h2>📲 Connect With Us</h2>
      <p>
        Follow us on social media and stay updated with our latest recipes, cooking tips, and behind-the-scenes moments!  
      </p>

      <div className="social-links">
        <a href="https://www.instagram.com/sonias_cooking25" target="_blank" className="social-btn instagram">
          📸 Follow on <strong>&nbsp;Instagram</strong>
        </a>
        <a href="https://wa.me/919001286364" target="_blank" className="social-btn whatsapp">
          💬 Chat on <strong>&nbsp;WhatsApp</strong>
        </a>
        <a href="https://www.youtube.com/channel/UC5E8CDOgZKHj94NovE_FBmw" target="_blank" className="social-btn youtube">
          🎥 Subscribe on <strong> &nbsp;YouTube</strong>
        </a>
      </div>
    </div>
  );
};

export default AboutUs;

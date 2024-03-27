import React from "react";

const AboutSection: React.FC = () => {
  return (
    <section className="about-section text-center py-5">
      <div className="container">
        <h2 className="mb-4">About Us</h2>
        <p className="lead mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec pharetra nisi at dolor pellentesque, non accumsan enim eleifend.
        </p>
        <p>Contact us at: example@example.com</p>
      </div>
    </section>
  );
};

export default AboutSection;

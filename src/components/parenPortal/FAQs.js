import React, { useState } from "react";
import "./FAQs.css";
import bannerImage from "../../images/Gaudium washcare banner.png";

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const FAQS = [
    {
      question: "How do I place my order?",
      answer: "To place your order, please follow the instructions provided in the portal and complete the order process."
    },
    {
      question: "What is the last date to place an order?",
      answer: "The uniform order must be placed by 24th May 2025 to ensure timely delivery and your child attends school in proper uniform as per the school dress code policy."
    },
    {
      question: "Can I choose the items?",
      answer: "No, parents cannot choose individual items. The Uniform bundle consists of mandatory requirements as per the school dress code policy."
    },
    {
      question: "Are all school uniform items available online?",
      answer: "Yes, all required school uniform items included in the bundle which are mandatory."
    },
    {
      question: "How do I know the correct size for my child?",
      answer: "Uniform measurements are preloaded after taking measurements at the school. In cases where measurements are unavailable, or if your child is a new admission, the size chart is displayed in the portal. Please refer to the size chart carefully before placing your order."
    },
    {
      question: "Can I change or cancel my order after placing it?",
      answer: "Orders once submitted cannot be cancelled."
    },
    {
      question: "How is my order delivered?",
      answer: "You can choose between home delivery (charged) or delivery at school (no charges), Delivery is available only within Hyderabad."
    },
    {
      question: "Do I need to be at home to receive my order?",
      answer: "Yes, you need to be at home. If you are not available, please authorize someone to receive the parcel on your behalf."
    },
    {
      question: "Can I return or exchange if the size doesn't fit? What is the process?",
      answer: "Parents are requested to double-check the size before placing the order. However, if there is a discrepancy in the size, please visit the school to return the parcel and collect the correct size in person. Kindly ensure that the item is unused, in original condition, and has the tag intact."
    },
    {
      question: "How long will it take to receive my order?",
      answer: "Orders are typically delivered within 5–7 working days. Delays, if any, will be communicated."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is shipped, a tracking link will be shared via email/ SMS."
    },
    {
      question: "Is it possible to order additional uniform items separately?",
      answer: "Yes, individual items can be ordered separately at a later date. The school will send a communication on the same."
    },
    {
      question: "What payment methods do you accept?",
      answer: "Payment is to be made via the uniform ordering portal only."
    },
    {
      question: "The amount has been debited but I have not received any order confirmation by email or SMS. What is to be done?",
      answer: "Please contact support@thathvauniforms.com, if the payment has not been returned to your account. Kindly note that queries will be addressed in 3 working days."
    }
  ]; 
  
  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const splitFAQs = () => {
    const midpoint = Math.ceil(FAQS.length / 2);
    return {
      left: FAQS.slice(0, midpoint),
      right: FAQS.slice(midpoint)
    };
  };

  const { left, right } = splitFAQs();

  const renderFAQs = (faqArray) => {
    return faqArray.map((faq, index) => {
      const actualIndex = faqArray === left ? index : index + left.length;
      const isActive = activeIndex === actualIndex;
      
      return (
        <div className="faq-item" key={actualIndex}>
          <div 
            className={`faq-question ${isActive ? 'active' : ''}`}
            onClick={() => toggleFAQ(actualIndex)}
          >
            <h5>{faq.question}</h5>
            <span className="faq-icon">{isActive ? '−' : '+'}</span>
          </div>
          <div className={`faq-answer ${isActive ? 'active' : ''}`}>
            <p>{faq.answer}</p>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="container my-5">
      <div className="banner-container">
        <img src={bannerImage} alt="Gaudium Washcare Instructions" className="banner-image" />
      </div>
      
      <div className="faq-header">
        <h2>Frequently Asked Questions</h2>
        <p>Find answers to common questions about ordering school uniforms</p>
      </div>
      
      <div className="faq-container">
        <div className="row">
          <div className="col-lg-6 col-md-12 mb-4 faq-column">
            {renderFAQs(left)}
          </div>
          <div className="col-lg-6 col-md-12 faq-column">
            {renderFAQs(right)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQs;

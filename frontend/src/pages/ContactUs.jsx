'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/web/contact-us.css';
import '../styles/web/colors.css';

export default function ContactUs() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyOrg: '',
    subject: '',
    service: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const menuToggleRef = useRef(null);
  const responsiveNavRef = useRef(null);
  const mobileOverlayRef = useRef(null);
  const scrollToTopBtnRef = useRef(null);
  const preloaderRef = useRef(null);

  useEffect(() => {
    // Preloader
    const preloader = preloaderRef.current;
    if (preloader) {
      window.addEventListener('load', () => {
        preloader.style.display = 'none';
      });
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 2000);
    }

    // AOS initialization
    if (typeof window !== 'undefined' && window.AOS) {
      window.AOS.init({ duration: 1000, easing: 'ease', once: true });
    }

    // Scroll to top button
    const scrollToTopBtn = scrollToTopBtnRef.current;
    if (scrollToTopBtn) {
      window.addEventListener('scroll', () => {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
          scrollToTopBtn.style.display = 'block';
        } else {
          scrollToTopBtn.style.display = 'none';
        }
      });
      scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Scroll to hash on mount
    if (window.location.hash) {
      setTimeout(() => {
        const el = document.querySelector(window.location.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, []);

  useEffect(() => {
    const menuToggle = menuToggleRef.current;
    const mobileOverlay = mobileOverlayRef.current;

    const toggleMenu = () => {
      setMenuOpen(prev => !prev);
    };

    if (menuToggle) {
      menuToggle.addEventListener('click', toggleMenu);
    }
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', toggleMenu);
    }

    return () => {
      if (menuToggle) menuToggle.removeEventListener('click', toggleMenu);
      if (mobileOverlay) mobileOverlay.removeEventListener('click', toggleMenu);
    };
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus(null);
    try {
      const res = await fetch('/api/consultations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', phone: '', companyOrg: '', subject: '', service: '', message: '' });
      } else {
        setFormStatus('error');
      }
    } catch (err) {
      setFormStatus('error');
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(prev => prev === index ? null : index);
  };

  return (
    <>
    <div ref={preloaderRef} id="preloader">
      <div className="loader-content">
        <p className="loader-text">HOBUCO platform...</p>
        <div className="loader-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
    <div className="behind-nav">
      <header>
        <nav>
          <div className="nav-top">
            <div className="nav-top-left">
              <p>Got a Problem? We've Got The Solution! <Link to="/contact-us">Contact Us</Link></p>
            </div>
            <div className="nav-top-right">
              <p><i className="fas fa-envelope"></i> hobucoltd2050@gmail.com</p>
              <p className="nbr"><i className="fas fa-phone"></i> +250 788 696 388 | +250 788 213 984</p>
            </div>
          </div>
          <hr />
          <div className="nav-bottom">
            <div className="nav-bottom-logo">
              <h1>HOBUCO</h1>
            </div>
            <div className="nav-links nav-menu">
              <Link to="/">Home</Link>
              <Link to="/about">About Us</Link>
              <Link to="/services">Services</Link>
              <Link to="/contact-us" className="active">Contact Us</Link>
              <a href="#contact-form-section" onClick={(e) => scrollToSection(e, 'contact-form-section')}>Book a Consultance</a>
            </div>
            <div className="nav-bottom-sociallinks">
              <div className="social-links-nav">
                <Link to="/login"><button>Login</button></Link>
              </div>
              <div className="menu-toggle" ref={menuToggleRef}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
            </div>
          </div>
        </nav>
      </header>
      <div
        className={"responsive-nav-menu" + (menuOpen ? ' active' : '')}
        ref={responsiveNavRef}
        id="responsiveNav"
      >
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
        <Link to="/services" onClick={() => setMenuOpen(false)}>Services</Link>
        <Link to="/contact-us" className="active" onClick={() => setMenuOpen(false)}>Contact Us</Link>
        <a href="#contact-form-section" onClick={(e) => { scrollToSection(e, 'contact-form-section'); setMenuOpen(false); }}>Book a Consultance</a>
      </div>
    </div>

    <section className="contact-hero hero-section">
      <div className="content-left">
        <h1 className="main-heading">Let's Work Together</h1>
        <p className="description">
          Whether you're looking for expert consultation or have a quick question — our team is ready to help you grow and solve challenges.
        </p>
        <div className="cta-buttons">
          <Link to="/#contact" className="btn btn-primary">Contact Us Now</Link>
          <a href="tel:+250788696388" className="btn btn-secondary">Call Us</a>
        </div>
      </div>
      <div className="hero-right">
        <div className="hero-image-container">
          <div className="background-circle"></div>
          <div className="hero-image">
            <img alt="Support Team" src="/images/contact-us.jpeg" />
          </div>
          <div className="stat-card stat-main">
            <div className="stat-icon">
              <i className="fas fa-headset"></i>
            </div>
            <div className="stat-info">
              <h4>24/7</h4>
              <p>Support<br />Available</p>
            </div>
          </div>
          <div className="stat-card experts-card">
            <h4>Reach Channels</h4>
            <div className="expert-avatars">
              <div className="expert-avatar"><i className="fab fa-whatsapp"></i></div>
              <div className="expert-avatar"><i className="fas fa-envelope"></i></div>
              <div className="expert-avatar"><i className="fas fa-phone"></i></div>
              <div className="expert-avatar">3+</div>
            </div>
          </div>
        </div>
        <div className="floating-elements">
          <div className="floating-dot dot-1"></div>
          <div className="floating-dot dot-2"></div>
          <div className="floating-dot dot-3"></div>
        </div>
      </div>
    </section>

    <section className="contact-info-section">
      <div className="section-header">
        <h2>Contact Us On</h2>
        <p>We're always happy to hear from you. Use the information below to reach us by phone, email, or visit our office during working hours. Whether you have questions, feedback, or need support, feel free to get in touch.</p>
      </div>
      <div className="contact-info-grid">
        <div className="contact-info-card">
          <div className="contact-info-icon">
            <i className="fas fa-map-marker-alt"></i>
          </div>
          <h3>Our Location</h3>
          <p>Muhanga District, Rwanda<br />East Africa</p>
          <a className="contact-link" style={{ cursor: 'pointer' }}>Get Directions</a>
        </div>
        <div className="contact-info-card">
          <div className="contact-info-icon">
            <i className="fas fa-phone"></i>
          </div>
          <h3>Call Us</h3>
          <p>Primary: +250 788 696 388<br />Secondary: +250 788 213 984</p>
          <a href="tel:+250788696388" className="contact-link">Call Now</a>
        </div>
        <div className="contact-info-card">
          <div className="contact-info-icon">
            <i className="fas fa-envelope"></i>
          </div>
          <h3>Email Us</h3>
          <p>hobucoltd2050@gmail.com<br />www.hobuco.com</p>
          <a href="mailto:hobucoltd2050@gmail.com" className="contact-link">Send Email</a>
        </div>
        <div className="contact-info-card">
          <div className="contact-info-icon">
            <i className="fas fa-clock"></i>
          </div>
          <h3>Working Hours</h3>
          <p>Monday - Friday: 8:00 AM - 6:00 PM<br />Saturday: 9:00 AM - 2:00 PM</p>
          <a href="#office-hours" onClick={(e) => scrollToSection(e, 'office-hours')} className="contact-link">View Schedule</a>
        </div>
      </div>
    </section>

    <section className="contact-form-section" id="contact-form-section">
      <div className="contact-form-container">
        <div className="contact-form-content">
          <h2>Let's Discuss Your Project</h2>
          <p>We're here to help you achieve your business goals. Whether you need strategic consulting, policy development, or research services, our team of experts is ready to provide tailored solutions for your unique challenges.</p>
          <div className="contact-features">
            <div className="contact-feature">
              <i className="fas fa-clock"></i>
              <span>Quick Response Time - Within 24 Hours</span>
            </div>
            <div className="contact-feature">
              <i className="fas fa-users"></i>
              <span>Expert Consultants with 8+ Years Experience</span>
            </div>
            <div className="contact-feature">
              <i className="fas fa-shield-alt"></i>
              <span>Confidential & Secure Consultation</span>
            </div>
            <div className="contact-feature">
              <i className="fas fa-handshake"></i>
              <span>Customized Solutions for Every Client</span>
            </div>
          </div>
        </div>
        <div className="contact-form">
          <h3>Send Us a Message</h3>
          {formStatus === 'success' && <p style={{ color: 'green', marginBottom: '12px' }}>Your message has been sent successfully!</p>}
          {formStatus === 'error' && <p style={{ color: 'red', marginBottom: '12px' }}>Something went wrong. Please try again.</p>}
          <form onSubmit={handleSubmit} id="contactForm">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input id="firstName" name="firstName" required value={formData.firstName} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input id="lastName" name="lastName" required value={formData.lastName} onChange={handleInputChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input id="email" name="email" required type="email" value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="company">Company/Organization</label>
                <input id="company" name="companyOrg" value={formData.companyOrg} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="service">Service Interest</label>
                <select id="service" name="service" required value={formData.service} onChange={handleInputChange}>
                  <option value="">Select a Service</option>
                  <option value="Business-Strategy">Business Strategy</option>
                  <option value="Research">Research & Experimental</option>
                  <option value="Capacity-Building">Institutional Capacity Building</option>
                  <option value="Policy-Formulation">Policy & Strategy Formulation</option>
                  <option value="Project-Management">Project Management</option>
                  <option value="Other Services">Other Services</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input id="subject" name="subject" required value={formData.subject} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea id="message" name="message" placeholder="Tell us about your project, challenges, or how we can help you..." required value={formData.message} onChange={handleInputChange}></textarea>
            </div>
            <button className="submit-btn" type="submit">
              <i className="fas fa-paper-plane"></i> Send Message
            </button>
          </form>
        </div>
      </div>
    </section>

    <section className="quick-contact-section">
      <div className="quick-contact-container">
        <h2>Need Immediate Assistance?</h2>
        <p>Choose the fastest way to reach us based on your needs</p>
        <div className="quick-contact-options">
          <div className="quick-contact-option">
            <i className="fas fa-phone-alt"></i>
            <h4>Call Direct</h4>
            <p>Speak with our consultants immediately</p>
          </div>
          <div className="quick-contact-option">
            <i className="fab fa-whatsapp"></i>
            <h4>WhatsApp</h4>
            <p>Quick chat for urgent inquiries</p>
          </div>
          <div className="quick-contact-option">
            <i className="fas fa-video"></i>
            <h4>Video Call</h4>
            <p>Schedule a face-to-face meeting</p>
          </div>
          <div className="quick-contact-option">
            <i className="fas fa-calendar-alt"></i>
            <h4>Book Meeting</h4>
            <p>Schedule a consultation appointment</p>
          </div>
        </div>
        <div className="emergency-contact">
          <h3>Emergency Consultation</h3>
          <p>For urgent business matters that require immediate attention</p>
          <a href="tel:+250788696388" className="emergency-btn">
            <i className="fas fa-phone"></i> Call Emergency Line
          </a>
        </div>
      </div>
    </section>

    <section className="office-hours-section" id="office-hours">
      <div className="office-hours-container">
        <h2>Office Hours & Availability</h2>
        <div className="office-hours-grid">
          <div className="office-hours-card">
            <i className="fas fa-clock"></i>
            <h4>Regular Hours</h4>
            <p><strong>Monday - Friday</strong><br />8:00 AM - 6:00 PM</p>
          </div>
          <div className="office-hours-card">
            <i className="fas fa-calendar-week"></i>
            <h4>Weekend Hours</h4>
            <p><strong>Saturday</strong><br />9:00 AM - 2:00 PM<br /><strong>Sunday:</strong> Closed</p>
          </div>
          <div className="office-hours-card">
            <i className="fas fa-star"></i>
            <h4>Special Consultation</h4>
            <p><strong>By Appointment</strong><br />Extended hours available for urgent projects</p>
          </div>
          <div className="office-hours-card">
            <i className="fas fa-globe"></i>
            <h4>Time Zone</h4>
            <p><strong>East Africa Time (EAT)</strong><br />UTC+3</p>
          </div>
        </div>
      </div>
    </section>

    <section className="faq-section">
      <div className="faq-container">
        <h2>Frequently Asked Questions</h2>
        <div className={"faq-item" + (openFaq === 0 ? ' active' : '')}>
          <div className="faq-question" onClick={() => toggleFaq(0)} style={{ cursor: 'pointer' }}>
            <h4>How quickly can you respond to consultation requests?</h4>
            <i className="fas fa-chevron-down"></i>
          </div>
          <div className="faq-answer" style={{ display: openFaq === 0 ? 'block' : 'none' }}>
            <div className="faq-answer-content">
              <p>We typically respond to all consultation requests within 24 hours during business days. For urgent matters, we offer same-day response and emergency consultation services.</p>
            </div>
          </div>
        </div>
        <div className={"faq-item" + (openFaq === 1 ? ' active' : '')}>
          <div className="faq-question" onClick={() => toggleFaq(1)} style={{ cursor: 'pointer' }}>
            <h4>What types of organizations do you work with?</h4>
            <i className="fas fa-chevron-down"></i>
          </div>
          <div className="faq-answer" style={{ display: openFaq === 1 ? 'block' : 'none' }}>
            <div className="faq-answer-content">
              <p>We work with a diverse range of clients including private companies, NGOs, government institutions, international organizations, and development projects across various sectors in Rwanda and beyond.</p>
            </div>
          </div>
        </div>
        <div className={"faq-item" + (openFaq === 2 ? ' active' : '')}>
          <div className="faq-question" onClick={() => toggleFaq(2)} style={{ cursor: 'pointer' }}>
            <h4>Do you offer remote consultation services?</h4>
            <i className="fas fa-chevron-down"></i>
          </div>
          <div className="faq-answer" style={{ display: openFaq === 2 ? 'block' : 'none' }}>
            <div className="faq-answer-content">
              <p>Yes, we provide both in-person and remote consultation services via video conferencing, phone calls, and digital collaboration tools to serve clients across different locations.</p>
            </div>
          </div>
        </div>
        <div className={"faq-item" + (openFaq === 3 ? ' active' : '')}>
          <div className="faq-question" onClick={() => toggleFaq(3)} style={{ cursor: 'pointer' }}>
            <h4>What is your consultation process?</h4>
            <i className="fas fa-chevron-down"></i>
          </div>
          <div className="faq-answer" style={{ display: openFaq === 3 ? 'block' : 'none' }}>
            <div className="faq-answer-content">
              <p>Our process includes: initial consultation to understand your needs, proposal development with tailored solutions, project implementation with regular updates, and post-project support to ensure success.</p>
            </div>
          </div>
        </div>
        <div className={"faq-item" + (openFaq === 4 ? ' active' : '')}>
          <div className="faq-question" onClick={() => toggleFaq(4)} style={{ cursor: 'pointer' }}>
            <h4>How do you ensure confidentiality?</h4>
            <i className="fas fa-chevron-down"></i>
          </div>
          <div className="faq-answer" style={{ display: openFaq === 4 ? 'block' : 'none' }}>
            <div className="faq-answer-content">
              <p>We maintain strict confidentiality through signed NDAs, secure data handling protocols, and professional ethics standards. All client information is protected and never shared without explicit consent.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="social-media-section">
      <div className="social-media-container">
        <h2>Connect With Us</h2>
        <p>Follow us on social media for updates, insights, and industry news</p>
        <div className="social-media-grid">
          <a className="social-media-card facebook" style={{ cursor: 'pointer' }}>
            <i className="fab fa-facebook-f"></i>
            <h4>Facebook</h4>
            <p>Latest updates and company news</p>
          </a>
          <a className="social-media-card twitter" style={{ cursor: 'pointer' }}>
            <i className="fab fa-twitter"></i>
            <h4>Twitter</h4>
            <p>Industry insights and tips</p>
          </a>
          <a className="social-media-card linkedin" style={{ cursor: 'pointer' }}>
            <i className="fab fa-linkedin-in"></i>
            <h4>LinkedIn</h4>
            <p>Professional network and case studies</p>
          </a>
          <a className="social-media-card instagram" style={{ cursor: 'pointer' }}>
            <i className="fab fa-instagram"></i>
            <h4>Instagram</h4>
            <p>Behind-the-scenes and team highlights</p>
          </a>
        </div>
      </div>
    </section>

    <footer className="footer">
      <div className="footer-container">
        <div className="footer-about">
          <h3>HOBUCO</h3>
          <p>Professional consultance services to help your business thrive in today's competitive market.</p>
          <div className="footer-social">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
            <li><a href="#contact-form-section" onClick={(e) => scrollToSection(e, 'contact-form-section')}>Book Consultation</a></li>
          </ul>
        </div>
        <div className="footer-services">
          <h3>Our Services</h3>
          <ul>
            <li><a>Business Strategy</a></li>
            <li><a>Policy and strategy formulation</a></li>
            <li><a>Research and experimental</a></li>
            <li><a>Institutional capacity building</a></li>
            <li><a>Education support activities</a></li>
          </ul>
        </div>
        <div className="footer-newsletter">
          <h3>Newsletter</h3>
          <p>Subscribe to receive the latest updates and insights from our experts.</p>
          <form>
            <input required type="email" placeholder="Your Email" />
            <button><i className="fas fa-paper-plane"></i></button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 HOBUCO Consultance Services. All Rights Reserved.</p>
      </div>
    </footer>

    <button ref={scrollToTopBtnRef} id="scrollToTopBtn" title="Go to top"><i className="bx-arrow-to-top-stroke bxr"></i></button>
    <div className="whatsapp-float" id="whatsappFloat">
      <a href="https://wa.me/250788696388?text=Hello%20there%2C%20I%20need%20assistance%20with%20your%20services." target="_blank" className="whatsapp-btn">
        <i className="fab fa-whatsapp"></i>
      </a>
      <div className="whatsapp-tooltip">Need help? Chat with us!</div>
    </div>
    <div className="mobile-overlay" ref={mobileOverlayRef} id="mobileOverlay"></div>
    </>
  );
}

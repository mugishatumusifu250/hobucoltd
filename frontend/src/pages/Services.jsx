'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/web/services.css';
import '../styles/web/colors.css';

export default function Services() {
  const [menuOpen, setMenuOpen] = useState(false);
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
    <div className="main-content">
      <div className="behind-nav">
        <header>
          <nav>
            <div className="nav-top">
              <div className="nav-top-left">
                <p>Got a Problem? We've Got The Solution!<Link to="/contact-us">Contact Us</Link></p>
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
                <Link to="/services" className="active">Services</Link>
                <Link to="/contact-us">Contact Us</Link>
                <Link to="/contact-us#contact-form-section">Book a Consultance</Link>
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
          <Link to="/services" className="active" onClick={() => setMenuOpen(false)}>Services</Link>
          <Link to="/contact-us" onClick={() => setMenuOpen(false)}>Contact Us</Link>
          <Link to="/contact-us#contact-form-section" onClick={() => setMenuOpen(false)}>Book a Consultance</Link>
        </div>
      </div>

      <section className="services-hero-section">
        <div className="services-content-left">
          <div className="services-subtitle">Our Services</div>
          <h1 className="services-main-heading">
            Driving Business Forward With <span>Reliable Expertise</span>
          </h1>
          <p className="services-description">
            HOBUCO Ltd offers specialized consulting services designed to streamline your business, enhance performance, and build long-term value across multiple sectors.
          </p>
          <div className="service-stats">
            <div className="stat-item">
              <span className="stat-number">12+</span>
              <span className="stat-label">Solutions Offered</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">300+</span>
              <span className="stat-label">Happy Clients</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Trusted Delivery</span>
            </div>
          </div>
          <div className="services-cta">
            <Link to="/about#team-section"><button className="btn btn-primary">See Our Experts</button></Link>
            <Link to="/contact-us#contact-form-section"><button className="btn btn-outline">Request Proposal</button></Link>
          </div>
        </div>
        <div className="services-right">
          <div className="service-box">
            <div className="service-icon"><i className="fas fa-lightbulb"></i></div>
            <div className="service-title">Innovation Advisory</div>
          </div>
          <div className="service-box">
            <div className="service-icon"><i className="fas fa-chart-line"></i></div>
            <div className="service-title">Business Growth</div>
          </div>
          <div className="service-box">
            <div className="service-icon"><i className="fas fa-laptop-code"></i></div>
            <div className="service-title">Tech & Digital</div>
          </div>
          <div className="service-box">
            <div className="service-icon"><i className="fas fa-users-cog"></i></div>
            <div className="service-title">Human Capital</div>
          </div>
        </div>
      </section>

      <section className="services-overview" id="services-overview">
        <div className="services-overview-container">
          <div className="section-header">
            <h2>Our Core Services</h2>
            <p>We provide comprehensive consulting solutions tailored to meet your specific business needs and drive sustainable growth.</p>
          </div>
          <div className="main-services">
            <div className="main-service-card">
              <div className="service-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Business Strategy</h3>
              <p>Develop comprehensive business strategies that align with your vision and drive sustainable growth in competitive markets.</p>
              <ul className="service-features">
                <li><i className="fas fa-check"></i> Strategic Planning & Analysis</li>
                <li><i className="fas fa-check"></i> Market Research & Competitor Analysis</li>
                <li><i className="fas fa-check"></i> Business Model Development</li>
                <li><i className="fas fa-check"></i> Growth Strategy Implementation</li>
              </ul>
              <a href="#additional-services" onClick={(e) => scrollToSection(e, 'additional-services')} className="service-link">Learn More <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="main-service-card">
              <div className="service-icon">
                <i className="fas fa-microscope"></i>
              </div>
              <h3>Research & Experimental Development</h3>
              <p>Conduct comprehensive research and experimental development in social sciences and humanities sectors.</p>
              <ul className="service-features">
                <li><i className="fas fa-check"></i> Social Science Research</li>
                <li><i className="fas fa-check"></i> Humanities Development Projects</li>
                <li><i className="fas fa-check"></i> Data Collection & Analysis</li>
                <li><i className="fas fa-check"></i> Research Methodology Design</li>
              </ul>
              <a href="#additional-services" onClick={(e) => scrollToSection(e, 'additional-services')} className="service-link">Learn More <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="main-service-card">
              <div className="service-icon">
                <i className="fa-building-columns fa-solid"></i>
              </div>
              <h3>Institutional Capacity Building</h3>
              <p>Strengthen organizational capabilities through comprehensive capacity building and internal systems enhancement.</p>
              <ul className="service-features">
                <li><i className="fas fa-check"></i> Organizational Development</li>
                <li><i className="fas fa-check"></i> Internal Systems Strengthening</li>
                <li><i className="fas fa-check"></i> Staff Training & Development</li>
                <li><i className="fas fa-check"></i> Process Optimization</li>
              </ul>
              <a href="#additional-services" onClick={(e) => scrollToSection(e, 'additional-services')} className="service-link">Learn More <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="main-service-card">
              <div className="service-icon">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <h3>Policy & Strategy Formulation</h3>
              <p>Develop comprehensive policies, strategies, and procedure manuals to guide organizational operations effectively.</p>
              <ul className="service-features">
                <li><i className="fas fa-check"></i> Policy Development</li>
                <li><i className="fas fa-check"></i> Strategic Framework Design</li>
                <li><i className="fas fa-check"></i> Procedure Manual Creation</li>
                <li><i className="fas fa-check"></i> Implementation Guidelines</li>
              </ul>
              <a href="#additional-services" onClick={(e) => scrollToSection(e, 'additional-services')} className="service-link">Learn More <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="main-service-card">
              <div className="service-icon">
                <i className="fas fa-chart-pie"></i>
              </div>
              <h3>Monitoring & Evaluation</h3>
              <p>Comprehensive evaluation services including baseline, midline, and end-line assessments for various institutions.</p>
              <ul className="service-features">
                <li><i className="fas fa-check"></i> Baseline Assessments</li>
                <li><i className="fas fa-check"></i> Midline Evaluations</li>
                <li><i className="fas fa-check"></i> End-line Evaluations</li>
                <li><i className="fas fa-check"></i> Impact Assessment</li>
              </ul>
              <a href="#additional-services" onClick={(e) => scrollToSection(e, 'additional-services')} className="service-link">Learn More <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="main-service-card">
              <div className="service-icon">
                <i className="fas fa-project-diagram"></i>
              </div>
              <h3>Project Management</h3>
              <p>End-to-end project management services from identification and design to monitoring and evaluation of development projects.</p>
              <ul className="service-features">
                <li><i className="fas fa-check"></i> Project Identification & Design</li>
                <li><i className="fas fa-check"></i> Project Appraisal</li>
                <li><i className="fas fa-check"></i> Implementation Monitoring</li>
                <li><i className="fas fa-check"></i> Project Evaluation</li>
              </ul>
              <a href="#additional-services" onClick={(e) => scrollToSection(e, 'additional-services')} className="service-link">Learn More <i className="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </section>

      <section className="additional-services" id="additional-services">
        <div className="section-header">
          <h2>Additional Specialized Services</h2>
          <p>Explore our comprehensive range of specialized consulting services designed to meet diverse organizational needs.</p>
        </div>
        <div className="additional-services-grid">
          <div className="additional-service-item">
            <h4>Education Support Activities</h4>
            <p>Development of comprehensive training manuals and educational materials to support learning and development initiatives.</p>
          </div>
          <div className="additional-service-item">
            <h4>Impact Assessment Surveys</h4>
            <p>Comprehensive impact assessments including agroforestry, forestry, soil and water conservation engineering, and land care projects.</p>
          </div>
          <div className="additional-service-item">
            <h4>Management Consultancy</h4>
            <p>Professional management consultancy services and specialized training programs to enhance organizational effectiveness.</p>
          </div>
          <div className="additional-service-item">
            <h4>Outcome Harvesting/Mapping</h4>
            <p>Systematic approach to identifying, verifying, and explaining outcomes achieved by development programs and initiatives.</p>
          </div>
          <div className="additional-service-item">
            <h4>Results-Based Reporting</h4>
            <p>Development of comprehensive reporting systems focused on measurable results and impact documentation.</p>
          </div>
          <div className="additional-service-item">
            <h4>Due Diligence Preparation</h4>
            <p>Thorough preparation and support for due diligence processes to ensure compliance and risk management.</p>
          </div>
          <div className="additional-service-item">
            <h4>Partner Capacity Assessment (PCAS)</h4>
            <p>Comprehensive assessment tools to evaluate partner organization capabilities and capacity development needs.</p>
          </div>
          <div className="additional-service-item">
            <h4>Grant Proposal Development</h4>
            <p>Professional grant writing and proposal development services to secure funding for development projects.</p>
          </div>
          <div className="additional-service-item">
            <h4>Forestry Support Services</h4>
            <p>Specialized support services for forestry initiatives including conservation, management, and sustainable development.</p>
          </div>
          <div className="additional-service-item">
            <h4>Agricultural Raw Materials</h4>
            <p>Wholesale services for agricultural raw materials and live animals to support agricultural development projects.</p>
          </div>
          <div className="additional-service-item">
            <h4>Technical & Scientific Activities</h4>
            <p>Professional, scientific, and technical activities tailored to meet specific industry and organizational requirements.</p>
          </div>
          <div className="additional-service-item">
            <h4>Climate Justice Initiatives</h4>
            <p>Specialized programs focused on climate justice, environmental sustainability, and community resilience building.</p>
          </div>
        </div>
      </section>

      <section className="process-section">
        <div className="process-container">
          <div className="section-header">
            <h2>Our Consulting Process</h2>
            <p>A systematic approach to delivering exceptional results through proven methodologies and expert guidance.</p>
          </div>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h4>Initial Consultation</h4>
              <p>We begin with a comprehensive consultation to understand your specific needs, challenges, and objectives.</p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h4>Assessment & Analysis</h4>
              <p>Thorough assessment of your current situation and detailed analysis to identify opportunities and solutions.</p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h4>Strategy Development</h4>
              <p>Development of customized strategies and action plans tailored to your specific requirements and goals.</p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h4>Implementation Support</h4>
              <p>Hands-on support during implementation phase to ensure successful execution of recommended strategies.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Get Started?</h2>
          <p>Let our expert consultants help you achieve your goals with customized solutions designed for your success.</p>
          <div className="cta-buttons">
            <Link to="/contact-us#contact-form-section" className="btn btn-primary">Book a Consultation</Link>
            <Link to="/contact-us" className="btn btn-secondary">Contact Us Today</Link>
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
              <li><Link to="/services">Case Studies</Link></li>
              <li><Link to="/contact-us">Contact Us</Link></li>
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
            <p>Subscribe to our newsletter for the latest updates and insights.</p>
            <form>
              <input placeholder="Your Email" required type="email" />
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
    </div>
    </>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/web/about.css';
import '../styles/web/colors.css';

export default function About() {
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

    // AOS initialization (if AOS is loaded globally)
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

    // Year counters
    const currentYear = new Date().getFullYear();
    const years = currentYear - 2016;
    const yearsCount = document.getElementById('yearsCount');
    const yearsCount1 = document.getElementById('yearsCount1');
    const yearsCount2 = document.getElementById('yearsCount2');
    const currentyear = document.getElementById('currentyear');
    if (yearsCount) yearsCount.textContent = years;
    if (yearsCount1) yearsCount1.textContent = years;
    if (yearsCount2) yearsCount2.textContent = years;
    if (currentyear) currentyear.textContent = currentYear;

    // Scroll to hash on mount
    if (window.location.hash) {
      setTimeout(() => {
        const el = document.querySelector(window.location.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, []);

  useEffect(() => {
    // Mobile menu toggle
    const menuToggle = menuToggleRef.current;
    const responsiveNav = responsiveNavRef.current;
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
                <Link to="/about" className="active">About Us</Link>
                <Link to="/services">Services</Link>
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
          <Link to="/about" className="active" onClick={() => setMenuOpen(false)}>About Us</Link>
          <Link to="/services" onClick={() => setMenuOpen(false)}>Services</Link>
          <Link to="/contact-us" onClick={() => setMenuOpen(false)}>Contact Us</Link>
          <Link to="/contact-us#contact-form-section" onClick={() => setMenuOpen(false)}>Book a Consultance</Link>
        </div>
      </div>

      <section className="about-hero-section">
        <div className="about-content-left">
          <div className="about-subtitle">About HOBUCO Ltd</div>
          <h1 className="about-main-heading">
            Transforming Ideas Into <span>Sustainable Solutions</span>
          </h1>
          <p className="about-description">
            HOBUCO is a premier consultance firm dedicated to helping businesses achieve their full potential. With our team of experienced consultants, we provide tailored solutions to address your unique challenges.
          </p>
          <div className="about-after-description">
            <div className="about-stats">
              <div className="stat-item">
                <span className="stat-number"><span id="yearsCount"></span>+</span>
                <span className="stat-label">Years Experience</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Projects Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">98%</span>
                <span className="stat-label">Client Satisfaction</span>
              </div>
            </div>
            <div className="about-cta">
              <a href="#history-section" onClick={(e) => scrollToSection(e, 'history-section')}><button className="btn btn-primary">Our Journey</button></a>
              <a href="#team-section" onClick={(e) => scrollToSection(e, 'team-section')}><button className="btn btn-outline">Meet Our Team</button></a>
            </div>
          </div>
        </div>
        <div className="about-hero-right">
          <div className="about-visual-container">
            <div className="team-showcase">
              <div className="main-expert-card">
                <div className="expert-image">
                  <i className="fas fa-users"></i>
                </div>
                <div className="expert-name">Expert Team</div>
                <div className="expert-role">Multidisciplinary Consultants</div>
                <div className="expert-stats">
                  <div className="mini-stat">
                    <div className="mini-stat-number">5+</div>
                    <div className="mini-stat-label"></div>
                  </div>
                  <div className="mini-stat">
                    <div className="mini-stat-number"></div>
                    <div className="mini-stat-label"></div>
                  </div>
                </div>
              </div>
              <div className="floating-card experience-card">
                <span className="experience-number"><span id="yearsCount1"></span>+</span>
                <div className="experience-text">Years of Excellence</div>
              </div>
              <div className="floating-card achievement-card">
                <div className="achievement-icon">
                  <i className="fas fa-award"></i>
                </div>
                <div className="achievement-text">Industry Leaders</div>
              </div>
            </div>
            <div className="floating-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
            </div>
          </div>
          <div className="values-preview">
            <div className="value-item">
              <div className="value-text">Innovation</div>
            </div>
            <div className="value-item">
              <div className="value-text">Excellence</div>
            </div>
            <div className="value-item">
              <div className="value-text">Integrity</div>
            </div>
            <div className="value-item">
              <div className="value-text">Impact</div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-container">
          <div className="about-image">
            <img alt="About Us" src="/images/about-img.jpg" loading="eager" />
          </div>
          <div className="about-content">
            <div className="section-header">
              <h2>About HOBUCO</h2>
              <p>Your trusted partner in business excellence</p>
            </div>
            <p>HOBUCO Ltd established in the year 2016, is one of the multidisciplinary consulting firms in Rwanda that is goal oriented towards providing sustainable solutions to the challenges in the global consulting arena.</p>
            <p>Founded in 2016, HOBUCO Ltd has grown to become a leading consultation service provider in Rwanda, serving clients across various industries. Our approach combines industry expertise, innovative thinking, and practical solutions to deliver measurable results.</p>
            <div className="about-features">
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span><span id="yearsCount2"></span>+ Years of Experience</span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>500+ Satisfied Clients</span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>Expert Consultants</span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>Customized Solutions</span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>Global Reach</span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>Proven Results</span>
              </div>
            </div>
            <Link to="/services#services-overview" className="btn primary-btn">Learn More About Us</Link>
          </div>
        </div>
      </section>

      <section className="mission-section">
        <div className="mission-container">
          <div className="section-header">
            <h2>Our Mission & Values</h2>
            <p>Guiding principles that drive our success</p>
          </div>
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon">
                <i className="fas fa-bullseye"></i>
              </div>
              <h3>Our Mission</h3>
              <p>To empower businesses with strategic insights and practical solutions that drive sustainable growth and excellence in a competitive marketplace.</p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">
                <i className="fas fa-eye"></i>
              </div>
              <h3>Our Vision</h3>
              <p>To be the most trusted consultation partner, recognized globally for transforming businesses through innovative strategies and exceptional service.</p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>Our Values</h3>
              <p>Integrity, Excellence, Innovation, Collaboration, and Client-Centricity form the foundation of everything we do at HOBUCO.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="team-section" id="team-section">
        <div className="team-container">
          <div className="section-header">
            <h2>Meet Our Team</h2>
            <p>The experts behind our success</p>
          </div>
          <div className="team-grid">
            <div className="team-member">
              <div className="team-image">
                <img alt="Team Member" src="/images/Dr.Muhayimana-Fulgence.png" />
                <div className="team-social">
                  <a href="#"><i className="fab fa-whatsapp"></i></a>
                  <span>+250 788 888 888</span>
                </div>
              </div>
              <div className="team-info">
                <h3>Dr.Fulgence MPAYIMANA</h3>
                <p>CEO & Founder</p>
              </div>
            </div>
            <div className="team-member">
              <div className="team-image">
                <img alt="Team Member" src="/images/sanyu.jpg" />
                <div className="team-social">
                  <a href="#"><i className="fab fa-whatsapp"></i></a>
                  <span>+250 788 888 888</span>
                </div>
              </div>
              <div className="team-info">
                <h3>Sanyu Rebecca</h3>
                <p>Financial Consultant</p>
              </div>
            </div>
            <div className="team-member">
              <div className="team-image">
                <img alt="Team Member" src="/images/saano.jpg" />
                <div className="team-social">
                  <a href="#"><i className="fab fa-whatsapp"></i></a>
                  <span>+250 788 888 888</span>
                </div>
              </div>
              <div className="team-info">
                <h3>Saano Patient</h3>
                <p>Marketing Strategist</p>
              </div>
            </div>
            <div className="team-member">
              <div className="team-image">
                <img alt="Team Member" src="/images/deputy.png" />
                <div className="team-social">
                  <a href="#"><i className="fab fa-whatsapp"></i></a>
                  <span>+250 788 888 888</span>
                </div>
              </div>
              <div className="team-info">
                <h3>François Hakorimana</h3>
                <p>HR Consultant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="history-section" id="history-section">
        <div className="history-container">
          <div className="section-header">
            <h2>Our Journey</h2>
            <p>Milestones that shaped our company</p>
          </div>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-content">
                <span className="timeline-year">2016</span>
                <h3>Company Founded</h3>
                <p>HOBUCO was established with a vision to provide exceptional consultation services to businesses.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-content">
                <span className="timeline-year">2019</span>
                <h3>Expansion Phase</h3>
                <p>Expanded our services to include financial advisory and marketing strategy consultation.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-content">
                <span className="timeline-year">2021</span>
                <h3>International Reach</h3>
                <p>Opened our first international office and began serving clients across borders.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-content">
                <span className="timeline-year">2021</span>
                <h3>Industry Recognition</h3>
                <p>Received multiple industry awards for our innovative consultation approaches.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-content">
                <span className="timeline-year">2023</span>
                <h3>Digital Transformation</h3>
                <p>Launched our digital consultation services to help businesses navigate the digital landscape.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-content">
                <span className="timeline-year"><span id="currentyear"></span></span>
                <h3>Present Day</h3>
                <p>Continuing to grow and innovate, serving over 500 clients worldwide with a team of expert consultants.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Transform Your Business?</h2>
          <p>Schedule a consultation with our experts and discover how we can help you achieve your business goals.</p>
          <div className="cta-buttons">
            <Link to="/contact-us#contact-form-section" className="btn primary-btn">Book a Consultation</Link>
            <Link to="/contact-us" className="btn secondary-btn">Contact Us</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-about">
            <h3>HOBUCO</h3>
            <p>Professional consultation services to help your business thrive in today's competitive market.</p>
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
              <input placeholder="Your Email Address" type="email" />
              <button><i className="fas fa-paper-plane"></i></button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2023 HOBUCO Consultation Services. All Rights Reserved.</p>
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

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
/* AOS loaded via CDN in index.html */
import '../styles/web/style.css';
import '../styles/web/colors.css';

const Home = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyOrg: '',
    subject: '',
    service: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentYear, setCurrentYear] = useState(2016);
  const yearsCountRef = useRef(null);
  const yearsCount2Ref = useRef(null);
  const yearsCount1Ref = useRef(null);
  const countersAnimated = useRef(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus(null);
    try {
      const res = await fetch('/api/consultations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', phone: '', companyOrg: '', subject: '', service: '', message: '' });
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  };

  useEffect(() => {
    // Preloader fade-out after 2s
    const preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 500);
      }, 2000);
    }

    // AOS init
    AOS.init({ duration: 1000, once: true });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const responsiveNav = document.getElementById('responsiveNav');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const handleToggle = () => {
      setMenuOpen((prev) => !prev);
      if (responsiveNav) responsiveNav.classList.toggle('active');
      if (mobileOverlay) mobileOverlay.classList.toggle('active');
    };
    if (menuToggle) menuToggle.addEventListener('click', handleToggle);
    const closeMenu = () => {
      setMenuOpen(false);
      if (responsiveNav) responsiveNav.classList.remove('active');
      if (mobileOverlay) mobileOverlay.classList.remove('active');
    };
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);

    // Scroll-to-top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      if (menuToggle) menuToggle.removeEventListener('click', handleToggle);
      if (mobileOverlay) mobileOverlay.removeEventListener('click', closeMenu);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Year counter animation
  useEffect(() => {
    const targetYear = new Date().getFullYear();
    const startYear = 2016;
    const duration = 2000;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const year = Math.floor(startYear + (targetYear - startYear) * progress);
      setCurrentYear(year);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !countersAnimated.current) {
            countersAnimated.current = true;
            requestAnimationFrame(animate);

            // Animate stat counters
            const counters = document.querySelectorAll('.counter');
            counters.forEach((counter) => {
              const target = parseInt(counter.getAttribute('data-target'), 10);
              const counterDuration = 2000;
              let counterStart = null;

              const animateCounter = (ts) => {
                if (!counterStart) counterStart = ts;
                const prog = Math.min((ts - counterStart) / counterDuration, 1);
                counter.textContent = Math.floor(target * prog);
                if (prog < 1) {
                  requestAnimationFrame(animateCounter);
                }
              };
              requestAnimationFrame(animateCounter);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) observer.observe(statsSection);

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update yearsCount refs
  useEffect(() => {
    if (yearsCountRef.current) yearsCountRef.current.textContent = currentYear - 2016;
    if (yearsCount2Ref.current) yearsCount2Ref.current.textContent = currentYear - 2016;
    if (yearsCount1Ref.current) yearsCount1Ref.current.textContent = currentYear - 2016;
  }, [currentYear]);

  return (
    <>
      <div id="preloader">
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
                  <Link to="/" className="active">Home</Link>
                  <Link to="/about">About Us</Link>
                  <Link to="/services">Services</Link>
                  <Link to="/contact-us">Contact Us</Link>
                  <Link to="/contact-us#contact-form-section">Book a Consultance</Link>
                </div>
                <div className="nav-bottom-sociallinks">
                  <div className="social-links-nav">
                    <Link to="/login"><button>Login</button></Link>
                  </div>
                  <div className="menu-toggle">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                  </div>
                </div>
              </div>
            </nav>
          </header>
          <div className="responsive-nav-menu" id="responsiveNav">
            <Link to="/" className="active">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/services">Services</Link>
            <Link to="/contact-us">Contact Us</Link>
            <Link to="/contact-us#contact-form-section">Book a Consultance</Link>
          </div>
        </div>
        <section className="hero-section">
          <div className="content-left">
            <h1 className="main-heading">Grow With Expert Advice.</h1>
            <p className="description">
              HOBUCO Ltd established in the year 2016, is one of the multidisciplinary consulting firms in Rwanda that is goal oriented towards providing sustainable solutions to the challenges in the global consulting arena.
            </p>
            <div className="cta-buttons">
              <Link to="/login"><button className="btn btn-primary">Get Started</button></Link>
              <Link to="/about"><button className="btn btn-secondary">Learn More</button></Link>
            </div>
            <div className="services-section">
              <h3>Our Services:</h3>
              <div className="services-grid">
                <div className="service-card">
                  <div className="service-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div>Business Strategy</div>
                </div>
                <div className="service-card">
                  <div className="service-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div>Research and experimental</div>
                </div>
                <div className="service-card">
                  <div className="service-icon">
                    <i className="fa-building-columns fa-solid"></i>
                  </div>
                  <div>Institutional capacity building</div>
                </div>
                <div className="service-card">
                  <div className="service-icon">
                    <i className="fas fa-bullhorn"></i>
                  </div>
                  <div>Policy and strategy formulation</div>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-image-container">
              <div className="background-circle"></div>
              <div className="hero-image">
                <img alt="image" src="/images/Dr.Muhayimana-Fulgence.png" />
              </div>
              <div className="stat-card stat-main">
                <div className="stat-icon">
                  <i className="bxr bx-check" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div className="stat-info">
                  <h4>3k+</h4>
                  <p>cases solved<br />with satisfaction</p>
                </div>
              </div>
              <div className="stat-card experts-card">
                <h4>Our Experts</h4>
                <Link to="/about#team-section">
                  <div className="expert-avatars">
                    <div className="expert-avatar">
                      <img alt="" src="/images/chretien.jpg" />
                    </div>
                    <div className="expert-avatar">
                      <img alt="" src="/images/Dr.Muhayimana-Fulgence_B.png" />
                    </div>
                    <div className="expert-avatar">
                      <img alt="" src="/images/deputy.png" />
                    </div>
                    <div className="expert-avatar">2+</div>
                  </div>
                </Link>
              </div>
              <div className="chart-icon">
                <i className="bxr bx-chart-trend" style={{ fontSize: '1.5rem', color: '#015421' }}></i>
              </div>
            </div>
            <div className="floating-elements">
              <div className="floating-dot dot-1"></div>
              <div className="floating-dot dot-2"></div>
              <div className="floating-dot dot-3"></div>
            </div>
          </div>
        </section>
        <section className="services-content" id="services">
          <div className="section-header">
            <h2>Our Services</h2>
            <p>Comprehensive solutions tailored to your needs</p>
          </div>
          <div className="services-container">
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Business Strategy</h3>
              <p>Develop effective business strategies to achieve your goals and maximize growth potential.</p>
              <Link to="/about" className="service-link">Learn More <i className="fas fa-arrow-right"></i></Link>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Research and experimental</h3>
              <p>Research and experimental development in social sciences and humanities.</p>
              <Link to="/about" className="service-link">Learn More <i className="fas fa-arrow-right"></i></Link>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-money-bill-wave"></i>
              </div>
              <h3>Institutional capacity building</h3>
              <p>Institutional capacity building, internal systems strengthening.</p>
              <Link to="/about" className="service-link">Learn More <i className="fas fa-arrow-right"></i></Link>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-bullhorn"></i>
              </div>
              <h3>Policy and strategy formulation</h3>
              <p>Policy and strategy formulation, procedure manuals and policies development.</p>
              <Link to="/about" className="service-link">Learn More <i className="fas fa-arrow-right"></i></Link>
            </div>
            <div className="about-features">
              <div className="about-f-heading">
                <h3>More Services...</h3>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>
                  Baseline, midline and end-line evaluation for both private and public institutions.
                </span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>
                  Identification, design, appraisal, monitoring and evaluation of development projects.
                </span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>
                  Education support activities- development of training manuals.
                </span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>
                  Impact assessment surveneys, agroforestry and forestry, soil and water conservation engineering inclusive of land care projects.
                </span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>
                  Management consultancy activities, trainings.
                </span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>
                  Outcome harvesting/ Mapping.
                </span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>
                  Results based reporting.
                </span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>
                  Due diligence preparation.
                </span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>
                  Partner Capacity Assessment Survey (PCAS) tool.
                </span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>
                  Grant proposal development.
                </span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>
                  Support services to forestry.
                </span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>
                  Wholesale of agricultural raw materials and live animals.
                </span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>
                  Support services to forestry.
                </span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>
                  Wholesale of agricultural raw materials and live animals.
                </span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>
                  Other professional, scientific and technical activities.
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="why-choose-us-section">
          <div className="section-header">
            <h2>Why Choose Us</h2>
            <p>What sets us apart from the competition</p>
          </div>
          <div className="why-choose-container">
            <div className="why-choose-content">
              <div className="why-choose-item">
                <div className="why-choose-icon">
                  <i className="fas fa-handshake"></i>
                </div>
                <div className="why-choose-text">
                  <h3>Trusted Expertise</h3>
                  <p>With over <span id="yearsCount" ref={yearsCountRef}></span> years of industry experience, our consultants bring proven expertise to every project, ensuring reliable and effective solutions.</p>
                </div>
              </div>
              <div className="why-choose-item">
                <div className="why-choose-icon">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <div className="why-choose-text">
                  <h3>Innovative Approach</h3>
                  <p>We combine traditional consulting methods with innovative strategies to deliver cutting-edge solutions that keep your business ahead of the curve.</p>
                </div>
              </div>
              <div className="why-choose-item">
                <div className="why-choose-icon">
                  <i className="fas fa-chart-pie"></i>
                </div>
                <div className="why-choose-text">
                  <h3>Results-Driven</h3>
                  <p>Our focus is on delivering measurable results that directly impact your bottom line, with a proven track record of success across various industries.</p>
                </div>
              </div>
              <div className="why-choose-item">
                <div className="why-choose-icon">
                  <i className="fas fa-users-cog"></i>
                </div>
                <div className="why-choose-text">
                  <h3>Tailored Solutions</h3>
                  <p>We don't believe in one-size-fits-all approaches. Each solution is customized to address your specific business challenges and goals.</p>
                </div>
              </div>
            </div>
            <div className="why-choose-image">
              <img alt="Why Choose Us" src="/images/why-choose-us.jpg" />
              <div className="experience-badge">
                <span className="years"><span id="yearsCount2" ref={yearsCount2Ref}></span></span>
                <span className="text">Years of<br />Excellence</span>
              </div>
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
                <p>
                  Whereas our vision is to be a highly ethical and quality service provider to a vibrant private and/or public sector in Rwanda and abroad.
                </p>
              </div>
              <div className="mission-card">
                <div className="mission-icon">
                  <i className="fas fa-eye"></i>
                </div>
                <h3>Our Vision</h3>
                <p>
                  HOBUCO's mission statement is to provide a wide range of high-quality technical assistance and professional services essential for the development and implementation of viable business enterprises and development projects in a professional, timely and cost-effective manner.
                </p>
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
        <section className="about-section" id="about">
          <div className="about-container">
            <div className="about-content">
              <div className="section-header">
                <h2>About HOBUCO</h2>
                <p>Your trusted partner in business excellence</p>
              </div>
              <p>HOBUCO is a premier consultance firm dedicated to helping businesses achieve their full potential. With our team of experienced consultants, we provide tailored solutions to address your unique challenges.</p>
              <div className="about-features">
                <div className="feature">
                  <i className="fas fa-check-circle"></i>
                  <span><span id="yearsCount1" ref={yearsCount1Ref}></span> Years of Experience</span>
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
              </div>
              <Link to="/about" className="btn primary-btn">Learn More About Us</Link>
            </div>
          </div>
        </section>
        <section className="about-section" id="about" style={{ marginTop: '-5px' }}>
          <div className="about-container">
            <div className="about-content">
              <div className="section-header">
                <h2>OUR PARTNERS</h2>
                <p>Your trusted partners in business excellence</p>
              </div>
              <div className="about-features">
                <div className="feature">
                  <i className="fas fa-check-circle"></i>
                  <span>TerraFund for AFR100/ World Ressource Institute</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check-circle"></i>
                  <span>Commission Episcopale Justice et Paix- CEJP</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check-circle"></i>
                  <span>reNature Investments BV</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check-circle"></i>
                  <span>This SIDE Up</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="about-section" id="about" style={{ marginTop: '-5px' }}>
          <div className="about-container">
            <div className="about-content">
              <div className="section-header">
                <h2>OUR TEAM</h2>
                <p>Our Team Members</p>
              </div>
              <div className="member">
                <div className="member-img">
                  <img alt="" src="/images/Dr.Muhayimana-Fulgence_B.png" />
                </div>
                <div className="member-role">
                  <p>Managing Director</p>
                </div>
                <div className="member-name">
                  <p>Dr.Fulgence MPAYIMANA</p>
                </div>
                <div className="member-details">
                  <p>Rwanda, Kigali, Gasabo | + 250 788 696 388 | mfulgence2017@gmail.com</p>
                </div>
                <div className="member-description">
                  <p>
                    <b>Dr. Fulgence MPAYIMANA</b> holding a PhD in Rural Development, is a seasoned development professional with over 15 years of expertise in Project Cycle management, Rural Development, Policy and Strategy formulation, Public Policy Analysis, Advocacy, NGOs Management, Climate Justice, Gender Mainstreaming, Youth and women's empowerment within the NGO Sector across Rwanda. His expertise extends to collaborating with national and International NGOs to impact the lives of vulnerable populations, particularly women and girls, across humanitarian and developmental contexts. Known for his adept leadership in fundraising, program management, and fostering gender equality, Dr. MPAYIMANA has a proven track record of achieving targeted outcomes and mobilizing resources effectively.
                  </p>
                  <p>
                    Notably, his experience spans various sectors including poverty reduction, child protection, gender promotion, youth empowerment and community development. His consultancy work with renowned organizations underscores his versatility and commitment to driving impactful change. Dr. MPAYIMANA's dedication and expertise make him an invaluable asset in any developmental endeavor related to social science and humanities. He successfully completed various assignments with organizations such as Commission Justice et Paix-CJEP, Rural Development Inter-Diocesan Services (RDIS), CRS, COCOF, CECI, PIASS, LODA, World Vision Rwanda, DUHOZANYE, AJPRODHO – JIJUKIRWA, COCOF, OXFAM Rwanda, NAEB, JESUIT URUMURI Centre, Plan International Rwanda among others.
                  </p>
                </div>
              </div>
              <div className="member">
                <div className="member-img">
                  <img alt="" src="/images/deputy.png" />
                </div>
                <div className="member-role">
                  <p>Deputy Managing Director</p>
                </div>
                <div className="member-name">
                  <p>François Hakorimana</p>
                </div>
                <div className="member-details">
                  <p>Rwanda, Kigali, Gasabo | + 250 788 696 388 | françoishakorimana@gmail.com</p>
                </div>
                <div className="member-description">
                  <p>
                    Is an environmental management specialist with over 10 years of experience in biodiversity conservation, land restoration, and climate resilience. Currently, he serves as the National Biodiversity Specialist at Enabel Rwanda, where he leads projects focused on enhancing community-based biodiversity conservation and reducing vulnerability to climate change in the Eastern Province. His expertise extends to landscape restoration and water management, having worked as a Water Management Officer for Rwanda's Ministry of Agriculture, where he supervised watershed and irrigation projects. François also spent three years as the Landscapes Manager at the Albertine Rift Conservation Society (ARCOS), where he led projects that built climate resilience and promoted sustainable livelihoods across Rwanda's Agro-ecosystems.
                  </p>
                  <p>
                    François holds an MSc in International Land and Water Management from Wageningen University and a MSc in Environmental Information Systems. He spent three years as a part-time lecturer at the University of Lay Adventists of Kigali, teaching Soil and Conservation, and integrating hands-on fieldwork into the curriculum. His research has focused on water efficiency in Tanzania and traditional irrigation practices in Spain. He is certified in project management, GIS, and environmental management, and has provided consultancy services as a data analyst for Africa Restoration Projects. Dedicated to promoting biodiversity, climate resilience, and sustainable development, I leverage my expertise in GIS, data analysis, and focuses on delivering community-centered, practical solutions to environmental challenges in Rwanda and beyond.
                  </p>
                </div>
              </div>
              <div className="see-more-team-members">
                <Link to="/about#team-section"><button className="btn btn-primary">See More Team Members</button></Link>
              </div>
            </div>
          </div>
        </section>
        <section className="testimonials-section">
          <div className="section-header">
            <h2>What Our Clients Say</h2>
            <p>Success stories from businesses we've helped</p>
          </div>
          <div className="testimonials-container">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <i className="fas fa-quote-left"></i>
                <p>HOBUCO's strategic guidance transformed our business operations and helped us increase revenue by 40% within six months.</p>
              </div>
              <div className="testimonial-author">
                <img alt="Client" src="/images/sanyu.jpg" />
                <div className="author-info">
                  <h4>Sanyu Rebecca</h4>
                  <p>BK Accountant</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <i className="fas fa-quote-left"></i>
                <p>The marketing strategy developed by HOBUCO helped us reach new markets and establish our brand as an industry leader.</p>
              </div>
              <div className="testimonial-author">
                <img alt="Client" src="/images/saano.jpg" />
                <div className="author-info">
                  <h4>Saano Patient</h4>
                  <p>IceWay Producer | Manager</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <i className="fas fa-quote-left"></i>
                <p>Working with HOBUCO was a game-changer for our startup. Their financial advisory services helped us secure crucial funding.</p>
              </div>
              <div className="testimonial-author">
                <img alt="Client" src="/images/chretien.jpg" />
                <div className="author-info">
                  <h4>Mugisha Chretien</h4>
                  <p>CEO, IceTech Solutions</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="stats-section">
          <div className="stats-container">
            <div className="stat-item">
              <i className="fas fa-users"></i>
              <h3><span className="counter" data-target="500">0</span>+</h3>
              <p>Satisfied Clients</p>
            </div>
            <div className="stat-item">
              <i className="fas fa-project-diagram"></i>
              <h3><span className="counter" data-target="750">0</span>+</h3>
              <p>Projects Completed</p>
            </div>
            <div className="stat-item">
              <i className="fas fa-award"></i>
              <h3><span className="counter" data-target="5">0</span>+</h3>
              <p>Industry Awards</p>
            </div>
            <div className="stat-item">
              <i className="bxr bx-history"></i>
              <h3><span className="counter" data-target="2016">0</span></h3>
              <p>Consulting Since</p>
            </div>
          </div>
        </section>
        <section className="cta-section">
          <div className="cta-container">
            <h2>Ready to Transform Your Business?</h2>
            <p>Schedule a free consultance with our experts today</p>
            <div className="cta-buttons">
              <Link to="/contact-us#contact-form-section" className="btn primary-btn">Book a Consultance</Link>
              <Link to="/contact-us" className="btn outline-btn">Contact Us</Link>
            </div>
          </div>
        </section>
        <section className="contact-section" id="contact">
          <div className="section-header">
            <h2>Get In Touch</h2>
            <p>We're here to answer your questions</p>
          </div>
          <div className="contact-container">
            <div className="contact-info">
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h3>Office Location</h3>
                  <p>Muhanga District, Rwanda</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <div>
                  <h3>Phone Number</h3>
                  <p>+250 788 696 388 & +250 788 213 984</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <h3>Email Address</h3>
                  <p>hobucoltd2050@gmail.com</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-clock"></i>
                <div>
                  <h3>Working Hours</h3>
                  <p>Mon - Fri: 8:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <form onSubmit={handleSubmit}>
                {formStatus === 'success' && (
                  <p style={{ color: 'green', marginBottom: '10px' }}>Your consultation request has been submitted successfully!</p>
                )}
                {formStatus === 'error' && (
                  <p style={{ color: 'red', marginBottom: '10px' }}>Something went wrong. Please try again.</p>
                )}
                <div className="form-combined">
                  <div className="form-group">
                    <input placeholder="First Name" name="firstName" required value={formData.firstName} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <input placeholder="Last Name" name="lastName" required value={formData.lastName} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-combined">
                  <div className="form-group">
                    <input placeholder="Your Email" name="email" required type="email" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <input placeholder="Phone Number" name="phone" required type="number" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-combined">
                  <div className="form-group">
                    <input placeholder="Company / Organization" name="companyOrg" required value={formData.companyOrg} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <select name="subject" value={formData.subject} onChange={handleChange}>
                      <option value="">Select Subject</option>
                      <option value="Consultation">Consultation</option>
                      <option value="Proposal">Proposal</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Help">Help</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <select id="service" name="service" required value={formData.service} onChange={handleChange}>
                    <option value="">Select a Service</option>
                    <option value="Research">Research</option>
                    <option value="Business-Strategy">Business Strategy</option>
                    <option value="Capacity-Building">Capacity Building</option>
                    <option value="Policy-Formulation">Policy Formulation</option>
                    <option value="Monitoring-and-Evaluation">Monitoring and Evaluation</option>
                    <option value="Project-Management">Project Management</option>
                    <option value="Training">Training</option>
                    <option value="Organizational-Development">Organizational Development</option>
                    <option value="Environmental-and-Social-Assessment">Environmental and Social Assessment</option>
                    <option value="Data-Management">Data Management</option>
                    <option value="Proposal-Development">Proposal Development</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <textarea name="message" placeholder="Tell us about your project, challenges, or how we can help you..." required value={formData.message} onChange={handleChange}></textarea>
                </div>
                <button className="btn primary-btn" type="submit">Send Message</button>
              </form>
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
                <button type="button"><i className="fas fa-paper-plane"></i></button>
              </form>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 HOBUCO Consultance Services. All Rights Reserved.</p>
          </div>
        </footer>
        <button
          id="scrollToTopBtn"
          title="Go to top"
          onClick={scrollToTop}
          style={{ display: showScrollTop ? 'block' : 'none' }}
        >
          <i className="bxr bx-arrow-to-top-stroke"></i>
        </button>
        <div className="whatsapp-float" id="whatsappFloat">
          <a href="https://wa.me/250788696388?text=Hello%20there%2C%20I%20need%20assistance%20with%20your%20services." target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
            <i className="fab fa-whatsapp"></i>
          </a>
          <div className="whatsapp-tooltip">Need help? Chat with us!</div>
        </div>
        <div className="mobile-overlay" id="mobileOverlay"></div>
      </div>
    </>
  );
};

export default Home;

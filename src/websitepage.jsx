import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Film, 
  ArrowRight, 
  Menu, 
  X, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Globe, 
  Zap, 
  Layout, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  ArrowUp,
  Mail,
  Lightbulb,
  MonitorPlay,
  Mic,
  ExternalLink,
  Clock
} from 'lucide-react';

// --- 1. PRELOADER COMPONENT ---
const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsVisible(false), 800); 
          setTimeout(onComplete, 1600); 
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 1; 
      });
    }, 100);
    return () => clearInterval(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] ${progress === 100 ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="relative">
        <span className="text-[12rem] md:text-[20rem] font-black text-neutral-900 tabular-nums leading-none select-none">
          {Math.min(progress, 100)}
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="text-xl md:text-3xl font-bold text-yellow-400 tracking-[0.5em] uppercase mix-blend-difference animate-pulse">
             CreativeFlic
           </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-yellow-400 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
    </div>
  );
};

// --- 2. CANVAS PARTICLE SYSTEM ---
const useParticleEffect = (canvasRef) => {
  const mouse = useRef({ x: undefined, y: undefined, radius: 150 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    class Particle {
      constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.vx = (Math.random() * 1) - 0.5;
        this.vy = (Math.random() * 1) - 0.5;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      
      update() {
        if (mouse.current.x !== undefined && mouse.current.y !== undefined) {
            let dx = mouse.current.x - this.x;
            let dy = mouse.current.y - this.y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < mouse.current.radius) {
                const maxDistance = mouse.current.radius;
                const force = (maxDistance - distance) / maxDistance;
                const directionX = (dx / distance) * force * 5; 
                const directionY = (dy / distance) * force * 5;
                
                this.x -= directionX;
                this.y -= directionY;
            }
        }
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        this.draw();
      }
    }

    const init = () => {
      particles = [];
      const area = canvas.width * canvas.height; 
      const numberOfParticles = Math.min(area / 9000, 150); 
      
      for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1; 
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let color = Math.random() > 0.5 ? 'rgba(250, 204, 21, 0.9)' : 'rgba(255, 255, 255, 0.8)';
        particles.push(new Particle(x, y, size, color));
      }
    };

    const resize = () => {
      const parent = canvas?.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        init();
      }
    };

    window.addEventListener('resize', resize);
    
    const handleMouseMove = (e) => {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mouse.current.x = e.clientX - rect.left;
        mouse.current.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
        mouse.current.x = undefined;
        mouse.current.y = undefined;
    }

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    resize();
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (canvas) {
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasRef]);
};

// --- WRAPPER COMPONENTS ---
const ParticleHeader = () => {
  const canvasRef = useRef(null);
  useParticleEffect(canvasRef);
  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40 w-full h-full" />;
};

const BigIdeaParticles = () => {
  const canvasRef = useRef(null);
  useParticleEffect(canvasRef);
  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-100 w-full h-full" />;
};


// --- 3. SUCCESS OVERLAY COMPONENT ---
const SuccessOverlay = ({ isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center transition-opacity duration-700 animate-in fade-in">
             <div className="text-center max-w-4xl px-6">
                <Reveal delay={0}>
                    <CheckCircle size={80} className="text-yellow-400 mx-auto mb-8 animate-pulse-slow glow-yellow" />
                </Reveal>
                
                <Reveal delay={100}>
                    <h2 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter">
                        BRIEF RECEIVED!
                    </h2>
                </Reveal>

                <Reveal delay={300}>
                    <div className="inline-flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-xl glow-blue">
                        <Clock size={24} />
                        <span className="uppercase tracking-wide">Next steps in 48 hours</span>
                    </div>
                </Reveal>
                
                <Reveal delay={500}>
                    <p className="mt-8 text-neutral-400 text-xl max-w-xl mx-auto">
                        Thank you for reaching out. We are reviewing your project details now and will contact you directly within two business days.
                    </p>
                </Reveal>

                <Reveal delay={700}>
                    <button 
                        onClick={onClose} 
                        className="mt-12 px-8 py-3 border border-white/20 text-white hover:border-yellow-400 hover:text-yellow-400 transition-colors duration-300 uppercase tracking-widest font-bold text-sm rounded-sm"
                    >
                        Return to Site
                    </button>
                </Reveal>
            </div>
        </div>
    );
}


// --- 4. REVEAL ANIMATION ---
const Reveal = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] transform ${
        isVisible 
          ? 'opacity-100 translate-y-0 rotate-0 skew-y-0 clip-path-full' 
          : 'opacity-0 translate-y-24 rotate-1 skew-y-3'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- 5. SUB-COMPONENTS ---

const ProjectCard = ({ category, title, color, tags, results, role, link }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / 20;
    const y = -(e.clientX - rect.left - rect.width / 2) / 20;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div 
      className="group relative perspective-1000 h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="relative bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden h-full transition-all duration-200 ease-out hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,1)] hover:border-neutral-700 hover:glow-white"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`,
        }}
      >
        <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-10 rounded-bl-[100px] transition-all duration-500 group-hover:scale-150`}></div>
        
        <div className="p-8 flex flex-col h-full relative z-10" style={{ transform: 'translateZ(20px)' }}>
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-300 mb-4 w-fit">
            {category}
          </span>
          
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-neutral-500 mb-6 font-mono">{role}</p>
          
          <div className="space-y-2 mb-8 flex-grow">
            {results && results.map((result, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                <TrendingUp size={14} className="text-green-500 mt-0.5 shrink-0" />
                {result}
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {tags && tags.slice(0, 3).map((tag, i) => (
                 <span key={i} className="text-[10px] uppercase font-bold px-2 py-1 bg-neutral-800 text-neutral-400 rounded-sm border border-neutral-700">
                   {tag}
                 </span>
              ))}
            </div>
            
            {link ? (
              <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-white uppercase tracking-wider transition-colors mt-auto group/link">
                View <ExternalLink size={12} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
              </a>
            ) : (
               <span className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 uppercase tracking-wider transition-colors mt-auto cursor-help" title="Confidential Client">
                 Private <Award size={12} />
               </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceOptions = [
  'YouTube Strategy & Growth',
  'Direct Response VSL/Ads',
  'B2B/SaaS Explainer Videos',
  'Social Media Content (Shorts/Reels)',
  'Full Content Audit/Consultation',
  'Other'
];

// --- 6. CONTACT FORM COMPONENT ---
const ContactForm = ({ brandYellow, onSuccess }) => {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyfpxNdT5sPtoIK_E0q6CUtIHQ3be2pp7XUBWIo61omRUVCm1PkQHt3w5sYkpeEl3V-g/exec';

  const [formData, setFormData] = useState({
    NAME: '',
    EMAIL: '',
    Service_Type: ServiceOptions[0],
    Message: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorStatus(false);
  };

  const validateForm = () => {
    if (!formData.NAME.trim()) return false;
    if (!formData.EMAIL.trim() || !/^\S+@\S+\.\S+$/.test(formData.EMAIL)) return false;
    if (!formData.Message.trim()) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
        alert("Please fill in all fields correctly.");
        return;
    }

    setLoading(true);
    setErrorStatus(false);

    const dataToSend = new FormData();
    dataToSend.append('DATE', new Date().toLocaleString());
    dataToSend.append('NAME', formData.NAME);
    dataToSend.append('EMAIL', formData.EMAIL);
    dataToSend.append('Service_Type', formData.Service_Type);
    dataToSend.append('Message', formData.Message);

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: dataToSend,
        mode: 'no-cors' 
      });

      onSuccess();
      setFormData({ NAME: '', EMAIL: '', Service_Type: ServiceOptions[0], Message: '' });
      
    } catch (error) {
      setErrorStatus(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-neutral-900/80 p-8 md:p-12 rounded-[2rem] border border-neutral-800 shadow-2xl relative overflow-hidden backdrop-blur-md glow-blue">
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[60px] animate-pulse"></div>
      
      <div className="text-center mb-8 relative z-10">
        <h3 className="text-3xl font-bold text-white mb-3">Start Your Project</h3>
        <p className="text-neutral-400">Fill out the form below and we'll get back to you within 24 hours.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Name / Company</label>
            <input
              type="text"
              name="NAME"
              value={formData.NAME}
              onChange={handleChange}
              placeholder="Ex: CreativeFlic Studio"
              required
              className="w-full p-4 bg-black/50 border border-neutral-800 rounded-lg text-white placeholder-neutral-700 focus:ring-1 focus:ring-yellow-400 outline-none transition-all focus:bg-black/80"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Email Address</label>
            <input
              type="email"
              name="EMAIL"
              value={formData.EMAIL}
              onChange={handleChange}
              placeholder="Ex: contact@example.com"
              required
              className="w-full p-4 bg-black/50 border border-neutral-800 rounded-lg text-white placeholder-neutral-700 focus:ring-1 focus:ring-yellow-400 outline-none transition-all focus:bg-black/80"
            />
          </div>
        </div>

        <div className="space-y-2">
           <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Service Required</label>
           <div className="relative">
            <select
              name="Service_Type"
              value={formData.Service_Type}
              onChange={handleChange}
              required
              className="w-full p-4 bg-black/50 border border-neutral-800 rounded-lg text-white focus:ring-1 focus:ring-yellow-400 outline-none transition-all focus:bg-black/80 appearance-none cursor-pointer"
            >
              {ServiceOptions.map(option => (
                <option key={option} value={option} className="bg-neutral-900 text-white">
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Project Details</label>
           <textarea
            name="Message"
            value={formData.Message}
            onChange={handleChange}
            placeholder="Tell us about your goals, timeline, and estimated budget..."
            rows="5"
            required
            className="w-full p-4 bg-black/50 border border-neutral-800 rounded-lg text-white placeholder-neutral-700 focus:ring-1 focus:ring-yellow-400 outline-none resize-none transition-all focus:bg-black/80"
           />
        </div>

        {errorStatus && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <X className="text-red-500 shrink-0" size={20} />
            <p className="text-red-200 text-sm">Something went wrong. Please try again or email us directly.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 ${brandYellow} text-black font-black text-lg rounded-lg hover:bg-white transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-2 transform active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'shadow-xl shadow-yellow-400/20 hover:shadow-yellow-400/40 hover:-translate-y-1 glow-yellow'}`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></span>
              <span>Sending...</span>
            </div>
          ) : (
            <>
              SEND PROJECT BRIEF <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// --- 7. MAIN APPLICATION COMPONENT ---

const App = () => {
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false); 
  
  const brandYellow = "bg-yellow-400";
  const textYellow = "text-yellow-400";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSuccess = () => {
    setShowSuccessOverlay(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // > Spotlight Effect Logic for Service Cards
  const handleSpotlightMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
  };

  const caseStudies = [
    { title: "500% Channel Growth: Transforming Niche Documentaries", category: "Documentary Growth", role: "Editor + Story Producer", results: ["Channel grew 5x in subs", "Stabilized 200k–300k avg views", "Multiple videos hit 1M+ views"], link: "https://www.youtube.com/watch?v=9aI0OzNuIKY", color: "bg-neutral-900", tags: ["Storytelling", "Branding", "Retention"] },
    { title: "Accelerated Authority: Driving 100K+ Subscribers", category: "Automotive Commentary", role: "Lead Editor + Strategist", results: ["Surpassed 100k subscribers", "Multiple videos reached 1M+", "Built short-form systems"], link: "https://www.youtube.com/watch?v=gVTPybaN1ro", color: "bg-blue-600", tags: ["Pacing", "Trend Optimization", "Systems"] },
    { title: "$5.5M in Annual Revenue: Conversion-First Video Strategy", category: "Health & Wellness", role: "VSL + Ad Editor", results: ["Scaled to $5.5M annual revenue", "Improved ad ROI by 5x", "Conversion-focused VSLs"], link: "https://www.amazon.com/SciatiEase-Sciatic-Nerve-Health-Support/dp/B0B5723XX5", color: "bg-yellow-400", tags: ["Conversion", "VSL", "Ads"] },
    { title: "Inbound Authority: Simplifying Complex AI", category: "SaaS / B2B", role: "Content Editor", results: ["Strengthened inbound authority", "Scalable faceless pipeline", "Simplified AI concepts"], link: "https://www.salesforge.ai/", color: "bg-blue-600", tags: ["SaaS", "Education", "Shorts"] },
    { title: "Consistent Virality: Scaling Personal Brand Reach", category: "Personal Brand", role: "Growth Strategist", results: ["Scaled to 50k+ followers", "Consistent virality", "High-energy storytelling"], link: "https://www.instagram.com/asonjf/", color: "bg-yellow-400", tags: ["Reels", "Social Growth", "Editing"] },
    { title: "Broadcast Excellence: Streamlining End-to-End TV Delivery", category: "Television", role: "End to End Strategist", results: ["Streamlined TV delivery", "Broadcast-level quality", "Multi-camera editing"], link: null, color: "bg-neutral-900", tags: ["Broadcast", "TV", "Pipeline"] },
    { title: "Educational Clarity: Mastering Narrative Structure", category: "Education", role: "Narrative Editor", results: ["Stronger viewer engagement", "Clearer educational delivery", "Pacing & Structure"], link: null, color: "bg-blue-600", tags: ["Education", "Narrative", "Long-form"] }
  ];

  const visibleProjects = showAllProjects ? caseStudies : caseStudies.slice(0, 6);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-400 selection:text-black overflow-x-hidden">
      
      {/* 1. Cinematic Preloader */}
      <Preloader onComplete={() => setLoading(false)} />
      
      {/* 2. Success Overlay */}
      <SuccessOverlay 
        isVisible={showSuccessOverlay} 
        onClose={() => setShowSuccessOverlay(false)} 
      />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Space Grotesk', sans-serif; }
        .clip-path-full { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
        .perspective-1000 { perspective: 1000px; }
        .rotate-x-2 { transform: rotateX(2deg); }
        .animate-marquee { animation: marquee 20s linear infinite; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        /* Glitch effect for logo text */
        @keyframes glitch {
          0% { text-shadow: 2px 0 red, -2px 0 blue; }
          25% { text-shadow: -2px 0 yellow, 2px 0 blue; }
          50% { text-shadow: 1px 0 green, -1px 0 yellow; }
          75% { text-shadow: -1px 0 red, 1px 0 blue; }
          100% { text-shadow: 0 0 transparent; }
        }
        .logo-glitch-hover:hover .logo-text {
            animation: glitch 0.5s infinite steps(2, end);
        }
        /* Glow effect styles */
        .glow-white {
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.2), 0 0 20px rgba(255, 255, 255, 0.1);
            transition: box-shadow 0.3s ease-in-out;
        }
        .hover\\:glow-white:hover {
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.2);
        }
        .glow-blue {
            box-shadow: 0 0 10px rgba(0, 150, 255, 0.3), 0 0 20px rgba(0, 150, 255, 0.15);
            transition: box-shadow 0.3s ease-in-out;
        }
        .hover\\:glow-blue:hover {
            box-shadow: 0 0 15px rgba(0, 150, 255, 0.5), 0 0 30px rgba(0, 150, 255, 0.3);
        }
        .glow-yellow {
            box-shadow: 0 0 10px rgba(250, 204, 21, 0.4), 0 0 20px rgba(250, 204, 21, 0.2);
            transition: box-shadow 0.3s ease-in-out;
        }
        /* Spotlight Effect CSS */
        .spotlight-card {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }
        .spotlight-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle 600px at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(59, 130, 246, 0.15),
            transparent 80%
          );
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
          z-index: 1;
        }
        .spotlight-card:hover::before {
          opacity: 1;
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed w-full z-40 transition-all duration-500 ${isScrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo Representation (Updated with Glitch Hover) */}
          <div className="text-2xl font-bold tracking-tighter flex items-center gap-2 cursor-pointer group logo-glitch-hover" onClick={() => scrollToSection('home')}>
            <div className={`w-10 h-10 ${brandYellow} rounded-sm flex items-center justify-center transform rotate-45 group-hover:rotate-0 transition-transform duration-500 hover:scale-110`}>
              <div className="transform -rotate-45 group-hover:rotate-0 transition-transform duration-500 font-black text-black text-lg leading-none">
                CF
              </div>
            </div>
            <span className="ml-2 group-hover:text-white transition-colors logo-text">CREATIVE<span className="text-blue-500">FLIC</span></span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10 text-sm font-bold tracking-widest uppercase">
            {['Work', 'Services', 'Process'].map((item) => (
              <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="hover:text-yellow-400 transition-colors relative group hover:glow-yellow">
                <span className="relative z-10">{item}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
            <button 
              onClick={() => scrollToSection('contact')} 
              className={`px-8 py-3 bg-white text-black hover:bg-yellow-400 transition-colors duration-300 font-black tracking-widest hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] rounded-sm`}
            >
              Start Project
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden z-50 p-2" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="text-white" /> : <Menu className="text-white" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 bg-black z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-500 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           {['Work', 'Services', 'Process', 'Contact'].map((item) => (
             <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-4xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500 hover:to-yellow-400 transition-colors">
               {item}
             </button>
           ))}
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <ParticleHeader />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-900 bg-blue-900/30 text-blue-300 text-xs font-bold uppercase tracking-widest mb-8 hover:bg-blue-900/50 transition-colors duration-300 glow-blue">
              <Globe size={12} className="animate-spin-slow" /> Serving International Brands
            </div>
          </Reveal>
          
          <Reveal delay={100}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.95] mix-blend-difference">
              SCALE YOUR BRAND <br />
              WITH <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-400 to-white">STRATEGIC CONTENT</span>
            </h1>
          </Reveal>
          
          <Reveal delay={200}>
            <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              We don't just edit videos. We provide end-to-end content strategy, design, and production to skyrocket your <span className="text-white font-bold">Sales, Leads, and Brand Identity.</span>
            </p>
          </Reveal>
          
          <Reveal delay={300}>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button onClick={() => scrollToSection('contact')} className={`px-8 py-4 ${brandYellow} text-black font-black rounded hover:bg-white transition-all duration-300 flex items-center gap-2 uppercase tracking-wide group shadow-lg shadow-yellow-400/30 active:scale-95 glow-yellow`}>
                Get Free Consultation
                <Zap size={18} className="fill-black group-hover:scale-110 transition-transform" />
              </button>
              <button onClick={() => scrollToSection('work')} className="px-8 py-4 border border-neutral-700 hover:border-blue-500 text-neutral-300 hover:text-blue-400 transition-all duration-300 uppercase tracking-wide font-bold transform hover:scale-105 active:scale-95 hover:glow-white">
                View Case Studies
              </button>
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
          <ArrowRight className="rotate-90 text-blue-500" />
        </div>
      </section>

      {/* INFINITE TICKER */}
      <div className="border-y border-white/5 bg-neutral-900/30 backdrop-blur-sm overflow-hidden">
        <div className="animate-marquee whitespace-nowrap py-6 flex gap-12 text-neutral-500 font-bold uppercase text-xs tracking-[0.2em]">
           {[...Array(10)].map((_, i) => (
             <span key={i} className="flex items-center gap-4">
               <Zap size={12} className="text-yellow-400" /> 50M+ Views Generated <span className="text-neutral-800">|</span> 
               <Zap size={12} className="text-blue-500" /> $5M+ Client Revenue <span className="text-neutral-800">|</span>
             </span>
           ))}
        </div>
      </div>

      {/* WORK SECTION */}
      <section id="work" className="py-24 bg-neutral-950 border-t border-neutral-900">
        <div className="container mx-auto px-6">
          <Reveal>
            <div className="flex flex-col md:flex-row items-start justify-between mb-12 gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-2">Proven Results</h2>
                <p className="text-neutral-500 max-w-xl">
                  Real case studies. Real ROI. From faceless YouTube channels to multi-million dollar Amazon brands.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleProjects.map((project, index) => (
              <Reveal key={index} delay={index * 100}>
                <ProjectCard {...project} />
              </Reveal>
            ))}
          </div>

          {!showAllProjects && caseStudies.length > 6 && (
             <Reveal delay={200}>
               <div className="mt-12 text-center">
                 <button 
                   onClick={() => setShowAllProjects(true)}
                   className="px-8 py-4 border border-neutral-700 hover:border-blue-500 text-white hover:text-blue-400 transition-all duration-300 uppercase tracking-wide font-bold hover:scale-105 active:scale-95 hover:glow-white"
                 >
                   View All {caseStudies.length} Case Studies
                 </button>
               </div>
             </Reveal>
          )}
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-y-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 w-1/3 h-full bg-blue-900/20 transform -skew-x-12 opacity-50 animate-pulse-slow origin-top-left -left-10"></div>
            <div className="absolute top-0 w-1/3 h-full bg-yellow-400/10 transform skew-x-12 opacity-50 animate-pulse-slow origin-top-right right-0 transition-opacity duration-1000" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className={`${textYellow} font-bold uppercase tracking-widest mb-4 text-sm`}>Our Ecosystem</h2>
              <h3 className="text-4xl md:text-5xl font-bold mb-6">End-to-End Brand Growth.</h3>
              <p className="text-neutral-400">
                We move beyond simple execution. We partner with international brands to handle the entire content lifecycle from the first spark of an idea to the final conversion.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            <Reveal delay={0} className="h-full">
              <div 
                className="p-8 border border-neutral-800 bg-neutral-900/40 rounded-2xl h-full transition-all duration-300 hover:-translate-y-2 group spotlight-card"
                onMouseMove={handleSpotlightMove}
              >
                <div className="w-14 h-14 bg-blue-900/20 rounded-xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 glow-blue">
                  <Lightbulb size={28} />
                </div>
                <h4 className="text-xl font-bold mb-4 text-white relative z-10">Strategy & Ideation</h4>
                <ul className="space-y-3 text-neutral-400 text-sm relative z-10">
                  {['Content Consultation', 'Brand Positioning', 'Scripting & Storyboarding', 'Market Research'].map((item, i) => (
                     <li key={i} className="flex items-start gap-2 group/item">
                       <span className="text-blue-500 mt-1 group-hover/item:text-blue-400 transition-colors">●</span> {item}
                     </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={100} className="h-full">
              <div 
                className="p-8 border border-blue-900/50 bg-blue-950/20 rounded-2xl shadow-2xl shadow-blue-900/10 h-full relative overflow-hidden transition-all duration-300 hover:-translate-y-2 group spotlight-card"
                onMouseMove={handleSpotlightMove}
              >
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 text-white shadow-lg shadow-blue-600/30 group-hover:rotate-6 transition-transform duration-300 glow-blue relative z-10">
                  <Film size={28} />
                </div>
                <h4 className="text-xl font-bold mb-4 text-white relative z-10">Production & Editing</h4>
                <ul className="space-y-3 text-neutral-300 text-sm relative z-10">
                   {['High-End Video Editing', 'Motion Graphics & VFX', 'Professional Voiceover', 'Color Grading & Sound'].map((item, i) => (
                     <li key={i} className="flex items-start gap-2 group/item">
                       <span className="text-yellow-400 mt-1 group-hover/item:text-white transition-colors">●</span> {item}
                     </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={200} className="h-full">
              <div 
                className="p-8 border border-neutral-800 bg-neutral-900/40 rounded-2xl h-full transition-all duration-300 hover:-translate-y-2 group spotlight-card"
                onMouseMove={handleSpotlightMove}
              >
                <div className="w-14 h-14 bg-blue-900/20 rounded-xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 glow-blue">
                  <Layout size={28} />
                </div>
                <h4 className="text-xl font-bold mb-4 text-white relative z-10">Design & Experience</h4>
                <ul className="space-y-3 text-neutral-400 text-sm relative z-10">
                   {['UI/UX Design', 'High-CTR Thumbnails', 'Brand Identity Systems', 'Social Media Assets'].map((item, i) => (
                     <li key={i} className="flex items-start gap-2 group/item">
                       <span className="text-blue-500 mt-1 group-hover/item:text-blue-400 transition-colors">●</span> {item}
                     </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section id="process" className="py-24 bg-black relative">
        <div className="container mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold mb-4">Seamless Remote Collaboration</h2>
               <p className="text-neutral-400 max-w-2xl mx-auto">
                 We've optimized our workflow for international time zones. No matter where you are, our team acts as your dedicated in-house content engine.
               </p>
            </div>
          </Reveal>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-center mb-20">
             {[
               { title: 'Discovery', icon: <Mic />, desc: 'Virtual Consultation' },
               { title: 'Strategy', icon: <Lightbulb />, desc: 'Blueprint Creation' },
               { title: 'Production', icon: <MonitorPlay />, desc: 'Execution Phase' },
               { title: 'Growth', icon: <TrendingUp />, desc: 'Optimize & Scale' },
             ].map((step, i) => (
               <Reveal key={i} delay={i * 100}>
                 <div className="p-6 bg-neutral-900 border border-neutral-800 hover:border-blue-500 transition-all duration-300 rounded-xl group hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-900/10 h-full hover:glow-white">
                   <div className="w-16 h-16 mx-auto bg-black rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-all duration-300 text-white group-hover:scale-110 shadow-inner group-hover:shadow-lg">
                     {step.icon}
                   </div>
                   <h4 className="font-bold text-xl group-hover:text-blue-400 transition-colors">{i + 1}. {step.title}</h4>
                   <p className="text-sm text-neutral-500 mt-2 group-hover:text-neutral-400 transition-colors">{step.desc}</p>
                 </div>
               </Reveal>
             ))}
          </div>

          {/* LOOM VIDEO PLACEHOLDER */}
          <Reveal delay={200}>
             <div className="w-full max-w-5xl mx-auto aspect-video rounded-3xl overflow-hidden relative group border border-neutral-800 bg-neutral-900 shadow-2xl hover:border-blue-500/50 transition-all duration-500 hover:glow-white">
               <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                 <button 
                    className="w-24 h-24 rounded-full bg-yellow-400 text-black flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-[0_0_40px_rgba(250,204,21,0.4)] pointer-events-auto"
                    aria-label="Play workflow video"
                 >
                   <Play size={32} fill="black" />
                 </button>
               </div>
               
               <div 
                 className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700 bg-[url('https://images.unsplash.com/photo-1626544827763-d516dce335ca?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 group-hover:scale-100 transition-transform duration-1000"
                 role="img"
                 aria-label="CreativeFlic Workflow Video Thumbnail"
               ></div>
               
               <div className="absolute bottom-8 left-8 z-20">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white mb-2">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Process Breakdown
                 </div>
                 <h4 className="text-2xl font-bold text-white">The CreativeFlic Workflow</h4>
                 <p className="text-neutral-300 text-sm mt-1">See how we manage international pipelines from Lahore to the World.</p>
               </div>
             </div>
           </Reveal>
        </div>
      </section>
      
      {/* NEW: HIGH CONTRAST BLUE CALL TO ACTION SCREEN */}
      <section id="big-idea" className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-blue-600 py-32 border-y-4 border-black glow-blue">
         <BigIdeaParticles />
         
         <div className="container mx-auto px-6 relative z-10 text-center">
           <Reveal delay={0}>
             <h2 className="text-xl md:text-3xl font-bold uppercase tracking-wider text-white mb-6">
                IS YOUR BIG IDEA READY TO GO WILD?
             </h2>
           </Reveal>
           <Reveal delay={150}>
             <h3 className="text-5xl md:text-8xl lg:text-9xl font-black text-white leading-none tracking-tighter mb-10">
               Let's work <br/> together!
             </h3>
           </Reveal>
           <Reveal delay={300}>
              <button onClick={() => scrollToSection('contact')} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black bg-white px-8 py-4 rounded-full shadow-xl hover:scale-105 active:scale-95 glow-white">
                LET'S TALK <ArrowRight size={18} />
              </button>
           </Reveal>
         </div>
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
           <button onClick={() => scrollToSection('contact')} className="text-white text-xs font-bold uppercase tracking-widest flex flex-col items-center group">
             CONTINUE TO CONTACT
             <ArrowRight className="rotate-90 mt-2 group-hover:translate-y-1 transition-transform" size={16}/>
           </button>
         </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-32 relative overflow-hidden bg-gradient-to-b from-neutral-900 to-black">
        <div className="container mx-auto px-6 relative z-10">
          <ContactForm brandYellow={brandYellow} onSuccess={handleSuccess} />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black py-12 border-t border-neutral-900 text-sm">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
               <div className={`w-6 h-6 ${brandYellow} rounded-sm flex items-center justify-center transform rotate-45`}>
                 <span className="transform -rotate-45 font-bold text-black text-[10px]">CF</span>
               </div>
               <span className="font-bold tracking-tight">CREATIVEFLIC</span>
            </div>
            
            <div className="text-neutral-500 flex flex-col md:flex-row gap-4 items-center text-center">
              <span>© 2025 CreativeFlic.</span>
              <span className="hidden md:inline">•</span>
              <span>Transforming Brands Globally.</span>
              <span className="hidden md:inline">•</span>
    
            </div>

            <div className="flex gap-6">
              <a href="#" className="text-neutral-400 hover:text-blue-500 transition-colors hover:scale-110 duration-200"><Instagram size={20} /></a>
              <a href="#" className="text-neutral-400 hover:text-blue-500 transition-colors hover:scale-110 duration-200"><Linkedin size={20} /></a>
              <a href="#" className="text-neutral-400 hover:text-blue-500 transition-colors hover:scale-110 duration-200"><Twitter size={20} /></a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Scroll to Top */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
        className="fixed bottom-6 right-6 p-4 rounded-full bg-yellow-400 text-black z-40 hover:scale-110 transition-transform shadow-[0_0_20px_rgba(250,204,21,0.5)] group"
        aria-label="Scroll to top"
      >
        <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform"/>
      </button>
    </div>
  );
};

export default App;import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Film, 
  ArrowRight, 
  Menu, 
  X, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Globe, 
  Zap, 
  Layout, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  ArrowUp,
  Mail,
  Lightbulb,
  MonitorPlay,
  Mic,
  ExternalLink,
  Clock
} from 'lucide-react';

// --- 1. PRELOADER COMPONENT ---
const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsVisible(false), 800); 
          setTimeout(onComplete, 1600); 
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 1; 
      });
    }, 100);
    return () => clearInterval(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] ${progress === 100 ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="relative">
        <span className="text-[12rem] md:text-[20rem] font-black text-neutral-900 tabular-nums leading-none select-none">
          {Math.min(progress, 100)}
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="text-xl md:text-3xl font-bold text-yellow-400 tracking-[0.5em] uppercase mix-blend-difference animate-pulse">
             CreativeFlic
           </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-yellow-400 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
    </div>
  );
};

// --- 2. CANVAS PARTICLE SYSTEM ---
const useParticleEffect = (canvasRef) => {
  const mouse = useRef({ x: undefined, y: undefined, radius: 150 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    class Particle {
      constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.vx = (Math.random() * 1) - 0.5;
        this.vy = (Math.random() * 1) - 0.5;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      
      update() {
        if (mouse.current.x !== undefined && mouse.current.y !== undefined) {
            let dx = mouse.current.x - this.x;
            let dy = mouse.current.y - this.y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < mouse.current.radius) {
                const maxDistance = mouse.current.radius;
                const force = (maxDistance - distance) / maxDistance;
                const directionX = (dx / distance) * force * 5; 
                const directionY = (dy / distance) * force * 5;
                
                this.x -= directionX;
                this.y -= directionY;
            }
        }
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        this.draw();
      }
    }

    const init = () => {
      particles = [];
      const area = canvas.width * canvas.height; 
      const numberOfParticles = Math.min(area / 9000, 150); 
      
      for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1; 
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let color = Math.random() > 0.5 ? 'rgba(250, 204, 21, 0.9)' : 'rgba(255, 255, 255, 0.8)';
        particles.push(new Particle(x, y, size, color));
      }
    };

    const resize = () => {
      const parent = canvas?.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        init();
      }
    };

    window.addEventListener('resize', resize);
    
    const handleMouseMove = (e) => {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mouse.current.x = e.clientX - rect.left;
        mouse.current.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
        mouse.current.x = undefined;
        mouse.current.y = undefined;
    }

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    resize();
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (canvas) {
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasRef]);
};

// --- WRAPPER COMPONENTS ---
const ParticleHeader = () => {
  const canvasRef = useRef(null);
  useParticleEffect(canvasRef);
  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40 w-full h-full" />;
};

const BigIdeaParticles = () => {
  const canvasRef = useRef(null);
  useParticleEffect(canvasRef);
  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-100 w-full h-full" />;
};


// --- 3. SUCCESS OVERLAY COMPONENT ---
const SuccessOverlay = ({ isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center transition-opacity duration-700 animate-in fade-in">
             <div className="text-center max-w-4xl px-6">
                <Reveal delay={0}>
                    <CheckCircle size={80} className="text-yellow-400 mx-auto mb-8 animate-pulse-slow glow-yellow" />
                </Reveal>
                
                <Reveal delay={100}>
                    <h2 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter">
                        BRIEF RECEIVED!
                    </h2>
                </Reveal>

                <Reveal delay={300}>
                    <div className="inline-flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-xl glow-blue">
                        <Clock size={24} />
                        <span className="uppercase tracking-wide">Next steps in 48 hours</span>
                    </div>
                </Reveal>
                
                <Reveal delay={500}>
                    <p className="mt-8 text-neutral-400 text-xl max-w-xl mx-auto">
                        Thank you for reaching out. We are reviewing your project details now and will contact you directly within two business days.
                    </p>
                </Reveal>

                <Reveal delay={700}>
                    <button 
                        onClick={onClose} 
                        className="mt-12 px-8 py-3 border border-white/20 text-white hover:border-yellow-400 hover:text-yellow-400 transition-colors duration-300 uppercase tracking-widest font-bold text-sm rounded-sm"
                    >
                        Return to Site
                    </button>
                </Reveal>
            </div>
        </div>
    );
}


// --- 4. REVEAL ANIMATION ---
const Reveal = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] transform ${
        isVisible 
          ? 'opacity-100 translate-y-0 rotate-0 skew-y-0 clip-path-full' 
          : 'opacity-0 translate-y-24 rotate-1 skew-y-3'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- 5. SUB-COMPONENTS ---

const ProjectCard = ({ category, title, color, tags, results, role, link }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / 20;
    const y = -(e.clientX - rect.left - rect.width / 2) / 20;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div 
      className="group relative perspective-1000 h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="relative bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden h-full transition-all duration-200 ease-out hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,1)] hover:border-neutral-700 hover:glow-white"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`,
        }}
      >
        <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-10 rounded-bl-[100px] transition-all duration-500 group-hover:scale-150`}></div>
        
        <div className="p-8 flex flex-col h-full relative z-10" style={{ transform: 'translateZ(20px)' }}>
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-300 mb-4 w-fit">
            {category}
          </span>
          
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-neutral-500 mb-6 font-mono">{role}</p>
          
          <div className="space-y-2 mb-8 flex-grow">
            {results && results.map((result, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                <TrendingUp size={14} className="text-green-500 mt-0.5 shrink-0" />
                {result}
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {tags && tags.slice(0, 3).map((tag, i) => (
                 <span key={i} className="text-[10px] uppercase font-bold px-2 py-1 bg-neutral-800 text-neutral-400 rounded-sm border border-neutral-700">
                   {tag}
                 </span>
              ))}
            </div>
            
            {link ? (
              <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-white uppercase tracking-wider transition-colors mt-auto group/link">
                View <ExternalLink size={12} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
              </a>
            ) : (
               <span className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 uppercase tracking-wider transition-colors mt-auto cursor-help" title="Confidential Client">
                 Private <Award size={12} />
               </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceOptions = [
  'YouTube Strategy & Growth',
  'Direct Response VSL/Ads',
  'B2B/SaaS Explainer Videos',
  'Social Media Content (Shorts/Reels)',
  'Full Content Audit/Consultation',
  'Other'
];

// --- 6. CONTACT FORM COMPONENT ---
const ContactForm = ({ brandYellow, onSuccess }) => {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyfpxNdT5sPtoIK_E0q6CUtIHQ3be2pp7XUBWIo61omRUVCm1PkQHt3w5sYkpeEl3V-g/exec';

  const [formData, setFormData] = useState({
    NAME: '',
    EMAIL: '',
    Service_Type: ServiceOptions[0],
    Message: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorStatus(false);
  };

  const validateForm = () => {
    if (!formData.NAME.trim()) return false;
    if (!formData.EMAIL.trim() || !/^\S+@\S+\.\S+$/.test(formData.EMAIL)) return false;
    if (!formData.Message.trim()) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
        alert("Please fill in all fields correctly.");
        return;
    }

    setLoading(true);
    setErrorStatus(false);

    const dataToSend = new FormData();
    dataToSend.append('DATE', new Date().toLocaleString());
    dataToSend.append('NAME', formData.NAME);
    dataToSend.append('EMAIL', formData.EMAIL);
    dataToSend.append('Service_Type', formData.Service_Type);
    dataToSend.append('Message', formData.Message);

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: dataToSend,
        mode: 'no-cors' 
      });

      onSuccess();
      setFormData({ NAME: '', EMAIL: '', Service_Type: ServiceOptions[0], Message: '' });
      
    } catch (error) {
      setErrorStatus(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-neutral-900/80 p-8 md:p-12 rounded-[2rem] border border-neutral-800 shadow-2xl relative overflow-hidden backdrop-blur-md glow-blue">
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[60px] animate-pulse"></div>
      
      <div className="text-center mb-8 relative z-10">
        <h3 className="text-3xl font-bold text-white mb-3">Start Your Project</h3>
        <p className="text-neutral-400">Fill out the form below and we'll get back to you within 24 hours.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Name / Company</label>
            <input
              type="text"
              name="NAME"
              value={formData.NAME}
              onChange={handleChange}
              placeholder="Ex: CreativeFlic Studio"
              required
              className="w-full p-4 bg-black/50 border border-neutral-800 rounded-lg text-white placeholder-neutral-700 focus:ring-1 focus:ring-yellow-400 outline-none transition-all focus:bg-black/80"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Email Address</label>
            <input
              type="email"
              name="EMAIL"
              value={formData.EMAIL}
              onChange={handleChange}
              placeholder="Ex: contact@example.com"
              required
              className="w-full p-4 bg-black/50 border border-neutral-800 rounded-lg text-white placeholder-neutral-700 focus:ring-1 focus:ring-yellow-400 outline-none transition-all focus:bg-black/80"
            />
          </div>
        </div>

        <div className="space-y-2">
           <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Service Required</label>
           <div className="relative">
            <select
              name="Service_Type"
              value={formData.Service_Type}
              onChange={handleChange}
              required
              className="w-full p-4 bg-black/50 border border-neutral-800 rounded-lg text-white focus:ring-1 focus:ring-yellow-400 outline-none transition-all focus:bg-black/80 appearance-none cursor-pointer"
            >
              {ServiceOptions.map(option => (
                <option key={option} value={option} className="bg-neutral-900 text-white">
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Project Details</label>
           <textarea
            name="Message"
            value={formData.Message}
            onChange={handleChange}
            placeholder="Tell us about your goals, timeline, and estimated budget..."
            rows="5"
            required
            className="w-full p-4 bg-black/50 border border-neutral-800 rounded-lg text-white placeholder-neutral-700 focus:ring-1 focus:ring-yellow-400 outline-none resize-none transition-all focus:bg-black/80"
           />
        </div>

        {errorStatus && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <X className="text-red-500 shrink-0" size={20} />
            <p className="text-red-200 text-sm">Something went wrong. Please try again or email us directly.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 ${brandYellow} text-black font-black text-lg rounded-lg hover:bg-white transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-2 transform active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'shadow-xl shadow-yellow-400/20 hover:shadow-yellow-400/40 hover:-translate-y-1 glow-yellow'}`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></span>
              <span>Sending...</span>
            </div>
          ) : (
            <>
              SEND PROJECT BRIEF <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// --- 7. MAIN APPLICATION COMPONENT ---

const App = () => {
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false); 
  
  const brandYellow = "bg-yellow-400";
  const textYellow = "text-yellow-400";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSuccess = () => {
    setShowSuccessOverlay(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // > Spotlight Effect Logic for Service Cards
  const handleSpotlightMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
  };

  const caseStudies = [
    { title: "500% Channel Growth: Transforming Niche Documentaries", category: "Documentary Growth", role: "Editor + Story Producer", results: ["Channel grew 5x in subs", "Stabilized 200k–300k avg views", "Multiple videos hit 1M+ views"], link: "https://www.youtube.com/watch?v=9aI0OzNuIKY", color: "bg-neutral-900", tags: ["Storytelling", "Branding", "Retention"] },
    { title: "Accelerated Authority: Driving 100K+ Subscribers", category: "Automotive Commentary", role: "Lead Editor + Strategist", results: ["Surpassed 100k subscribers", "Multiple videos reached 1M+", "Built short-form systems"], link: "https://www.youtube.com/watch?v=gVTPybaN1ro", color: "bg-blue-600", tags: ["Pacing", "Trend Optimization", "Systems"] },
    { title: "$5.5M in Annual Revenue: Conversion-First Video Strategy", category: "Health & Wellness", role: "VSL + Ad Editor", results: ["Scaled to $5.5M annual revenue", "Improved ad ROI by 5x", "Conversion-focused VSLs"], link: "https://www.amazon.com/SciatiEase-Sciatic-Nerve-Health-Support/dp/B0B5723XX5", color: "bg-yellow-400", tags: ["Conversion", "VSL", "Ads"] },
    { title: "Inbound Authority: Simplifying Complex AI", category: "SaaS / B2B", role: "Content Editor", results: ["Strengthened inbound authority", "Scalable faceless pipeline", "Simplified AI concepts"], link: "https://www.salesforge.ai/", color: "bg-blue-600", tags: ["SaaS", "Education", "Shorts"] },
    { title: "Consistent Virality: Scaling Personal Brand Reach", category: "Personal Brand", role: "Growth Strategist", results: ["Scaled to 50k+ followers", "Consistent virality", "High-energy storytelling"], link: "https://www.instagram.com/asonjf/", color: "bg-yellow-400", tags: ["Reels", "Social Growth", "Editing"] },
    { title: "Broadcast Excellence: Streamlining End-to-End TV Delivery", category: "Television", role: "End to End Strategist", results: ["Streamlined TV delivery", "Broadcast-level quality", "Multi-camera editing"], link: null, color: "bg-neutral-900", tags: ["Broadcast", "TV", "Pipeline"] },
    { title: "Educational Clarity: Mastering Narrative Structure", category: "Education", role: "Narrative Editor", results: ["Stronger viewer engagement", "Clearer educational delivery", "Pacing & Structure"], link: null, color: "bg-blue-600", tags: ["Education", "Narrative", "Long-form"] }
  ];

  const visibleProjects = showAllProjects ? caseStudies : caseStudies.slice(0, 6);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-400 selection:text-black overflow-x-hidden">
      
      {/* 1. Cinematic Preloader */}
      <Preloader onComplete={() => setLoading(false)} />
      
      {/* 2. Success Overlay */}
      <SuccessOverlay 
        isVisible={showSuccessOverlay} 
        onClose={() => setShowSuccessOverlay(false)} 
      />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Space Grotesk', sans-serif; }
        .clip-path-full { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
        .perspective-1000 { perspective: 1000px; }
        .rotate-x-2 { transform: rotateX(2deg); }
        .animate-marquee { animation: marquee 20s linear infinite; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        /* Glitch effect for logo text */
        @keyframes glitch {
          0% { text-shadow: 2px 0 red, -2px 0 blue; }
          25% { text-shadow: -2px 0 yellow, 2px 0 blue; }
          50% { text-shadow: 1px 0 green, -1px 0 yellow; }
          75% { text-shadow: -1px 0 red, 1px 0 blue; }
          100% { text-shadow: 0 0 transparent; }
        }
        .logo-glitch-hover:hover .logo-text {
            animation: glitch 0.5s infinite steps(2, end);
        }
        /* Glow effect styles */
        .glow-white {
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.2), 0 0 20px rgba(255, 255, 255, 0.1);
            transition: box-shadow 0.3s ease-in-out;
        }
        .hover\\:glow-white:hover {
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.2);
        }
        .glow-blue {
            box-shadow: 0 0 10px rgba(0, 150, 255, 0.3), 0 0 20px rgba(0, 150, 255, 0.15);
            transition: box-shadow 0.3s ease-in-out;
        }
        .hover\\:glow-blue:hover {
            box-shadow: 0 0 15px rgba(0, 150, 255, 0.5), 0 0 30px rgba(0, 150, 255, 0.3);
        }
        .glow-yellow {
            box-shadow: 0 0 10px rgba(250, 204, 21, 0.4), 0 0 20px rgba(250, 204, 21, 0.2);
            transition: box-shadow 0.3s ease-in-out;
        }
        /* Spotlight Effect CSS */
        .spotlight-card {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }
        .spotlight-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle 600px at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(59, 130, 246, 0.15),
            transparent 80%
          );
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
          z-index: 1;
        }
        .spotlight-card:hover::before {
          opacity: 1;
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed w-full z-40 transition-all duration-500 ${isScrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo Representation (Updated with Glitch Hover) */}
          <div className="text-2xl font-bold tracking-tighter flex items-center gap-2 cursor-pointer group logo-glitch-hover" onClick={() => scrollToSection('home')}>
            <div className={`w-10 h-10 ${brandYellow} rounded-sm flex items-center justify-center transform rotate-45 group-hover:rotate-0 transition-transform duration-500 hover:scale-110`}>
              <div className="transform -rotate-45 group-hover:rotate-0 transition-transform duration-500 font-black text-black text-lg leading-none">
                CF
              </div>
            </div>
            <span className="ml-2 group-hover:text-white transition-colors logo-text">CREATIVE<span className="text-blue-500">FLIC</span></span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10 text-sm font-bold tracking-widest uppercase">
            {['Work', 'Services', 'Process'].map((item) => (
              <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="hover:text-yellow-400 transition-colors relative group hover:glow-yellow">
                <span className="relative z-10">{item}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
            <button 
              onClick={() => scrollToSection('contact')} 
              className={`px-8 py-3 bg-white text-black hover:bg-yellow-400 transition-colors duration-300 font-black tracking-widest hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] rounded-sm`}
            >
              Start Project
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden z-50 p-2" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="text-white" /> : <Menu className="text-white" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 bg-black z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-500 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           {['Work', 'Services', 'Process', 'Contact'].map((item) => (
             <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-4xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500 hover:to-yellow-400 transition-colors">
               {item}
             </button>
           ))}
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <ParticleHeader />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-900 bg-blue-900/30 text-blue-300 text-xs font-bold uppercase tracking-widest mb-8 hover:bg-blue-900/50 transition-colors duration-300 glow-blue">
              <Globe size={12} className="animate-spin-slow" /> Serving International Brands
            </div>
          </Reveal>
          
          <Reveal delay={100}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.95] mix-blend-difference">
              SCALE YOUR BRAND <br />
              WITH <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-400 to-white">STRATEGIC CONTENT</span>
            </h1>
          </Reveal>
          
          <Reveal delay={200}>
            <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              We don't just edit videos. We provide end-to-end content strategy, design, and production to skyrocket your <span className="text-white font-bold">Sales, Leads, and Brand Identity.</span>
            </p>
          </Reveal>
          
          <Reveal delay={300}>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button onClick={() => scrollToSection('contact')} className={`px-8 py-4 ${brandYellow} text-black font-black rounded hover:bg-white transition-all duration-300 flex items-center gap-2 uppercase tracking-wide group shadow-lg shadow-yellow-400/30 active:scale-95 glow-yellow`}>
                Get Free Consultation
                <Zap size={18} className="fill-black group-hover:scale-110 transition-transform" />
              </button>
              <button onClick={() => scrollToSection('work')} className="px-8 py-4 border border-neutral-700 hover:border-blue-500 text-neutral-300 hover:text-blue-400 transition-all duration-300 uppercase tracking-wide font-bold transform hover:scale-105 active:scale-95 hover:glow-white">
                View Case Studies
              </button>
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
          <ArrowRight className="rotate-90 text-blue-500" />
        </div>
      </section>

      {/* INFINITE TICKER */}
      <div className="border-y border-white/5 bg-neutral-900/30 backdrop-blur-sm overflow-hidden">
        <div className="animate-marquee whitespace-nowrap py-6 flex gap-12 text-neutral-500 font-bold uppercase text-xs tracking-[0.2em]">
           {[...Array(10)].map((_, i) => (
             <span key={i} className="flex items-center gap-4">
               <Zap size={12} className="text-yellow-400" /> 50M+ Views Generated <span className="text-neutral-800">|</span> 
               <Zap size={12} className="text-blue-500" /> $5M+ Client Revenue <span className="text-neutral-800">|</span>
             </span>
           ))}
        </div>
      </div>

      {/* WORK SECTION */}
      <section id="work" className="py-24 bg-neutral-950 border-t border-neutral-900">
        <div className="container mx-auto px-6">
          <Reveal>
            <div className="flex flex-col md:flex-row items-start justify-between mb-12 gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-2">Proven Results</h2>
                <p className="text-neutral-500 max-w-xl">
                  Real case studies. Real ROI. From faceless YouTube channels to multi-million dollar Amazon brands.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleProjects.map((project, index) => (
              <Reveal key={index} delay={index * 100}>
                <ProjectCard {...project} />
              </Reveal>
            ))}
          </div>

          {!showAllProjects && caseStudies.length > 6 && (
             <Reveal delay={200}>
               <div className="mt-12 text-center">
                 <button 
                   onClick={() => setShowAllProjects(true)}
                   className="px-8 py-4 border border-neutral-700 hover:border-blue-500 text-white hover:text-blue-400 transition-all duration-300 uppercase tracking-wide font-bold hover:scale-105 active:scale-95 hover:glow-white"
                 >
                   View All {caseStudies.length} Case Studies
                 </button>
               </div>
             </Reveal>
          )}
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-y-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 w-1/3 h-full bg-blue-900/20 transform -skew-x-12 opacity-50 animate-pulse-slow origin-top-left -left-10"></div>
            <div className="absolute top-0 w-1/3 h-full bg-yellow-400/10 transform skew-x-12 opacity-50 animate-pulse-slow origin-top-right right-0 transition-opacity duration-1000" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className={`${textYellow} font-bold uppercase tracking-widest mb-4 text-sm`}>Our Ecosystem</h2>
              <h3 className="text-4xl md:text-5xl font-bold mb-6">End-to-End Brand Growth.</h3>
              <p className="text-neutral-400">
                We move beyond simple execution. We partner with international brands to handle the entire content lifecycle from the first spark of an idea to the final conversion.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            <Reveal delay={0} className="h-full">
              <div 
                className="p-8 border border-neutral-800 bg-neutral-900/40 rounded-2xl h-full transition-all duration-300 hover:-translate-y-2 group spotlight-card"
                onMouseMove={handleSpotlightMove}
              >
                <div className="w-14 h-14 bg-blue-900/20 rounded-xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 glow-blue">
                  <Lightbulb size={28} />
                </div>
                <h4 className="text-xl font-bold mb-4 text-white relative z-10">Strategy & Ideation</h4>
                <ul className="space-y-3 text-neutral-400 text-sm relative z-10">
                  {['Content Consultation', 'Brand Positioning', 'Scripting & Storyboarding', 'Market Research'].map((item, i) => (
                     <li key={i} className="flex items-start gap-2 group/item">
                       <span className="text-blue-500 mt-1 group-hover/item:text-blue-400 transition-colors">●</span> {item}
                     </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={100} className="h-full">
              <div 
                className="p-8 border border-blue-900/50 bg-blue-950/20 rounded-2xl shadow-2xl shadow-blue-900/10 h-full relative overflow-hidden transition-all duration-300 hover:-translate-y-2 group spotlight-card"
                onMouseMove={handleSpotlightMove}
              >
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 text-white shadow-lg shadow-blue-600/30 group-hover:rotate-6 transition-transform duration-300 glow-blue relative z-10">
                  <Film size={28} />
                </div>
                <h4 className="text-xl font-bold mb-4 text-white relative z-10">Production & Editing</h4>
                <ul className="space-y-3 text-neutral-300 text-sm relative z-10">
                   {['High-End Video Editing', 'Motion Graphics & VFX', 'Professional Voiceover', 'Color Grading & Sound'].map((item, i) => (
                     <li key={i} className="flex items-start gap-2 group/item">
                       <span className="text-yellow-400 mt-1 group-hover/item:text-white transition-colors">●</span> {item}
                     </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={200} className="h-full">
              <div 
                className="p-8 border border-neutral-800 bg-neutral-900/40 rounded-2xl h-full transition-all duration-300 hover:-translate-y-2 group spotlight-card"
                onMouseMove={handleSpotlightMove}
              >
                <div className="w-14 h-14 bg-blue-900/20 rounded-xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 glow-blue">
                  <Layout size={28} />
                </div>
                <h4 className="text-xl font-bold mb-4 text-white relative z-10">Design & Experience</h4>
                <ul className="space-y-3 text-neutral-400 text-sm relative z-10">
                   {['UI/UX Design', 'High-CTR Thumbnails', 'Brand Identity Systems', 'Social Media Assets'].map((item, i) => (
                     <li key={i} className="flex items-start gap-2 group/item">
                       <span className="text-blue-500 mt-1 group-hover/item:text-blue-400 transition-colors">●</span> {item}
                     </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section id="process" className="py-24 bg-black relative">
        <div className="container mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold mb-4">Seamless Remote Collaboration</h2>
               <p className="text-neutral-400 max-w-2xl mx-auto">
                 We've optimized our workflow for international time zones. No matter where you are, our team acts as your dedicated in-house content engine.
               </p>
            </div>
          </Reveal>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-center mb-20">
             {[
               { title: 'Discovery', icon: <Mic />, desc: 'Virtual Consultation' },
               { title: 'Strategy', icon: <Lightbulb />, desc: 'Blueprint Creation' },
               { title: 'Production', icon: <MonitorPlay />, desc: 'Execution Phase' },
               { title: 'Growth', icon: <TrendingUp />, desc: 'Optimize & Scale' },
             ].map((step, i) => (
               <Reveal key={i} delay={i * 100}>
                 <div className="p-6 bg-neutral-900 border border-neutral-800 hover:border-blue-500 transition-all duration-300 rounded-xl group hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-900/10 h-full hover:glow-white">
                   <div className="w-16 h-16 mx-auto bg-black rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-all duration-300 text-white group-hover:scale-110 shadow-inner group-hover:shadow-lg">
                     {step.icon}
                   </div>
                   <h4 className="font-bold text-xl group-hover:text-blue-400 transition-colors">{i + 1}. {step.title}</h4>
                   <p className="text-sm text-neutral-500 mt-2 group-hover:text-neutral-400 transition-colors">{step.desc}</p>
                 </div>
               </Reveal>
             ))}
          </div>

          {/* LOOM VIDEO PLACEHOLDER */}
          <Reveal delay={200}>
             <div className="w-full max-w-5xl mx-auto aspect-video rounded-3xl overflow-hidden relative group border border-neutral-800 bg-neutral-900 shadow-2xl hover:border-blue-500/50 transition-all duration-500 hover:glow-white">
               <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                 <button 
                    className="w-24 h-24 rounded-full bg-yellow-400 text-black flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-[0_0_40px_rgba(250,204,21,0.4)] pointer-events-auto"
                    aria-label="Play workflow video"
                 >
                   <Play size={32} fill="black" />
                 </button>
               </div>
               
               <div 
                 className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700 bg-[url('https://images.unsplash.com/photo-1626544827763-d516dce335ca?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 group-hover:scale-100 transition-transform duration-1000"
                 role="img"
                 aria-label="CreativeFlic Workflow Video Thumbnail"
               ></div>
               
               <div className="absolute bottom-8 left-8 z-20">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white mb-2">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Process Breakdown
                 </div>
                 <h4 className="text-2xl font-bold text-white">The CreativeFlic Workflow</h4>
                 <p className="text-neutral-300 text-sm mt-1">See how we manage international pipelines from Lahore to the World.</p>
               </div>
             </div>
           </Reveal>
        </div>
      </section>
      
      {/* NEW: HIGH CONTRAST BLUE CALL TO ACTION SCREEN */}
      <section id="big-idea" className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-blue-600 py-32 border-y-4 border-black glow-blue">
         <BigIdeaParticles />
         
         <div className="container mx-auto px-6 relative z-10 text-center">
           <Reveal delay={0}>
             <h2 className="text-xl md:text-3xl font-bold uppercase tracking-wider text-white mb-6">
                IS YOUR BIG IDEA READY TO GO WILD?
             </h2>
           </Reveal>
           <Reveal delay={150}>
             <h3 className="text-5xl md:text-8xl lg:text-9xl font-black text-white leading-none tracking-tighter mb-10">
               Let's work <br/> together!
             </h3>
           </Reveal>
           <Reveal delay={300}>
              <button onClick={() => scrollToSection('contact')} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black bg-white px-8 py-4 rounded-full shadow-xl hover:scale-105 active:scale-95 glow-white">
                LET'S TALK <ArrowRight size={18} />
              </button>
           </Reveal>
         </div>
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
           <button onClick={() => scrollToSection('contact')} className="text-white text-xs font-bold uppercase tracking-widest flex flex-col items-center group">
             CONTINUE TO CONTACT
             <ArrowRight className="rotate-90 mt-2 group-hover:translate-y-1 transition-transform" size={16}/>
           </button>
         </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-32 relative overflow-hidden bg-gradient-to-b from-neutral-900 to-black">
        <div className="container mx-auto px-6 relative z-10">
          <ContactForm brandYellow={brandYellow} onSuccess={handleSuccess} />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black py-12 border-t border-neutral-900 text-sm">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
               <div className={`w-6 h-6 ${brandYellow} rounded-sm flex items-center justify-center transform rotate-45`}>
                 <span className="transform -rotate-45 font-bold text-black text-[10px]">CF</span>
               </div>
               <span className="font-bold tracking-tight">CREATIVEFLIC</span>
            </div>
            
            <div className="text-neutral-500 flex flex-col md:flex-row gap-4 items-center text-center">
              <span>© 2025 CreativeFlic.</span>
              <span className="hidden md:inline">•</span>
              <span>Transforming Brands Globally.</span>
              <span className="hidden md:inline">•</span>
    
            </div>

            <div className="flex gap-6">
              <a href="#" className="text-neutral-400 hover:text-blue-500 transition-colors hover:scale-110 duration-200"><Instagram size={20} /></a>
              <a href="#" className="text-neutral-400 hover:text-blue-500 transition-colors hover:scale-110 duration-200"><Linkedin size={20} /></a>
              <a href="#" className="text-neutral-400 hover:text-blue-500 transition-colors hover:scale-110 duration-200"><Twitter size={20} /></a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Scroll to Top */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
        className="fixed bottom-6 right-6 p-4 rounded-full bg-yellow-400 text-black z-40 hover:scale-110 transition-transform shadow-[0_0_20px_rgba(250,204,21,0.5)] group"
        aria-label="Scroll to top"
      >
        <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform"/>
      </button>
    </div>
  );
};

export default App; ( RATE THE WEBSITE)

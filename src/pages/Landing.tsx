
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart,
  Book,
  Calendar,
  Construction,
  Headphones,
  Zap,
  Bot,
  Check,
  Phone,
  Clock,
  Users,
  Menu,
  X,
  Play,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Slider } from "@/components/ui/slider";

// Import components
import LisaLogo from "@/components/lisa/LisaLogo";
import AgentCard from "@/components/lisa/AgentCard";
import TestimonialCard from "@/components/lisa/TestimonialCard";
import RoiCalculator from "@/components/lisa/RoiCalculator";
import MobileMenu from "@/components/lisa/MobileMenu";

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);
  const [animatedText, setAnimatedText] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Refs for intersection observer
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    // Animation text cycle
    const interval = setInterval(() => {
      setAnimatedText(prev => (prev + 1) % 3);
    }, 3000);
    
    // Intersection observer for animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    // Observe all section elements
    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
      observer.disconnect();
    };
  }, [scrolled]);

  const subheadlines = [
    "Answering your calls. Optimizing your routes. Chasing your invoices.",
    "All without hiring another human.",
    "Let AI handle the repetitive tasks while you focus on growth."
  ];
  
  // Agent data for the Agents Section
  const agentData = [
    { 
      title: "AI Calling", 
      description: "Lisa handles all your calls and never misses a lead", 
      icon: <Phone className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500", 
    },
    { 
      title: "Smart Scheduling", 
      description: "Optimize technician routes and appointment slots", 
      icon: <Calendar className="w-6 h-6" />,
      color: "from-blue-500 to-purple-500", 
    },
    { 
      title: "Invoice Management", 
      description: "Automated invoice follow-ups and payment tracking", 
      icon: <BarChart className="w-6 h-6" />,
      color: "from-pink-500 to-red-500", 
    },
    { 
      title: "Field Operations", 
      description: "Real-time job tracking and technician coordination", 
      icon: <Construction className="w-6 h-6" />,
      color: "from-green-500 to-teal-500", 
    },
    { 
      title: "Data Analytics", 
      description: "Actionable insights to grow your business", 
      icon: <Zap className="w-6 h-6" />,
      color: "from-amber-500 to-orange-500", 
    },
    { 
      title: "AI Integration", 
      description: "Seamless connection with your existing tools", 
      icon: <Bot className="w-6 h-6" />,
      color: "from-indigo-500 to-blue-500", 
    },
  ];
  
  // Testimonial data
  const testimonialData = [
    {
      quote: "LISA's AI calling feature has captured 40% more leads that would have otherwise gone to voicemail. It's like having a 24/7 receptionist.",
      name: "Michael Rodriguez",
      title: "Owner, Rodriguez Plumbing",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    },
    {
      quote: "The smart scheduling has cut our admin time by 70%. Our technicians are always where they need to be, with the right information.",
      name: "Sarah Thompson",
      title: "Operations Manager, Thompson Electric",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    },
    {
      quote: "Our cash flow improved by 35% since using LISA's invoice management. Customers pay faster because the follow-up is consistent.",
      name: "David Chen",
      title: "CEO, Chen HVAC Solutions",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    }
  ];
  
  // Partner logos
  const partnerLogos = [
    { name: "TechCorp", logo: "TC" },
    { name: "BuildRight", logo: "BR" },
    { name: "ServicePro", logo: "SP" },
    { name: "ElectricNow", logo: "EN" },
    { name: "PlumbingPlus", logo: "PP" },
  ];
  
  // Benefits data
  const benefits = [
    {
      title: "Lower Overhead Costs",
      description: "Reduce admin staff needs by automating repetitive tasks",
      icon: <BarChart className="w-6 h-6" />
    },
    {
      title: "24/7 Availability",
      description: "Never miss another call or opportunity, even after hours",
      icon: <Clock className="w-6 h-6" />
    },
    {
      title: "Happier Team Members",
      description: "Let your team focus on skilled work, not administrative tasks",
      icon: <Users className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0118] to-[#120c25] text-white font-inter overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className={`fixed w-full z-50 ${scrolled ? 'bg-black/80' : 'bg-transparent'} backdrop-blur-lg transition-all duration-300 border-b border-purple-500/10`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <LisaLogo />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-purple-300 transition-colors">Home</Link>
            <Link to="/" className="text-white hover:text-purple-300 transition-colors">Agents</Link>
            <Link to="/" className="text-white hover:text-purple-300 transition-colors">Pricing</Link>
            <Link to="/" className="text-white hover:text-purple-300 transition-colors">About</Link>
          </div>
          
          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="ghost" className="text-white hover:text-purple-300 transition-colors">
              <Link to="/voice/login">Sign In</Link>
            </Button>
            <Button asChild className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
              <Link to="/voice/login">Get Started</Link>
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden pt-16">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black/40 to-black/80"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiM4YjVjZjYiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiBvcGFjaXR5PSIwLjEiLz48L3N2Zz4=')]"></div>
        </div>
        <div className="container mx-auto z-10 text-center space-y-6 max-w-4xl animate-on-scroll">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300">
              The Only AI
            </span>
            <br />
            <span className="text-white">
              Your Trades Business Needs
            </span>
          </h1>
          <div className="h-16 mb-8">
            <p className="text-xl md:text-2xl text-purple-100/90 transition-all duration-500 animate-fade-in">
              {subheadlines[animatedText]}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="rounded-full bg-white text-purple-900 hover:bg-purple-50 px-8 py-6 text-lg group transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]">
              <Link to="/voice/login">
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            </Button>
            <Button asChild className="rounded-full bg-transparent border border-purple-400 text-white hover:bg-purple-900/30 px-8 py-6 text-lg group transition-all duration-300">
              <Link to="/">
                <span className="flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </span>
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Animated Down Arrow */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowRight className="h-8 w-8 text-purple-400 rotate-90" />
        </div>
      </section>
      
      {/* Proof Strip */}
      <section className="py-12 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <p className="text-center text-purple-300 mb-8">Trusted by leading trades businesses</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {partnerLogos.map((partner, i) => (
              <div key={i} className="flex items-center justify-center">
                <div className="w-12 h-12 bg-purple-900/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-purple-500/20">
                  <span className="text-purple-300 font-bold">{partner.logo}</span>
                </div>
                <span className="ml-2 text-white/70">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Explainer Section */}
      <section className="py-24 relative overflow-hidden animate-on-scroll">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-purple-600/5 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-pink-600/5 blur-3xl rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                An AI Workforce You Deploy —
              </span>
              <span className="text-white"> Not Manage.</span>
            </h2>
            <p className="text-lg text-purple-100/80">
              LISA's AI agents work like employees but without the overhead. They learn your processes, integrate with your systems, and handle repetitive tasks 24/7.
            </p>
          </div>
          
          {/* AI Brain Visualization */}
          <div className="relative max-w-4xl mx-auto h-[600px]">
            {/* Central Brain */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full flex items-center justify-center border border-purple-500/30 backdrop-blur-md z-20 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
              <Bot className="w-16 h-16 text-purple-300" />
              <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-pulse"></div>
            </div>
            
            {/* Orbital Paths */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-purple-500/10 rounded-full"></div>
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-pink-500/10 rounded-full"></div>
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-indigo-500/10 rounded-full"></div>
            
            {/* Agent Orbitals */}
            {agentData.map((agent, i) => {
              const angle = (i * (360 / agentData.length)) * (Math.PI / 180);
              const radius = 200 + (i % 2) * 75; // Alternate between inner and outer orbital
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <div 
                  key={i}
                  className="absolute w-16 h-16 bg-gradient-to-br from-purple-700/30 to-pink-700/30 backdrop-blur-md rounded-full flex items-center justify-center border border-purple-500/30 transform -translate-x-1/2 -translate-y-1/2 shadow-lg hover:scale-110 transition-transform cursor-pointer"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                  }}
                >
                  {agent.icon}
                  <div className="absolute whitespace-nowrap mt-20 left-1/2 transform -translate-x-1/2 text-sm font-medium text-white">
                    {agent.title}
                  </div>
                </div>
              );
            })}
            
            {/* Connection Lines - Animated */}
            <svg className="absolute inset-0 w-full h-full z-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              
              {/* Decorative Paths */}
              <path d="M 200,300 Q 300,200 400,300" stroke="url(#lineGradient)" strokeWidth="1" fill="none" />
              <path d="M 300,200 Q 400,300 500,200" stroke="url(#lineGradient)" strokeWidth="1" fill="none" />
              <path d="M 250,400 Q 300,300 350,400" stroke="url(#lineGradient)" strokeWidth="1" fill="none" />
            </svg>
          </div>
        </div>
      </section>
      
      {/* Agents Section */}
      <section className="py-24 bg-gradient-to-t from-purple-900/10 to-black/40 backdrop-blur-lg animate-on-scroll">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Meet LISA's AI Agents
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agentData.map((agent, i) => (
              <AgentCard
                key={i}
                title={agent.title}
                description={agent.description}
                icon={agent.icon}
                colorGradient={agent.color}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonial Section */}
      <section className="py-24 relative animate-on-scroll">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/4 w-1/4 h-1/4 bg-purple-600/10 blur-3xl rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-1/4 h-1/4 bg-pink-600/10 blur-3xl rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            <span className="text-white">What Our </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Customers Say
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialData.map((testimonial, i) => (
              <TestimonialCard
                key={i}
                quote={testimonial.quote}
                name={testimonial.name}
                title={testimonial.title}
                avatar={testimonial.avatar}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Demo CTA Section */}
      <section className="py-16 px-4 animate-on-scroll">
        <div className="container mx-auto max-w-4xl">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-800/80 to-pink-800/80 backdrop-blur-xl"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJkb3RzIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIxIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNkb3RzKSIvPjwvc3ZnPg==')] opacity-20"></div>
            
            <div className="relative px-8 py-12 md:p-16 text-center">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-white">
                Want to see how your team could run faster, leaner, smarter with LISA?
              </h2>
              <p className="text-lg text-purple-100/90 mb-8 max-w-xl mx-auto">
                Experience the power of AI automation firsthand and see immediate ROI for your trades business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="rounded-full bg-white text-purple-900 hover:bg-purple-50 px-8 py-6 text-lg group transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  <Link to="/">
                    <span>Book a Demo</span>
                    <ArrowRight className="h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </Button>
                <Button asChild className="rounded-full bg-transparent border border-white text-white hover:bg-white/10 px-8 py-6 text-lg group transition-all duration-300">
                  <Link to="/">
                    <span className="flex items-center">
                      <Play className="h-5 w-5 mr-2" />
                      Try an Agent Live
                    </span>
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-purple-200/70 mt-6">No credit card required. No commitment.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* ROI Calculator Section */}
      <section className="py-24 bg-gradient-to-t from-black/60 to-purple-900/10 backdrop-blur-lg animate-on-scroll">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Calculate Your LISA ROI
            </span>
          </h2>
          <p className="text-center text-purple-100/80 max-w-2xl mx-auto mb-16">
            See how much time and money your business could save by implementing LISA's AI agents.
          </p>
          
          <RoiCalculator />
        </div>
      </section>
      
      {/* Why LISA Section */}
      <section className="py-24 relative animate-on-scroll">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-purple-600/5 blur-3xl rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Why Choose
            </span>
            <span className="text-white"> LISA?</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {benefits.map((benefit, i) => (
              <div key={i} className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-md border border-purple-500/20 rounded-xl p-8 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{benefit.title}</h3>
                <p className="text-purple-100/80">{benefit.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-20 text-center">
            <div className="inline-flex items-center justify-center flex-col sm:flex-row gap-2 sm:gap-8 mb-10">
              {[
                { label: "ROI within 30 days", icon: <Check className="h-5 w-5 text-green-400" /> },
                { label: "24/7 AI operation", icon: <Check className="h-5 w-5 text-green-400" /> },
                { label: "No code setup", icon: <Check className="h-5 w-5 text-green-400" /> },
              ].map((item, i) => (
                <div key={i} className="flex items-center">
                  {item.icon}
                  <span className="ml-2 text-purple-100">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden animate-on-scroll">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-1/2 w-[80vh] h-[80vh] bg-purple-600/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="text-white">Ready to </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Revolutionize
            </span>
            <span className="text-white"> Your Operations?</span>
          </h2>
          <p className="text-xl text-purple-200/90 mb-10 max-w-2xl mx-auto">
            Join the hundreds of trades businesses already saving time and money with LISA's AI workforce.
          </p>
          <Button 
            asChild
            className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-6 text-lg group transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
          >
            <Link to="/voice/login">
              <span>Get Started Today</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
          <p className="text-sm text-purple-300/60 mt-6">Setup in days. Cancel anytime. No pressure.</p>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-black/80 backdrop-blur-md border-t border-purple-500/20 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Company Info */}
            <div className="col-span-1">
              <div className="flex items-center mb-4">
                <LisaLogo size="sm" />
              </div>
              <p className="text-purple-200/70 mb-6">
                LISA is an AI platform designed specifically for trades businesses, helping them automate operations and scale efficiently.
              </p>
              <div className="flex space-x-4">
                {["", "", "", ""].map((_, i) => (
                  <a 
                    key={i}
                    href="/"
                    className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center border border-purple-500/30 hover:bg-purple-900/50 transition-colors"
                  >
                    <span className="sr-only">Social Link</span>
                    <Users className="w-4 h-4 text-purple-300" />
                  </a>
                ))}
              </div>
            </div>
            
            {/* Navigation Links */}
            <div className="col-span-1">
              <h3 className="font-bold mb-4 text-white">Platform</h3>
              <ul className="space-y-2">
                {["Agents", "Integrations", "Security", "Pricing"].map((item, i) => (
                  <li key={i}>
                    <a href="/" className="text-purple-200/70 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="col-span-1">
              <h3 className="font-bold mb-4 text-white">Company</h3>
              <ul className="space-y-2">
                {["About Us", "Careers", "Blog", "Contact"].map((item, i) => (
                  <li key={i}>
                    <a href="/" className="text-purple-200/70 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="col-span-1">
              <h3 className="font-bold mb-4 text-white">Legal</h3>
              <ul className="space-y-2">
                {["Terms of Service", "Privacy Policy", "Cookie Policy", "GDPR"].map((item, i) => (
                  <li key={i}>
                    <a href="/" className="text-purple-200/70 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-purple-500/10 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-purple-200/50 text-sm">
              © 2023 LISA AI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/" className="text-purple-200/70 hover:text-white transition-colors text-sm">
                Terms
              </a>
              <a href="/" className="text-purple-200/70 hover:text-white transition-colors text-sm">
                Privacy
              </a>
              <a href="/" className="text-purple-200/70 hover:text-white transition-colors text-sm">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

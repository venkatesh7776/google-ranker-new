import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useInView, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  CheckCircle2,
  Star,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  BarChart3,
  MessageSquare,
  Calendar,
  Zap,
  Award,
  MapPin,
  Building2,
  Utensils,
  Home,
  Stethoscope,
  Scale,
  Car,
  Scissors,
  Dumbbell,
  Bug,
  Wrench,
  Rocket,
  Brain,
  Heart,
  Globe,
  ChevronDown,
  Menu,
  X,
  LogIn,
  Link2,
  PlayCircle,
  TrendingUp as GrowthIcon,
  QrCode,
  Mail,
  Reply,
  Search
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { currentUser, loading } = useAuth();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (currentUser && !loading) {
      console.log('✅ LandingPage - User authenticated, should redirect to dashboard');
    }
  }, [currentUser, loading]);

  // If user is authenticated, redirect to dashboard
  if (currentUser && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const industries = [
    { name: 'Real Estate Agents', icon: Building2, color: 'from-blue-500 to-cyan-500' },
    { name: 'Automotive Repair', icon: Car, color: 'from-red-500 to-orange-500' },
    { name: 'Beauty Salons', icon: Scissors, color: 'from-pink-500 to-rose-500' },
    { name: 'Contractors', icon: Wrench, color: 'from-yellow-500 to-amber-500' },
    { name: 'Fitness Centers', icon: Dumbbell, color: 'from-green-500 to-emerald-500' },
    { name: 'Pest Control', icon: Bug, color: 'from-purple-500 to-violet-500' },
    { name: 'Home Services', icon: Home, color: 'from-indigo-500 to-blue-500' },
    { name: 'Restaurants & Cafes', icon: Utensils, color: 'from-orange-500 to-red-500' },
    { name: 'Law Firms', icon: Scale, color: 'from-slate-500 to-gray-500' },
    { name: 'Medical Practices', icon: Stethoscope, color: 'from-teal-500 to-cyan-500' },
  ];

  const features = [
    {
      name: 'Automated Google SEO',
      icon: Rocket,
      description: 'AI posts keyword-optimized updates on your Google Business Profile to keep it active and ranking higher.',
      benefit: 'Higher relevance, better visibility, more local discovery.',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      benefitColor: 'text-violet-600',
      borderColor: 'border-violet-300 hover:border-violet-500'
    },
    {
      name: 'Smart Review System',
      icon: Mail,
      description: 'Automatically send review requests via Email & SMS with smart follow-ups until customers leave reviews.',
      benefit: 'Consistent 5-star review growth without manual chasing.',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      benefitColor: 'text-blue-600',
      borderColor: 'border-blue-300 hover:border-blue-500'
    },
    {
      name: 'AI Review Replies',
      icon: Building2,
      description: 'Google Ranker replies to every review using SEO-optimized AI responses.',
      benefit: 'Improved trust, higher engagement, stronger ranking signals.',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-500',
      benefitColor: 'text-rose-500',
      borderColor: 'border-rose-300 hover:border-rose-500'
    },
    {
      name: 'QR Review Generator',
      icon: QrCode,
      description: 'Generate branded QR codes. Customers scan → see AI review suggestions → post instantly.',
      benefit: 'More in-store reviews with zero friction.',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      benefitColor: 'text-purple-600',
      borderColor: 'border-purple-300 hover:border-purple-500'
    },
    {
      name: 'AI Keyword Optimization',
      icon: Brain,
      description: 'Every post and reply includes location-based SEO keywords tailored to your business.',
      benefit: 'Stronger local relevance and better Google Maps rankings.',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      benefitColor: 'text-teal-600',
      borderColor: 'border-teal-300 hover:border-teal-500'
    },
    {
      name: 'Real-Time Dashboard',
      icon: BarChart3,
      description: 'Track reviews, keyword activity, engagement, and visibility from one simple dashboard.',
      benefit: "Clear insights into what's driving your Google growth.",
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      benefitColor: 'text-cyan-600',
      borderColor: 'border-cyan-300 hover:border-cyan-500'
    },
  ];

  const stats = [
    { value: '500+', label: 'Active Businesses', icon: Users },
    { value: '98%', label: 'Success Rate', icon: TrendingUp },
    { value: '2.5x', label: 'Avg. Lead Growth', icon: Rocket },
    { value: '24/7', label: 'AI Working', icon: Brain },
  ];

  const pricingPlans = [
    {
      duration: '1 Month',
      price: '₹1,499',
      period: '/month',
      popular: false,
      gradient: 'from-slate-500 to-gray-600',
    },
    {
      duration: '1 Year',
      price: '₹8,399',
      period: '/year',
      popular: true,
      badge: '💎 Best Value',
      gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
      savings: 'Save ₹9,589'
    },
    {
      duration: '6 Months',
      price: '₹5,999',
      period: '/6 months',
      popular: false,
      gradient: 'from-blue-600 to-cyan-600',
      savings: 'Save ₹3,000'
    },
  ];

  const planFeatures = [
    'Auto Posting & Scheduling',
    'AI Review Management',
    'Advanced Analytics Dashboard',
    'API Access & Integrations',
    '24/7 Priority Support',
    'SEO Audit Reports',
    'Competitor Analysis'
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      business: 'Salon Owner',
      location: 'Mumbai',
      quote: 'Google Ranker ne hume 30 days mein 45 new reviews dila diye. Ab customers automatically aa rahe hain!',
      rating: 5
    },
    {
      name: 'Rajesh Kumar',
      business: 'Gym Owner',
      location: 'Delhi',
      quote: 'Ranking 7th position se 2nd par aa gayi. Best investment for my gym!',
      rating: 5
    },
    {
      name: 'Anita Desai',
      business: 'Restaurant Owner',
      location: 'Bangalore',
      quote: 'Pehle hamare paas sirf 12 reviews the, ab 89 ho gaye. Customers kehte hain Google pe dekha!',
      rating: 5
    },
    {
      name: 'Vikram Singh',
      business: 'Dental Clinic',
      location: 'Pune',
      quote: '3 mahine mein Google Maps pe #1 rank aa gaya. Patient footfall 40% badh gaya hai.',
      rating: 5
    },
    {
      name: 'Sneha Patel',
      business: 'Boutique Owner',
      location: 'Ahmedabad',
      quote: 'AI replies se customers bahut impress hote hain. Review response time 2 din se 2 minute ho gaya!',
      rating: 5
    },
    {
      name: 'Amit Verma',
      business: 'Auto Service Center',
      location: 'Jaipur',
      quote: 'Local SEO ka kaam automatically ho jata hai. Ab main business pe focus kar sakta hoon.',
      rating: 5
    },
    {
      name: 'Kavita Reddy',
      business: 'Spa & Wellness',
      location: 'Hyderabad',
      quote: 'Online booking 3x badh gayi hai. Google pe visibility bahut improve hui.',
      rating: 5
    },
    {
      name: 'Rahul Mehta',
      business: 'Electronics Store',
      location: 'Chennai',
      quote: 'Competition se aage nikal gaye. Reviews aur ranking dono mein #1!',
      rating: 5
    },
    {
      name: 'Pooja Agarwal',
      business: 'Cake Shop',
      location: 'Kolkata',
      quote: 'Festival season mein orders 2x ho gaye. Sab Google se aa rahe hain!',
      rating: 5
    },
    {
      name: 'Sanjay Gupta',
      business: 'Physiotherapy Clinic',
      location: 'Lucknow',
      quote: 'Patient trust build karne mein bahut help mili. Reviews genuine aur helpful hain.',
      rating: 5
    },
  ];

  const resultStats = [
    { value: '2-3x', label: 'More reviews', icon: Star },
    { value: 'Faster', label: 'Ranking boost', icon: TrendingUp },
    { value: 'More', label: 'Customer calls', icon: MessageSquare },
    { value: 'Better', label: 'Map visibility', icon: MapPin },
    { value: 'Higher', label: 'Customer trust', icon: Users },
  ];

  const faqs = [
    {
      question: 'How does AI improve my Google Business Profile ranking?',
      answer: 'Our AI analyzes top-ranking competitors in real-time, identifies winning keywords and patterns, then automatically optimizes your posts, photos, and business information to match Google\'s ranking signals. It\'s like having a 24/7 SEO expert working for you.',
    },
    {
      question: 'Will this work for my industry?',
      answer: 'Absolutely! Our AI is trained on data from 50+ industries and adapts to your specific niche. Whether you\'re a restaurant, contractor, or professional service, we\'ve got proven strategies that work.',
    },
    {
      question: 'How quickly will I see results?',
      answer: 'Most businesses see noticeable improvements within 2-4 weeks. Ranking boosts typically occur within 60-90 days. The AI continuously optimizes, so results compound over time.',
    },
    {
      question: 'Do I need any technical skills?',
      answer: 'Zero! If you can send a text message, you can use Google Ranker. Our dashboard is super intuitive and the AI handles all the complex SEO stuff automatically.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes! No long-term contracts or hidden fees. Cancel anytime with one click. We\'re confident you\'ll love the results, so we keep it simple and flexible.',
    },
    {
      question: 'Is my data secure?',
      answer: '100%. We use bank-level encryption and never share your data. Your Google Business Profile stays under your complete control. We\'re SOC 2 compliant and take security seriously.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 scroll-smooth overflow-x-hidden">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/google-ranker-logo..png"
                alt="Google Ranker Logo"
                className="h-16 md:h-20 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-700 hover:text-violet-600 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-slate-700 hover:text-violet-600 font-medium transition-colors">Pricing</a>
              <a href="#testimonials" className="text-slate-700 hover:text-violet-600 font-medium transition-colors">Reviews</a>
              <a href="#faq" className="text-slate-700 hover:text-violet-600 font-medium transition-colors">FAQ</a>
              <Link to="/login">
                <Button variant="ghost" className="font-medium">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-medium shadow-lg shadow-violet-500/50 hover:shadow-xl hover:shadow-violet-500/50 transition-all">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pt-4 pb-6 flex flex-col gap-4"
            >
              <a href="#features" className="text-slate-700 hover:text-violet-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#pricing" className="text-slate-700 hover:text-violet-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#testimonials" className="text-slate-700 hover:text-violet-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Reviews</a>
              <a href="#faq" className="text-slate-700 hover:text-violet-600 font-medium" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600">Start Free Trial</Button>
              </Link>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-300/30 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto text-center space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 border-violet-200 hover:shadow-lg transition-shadow">
                <Sparkles className="h-4 w-4 mr-2 inline animate-spin" style={{ animationDuration: '3s' }} />
                AI-Powered Local SEO Revolution
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight"
            >
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                Dominate Local Search
              </span>
              <br />
              <span className="text-slate-900">With AI Magic ✨</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto font-medium"
            >
              Google Ranker is an all-in-one AI platform that automates Google SEO, reviews, replies, and reputation — helping local businesses rank higher and win more customers.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/signup">
                <Button
                  size="lg"
                  className="text-lg px-10 py-7 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold shadow-2xl shadow-violet-500/50 hover:shadow-violet-500/70 hover:scale-105 transition-all"
                >
                  🚀 Get 7 Days FREE
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-7 border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 font-bold hover:scale-105 transition-all"
                >
                  Sign In
                </Button>
              </Link>
            </motion.div>

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 pt-8"
            >
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium">No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium">Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium">Setup in 2 Minutes</span>
              </div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="pt-12"
            >
              <a href="#stats" className="inline-flex flex-col items-center gap-2 text-slate-400 hover:text-violet-600 transition-colors">
                <span className="text-sm font-medium">See What We've Achieved</span>
                <ChevronDown className="h-6 w-6 animate-bounce" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <AnimatedCard key={index} delay={index * 0.1}>
                <div className="text-center">
                  <stat.icon className="h-12 w-12 text-white mx-auto mb-4" />
                  <div className="text-4xl md:text-5xl font-black text-white mb-2">{stat.value}</div>
                  <div className="text-violet-100 font-medium">{stat.label}</div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* YouTube Video Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-10 left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-72 h-72 bg-fuchsia-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedCard delay={0.1}>
            <div className="text-center mb-10 md:mb-14">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="mb-4 px-5 py-2.5 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-white border-red-400/30 backdrop-blur-sm">
                  <PlayCircle className="h-4 w-4 mr-2 inline animate-pulse" />
                  Watch How It Works
                </Badge>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl font-black mb-4"
              >
                <span className="text-white">See Google Ranker </span>
                <span className="bg-gradient-to-r from-red-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
                  In Action
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto"
              >
                Watch this quick demo to see how businesses are dominating local search with AI
              </motion.p>
            </div>
          </AnimatedCard>

          {/* Video Container with glow effect */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative group">
              {/* Animated glow border */}
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-pulse"></div>

              {/* Video wrapper */}
              <div className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                {/* Play button overlay effect on hover */}
                <div className="aspect-video relative">
                  <iframe
                    src="https://www.youtube.com/embed/Pvqn3t9-tEQ?rel=0&modestbranding=1"
                    title="Google Ranker Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>

              {/* Decorative elements */}
              <motion.div
                className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full opacity-60"
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute -bottom-4 -right-4 w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-full opacity-60"
                animate={{
                  y: [0, 10, 0],
                  scale: [1.1, 1, 1.1]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>

          {/* Call to action below video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-10 md:mt-14"
          >
            <Link to="/signup">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-red-500 via-pink-500 to-violet-500 hover:from-red-600 hover:via-pink-600 hover:to-violet-600 text-white font-bold shadow-2xl shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 transition-all"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Try It Free For 7 Days
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-slate-400 text-sm mt-4">
              No credit card required • Setup in 2 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <AnimatedCard delay={0.1}>
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-2 bg-violet-100 text-violet-700 border-violet-200">
                <Zap className="h-4 w-4 mr-2 inline" />
                Powerful Features
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6">
                <span className="text-slate-900">One tool.</span>{' '}
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Total Google Growth
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Sit back and watch your business climb to the top of local search while AI handles everything automatically.
              </p>
            </div>
          </AnimatedCard>

          {/* Auto-sliding marquee animation */}
          <div className="overflow-hidden -mx-4 md:-mx-8 group/marquee">
            <div
              className="flex gap-6 py-4 animate-marquee group-hover/marquee:[animation-play-state:paused]"
              style={{
                width: 'max-content',
              }}
            >
              {/* First set of cards */}
              {[...features, ...features, ...features].map((feature, index) => (
                <div
                  key={index}
                  className="w-[300px] md:w-[380px] flex-shrink-0"
                >
                  <Card className={`group relative overflow-hidden border-2 ${feature.borderColor} bg-white hover:shadow-xl transition-all duration-300 h-full hover:-translate-y-2`}>
                    <CardHeader className="relative p-5 md:p-6">
                      <div className={`h-11 w-11 md:h-12 md:w-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className={`h-5 w-5 md:h-6 md:w-6 ${feature.iconColor}`} />
                      </div>
                      <CardTitle className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-slate-900">{feature.name}</CardTitle>
                      <CardDescription className="text-sm text-slate-600 leading-relaxed mb-3 md:mb-4">{feature.description}</CardDescription>
                      <p className={`text-sm font-medium ${feature.benefitColor}`}>{feature.benefit}</p>
                    </CardHeader>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-white to-purple-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedCard delay={0.1}>
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200">
                <Rocket className="h-4 w-4 mr-2 inline" />
                Simple & Powerful
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  How It Works
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Get started in minutes and watch your business grow on autopilot
              </p>
            </div>
          </AnimatedCard>

          <div className="max-w-6xl mx-auto">
            {/* Mobile: Horizontal scroll */}
            <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-4" style={{ width: 'max-content' }}>
                {/* Step 1 */}
                <div className="w-[260px] flex-shrink-0">
                  <div className="relative group h-full">
                    <Card className="relative bg-white border-2 border-purple-200 transition-all duration-300 h-full">
                      <CardContent className="pt-6 pb-6 text-center">
                        <div className="mb-4 relative">
                          <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <LogIn className="h-8 w-8 text-white" />
                          </div>
                          <div className="absolute -top-2 right-1/4 h-7 w-7 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            1
                          </div>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-slate-900">Login</h3>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          Sign up in seconds with your email or Google account
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="w-[260px] flex-shrink-0">
                  <div className="relative group h-full">
                    <Card className="relative bg-white border-2 border-blue-200 transition-all duration-300 h-full">
                      <CardContent className="pt-6 pb-6 text-center">
                        <div className="mb-4 relative">
                          <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <Link2 className="h-8 w-8 text-white" />
                          </div>
                          <div className="absolute -top-2 right-1/4 h-7 w-7 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            2
                          </div>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-slate-900">Connect</h3>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          Link your Google Business Profile with one click
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="w-[260px] flex-shrink-0">
                  <div className="relative group h-full">
                    <Card className="relative bg-white border-2 border-cyan-200 transition-all duration-300 h-full">
                      <CardContent className="pt-6 pb-6 text-center">
                        <div className="mb-4 relative">
                          <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
                            <PlayCircle className="h-8 w-8 text-white" />
                          </div>
                          <div className="absolute -top-2 right-1/4 h-7 w-7 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            3
                          </div>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-slate-900">Activate</h3>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          Turn on autoposting and let AI create engaging content
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="w-[260px] flex-shrink-0">
                  <div className="relative group h-full">
                    <Card className="relative bg-white border-2 border-green-200 transition-all duration-300 h-full">
                      <CardContent className="pt-6 pb-6 text-center">
                        <div className="mb-4 relative">
                          <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                            <GrowthIcon className="h-8 w-8 text-white" />
                          </div>
                          <div className="absolute -top-2 right-1/4 h-7 w-7 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            4
                          </div>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-slate-900">Grow</h3>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          Watch your rankings soar and business flourish
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400 mt-3">Swipe to see all steps →</p>
            </div>

            {/* Desktop: Static Grid */}
            <div className="hidden md:grid md:grid-cols-4 gap-8 relative">
              {/* Connecting Line */}
              <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-purple-200 via-blue-200 to-green-200 -z-10"></div>

              {/* Step 1 */}
              <AnimatedCard delay={0.1}>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                  <Card className="relative bg-white border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                    <CardContent className="pt-8 pb-8 text-center">
                      <div className="mb-6 relative">
                        <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <LogIn className="h-10 w-10 text-white" />
                        </div>
                        <div className="absolute -top-4 -right-4 h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          1
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-slate-900">Login</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        Sign up in seconds with your email or Google account
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedCard>

              {/* Step 2 */}
              <AnimatedCard delay={0.2}>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                  <Card className="relative bg-white border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                    <CardContent className="pt-8 pb-8 text-center">
                      <div className="mb-6 relative">
                        <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Link2 className="h-10 w-10 text-white" />
                        </div>
                        <div className="absolute -top-4 -right-4 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          2
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-slate-900">Connect</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        Link your Google Business Profile with one click
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedCard>

              {/* Step 3 */}
              <AnimatedCard delay={0.3}>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                  <Card className="relative bg-white border-2 border-cyan-200 hover:border-cyan-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                    <CardContent className="pt-8 pb-8 text-center">
                      <div className="mb-6 relative">
                        <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <PlayCircle className="h-10 w-10 text-white" />
                        </div>
                        <div className="absolute -top-4 -right-4 h-8 w-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          3
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-slate-900">Activate</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        Turn on autoposting and let AI create engaging content
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedCard>

              {/* Step 4 */}
              <AnimatedCard delay={0.4}>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-green-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                  <Card className="relative bg-white border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                    <CardContent className="pt-8 pb-8 text-center">
                      <div className="mb-6 relative">
                        <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <GrowthIcon className="h-10 w-10 text-white" />
                        </div>
                        <div className="absolute -top-4 -right-4 h-8 w-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          4
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-slate-900">Grow</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        Watch your rankings soar and business flourish
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedCard>
            </div>

            {/* CTA Button */}
            <AnimatedCard delay={0.5}>
              <div className="text-center mt-16">
                <Link to="/login">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg font-bold rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                  >
                    Start Your 7-Day Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <p className="text-sm text-slate-500 mt-4">No credit card required • Setup in 2 minutes</p>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <AnimatedCard delay={0.1}>
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-2 bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200">
                <Globe className="h-4 w-4 mr-2 inline" />
                For Every Business
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                  Works For Your Industry
                </span>
              </h2>
            </div>
          </AnimatedCard>

          {/* Auto-sliding marquee for Industries */}
          <div className="overflow-hidden -mx-4 md:-mx-8 group/marquee-industries">
            <div
              className="flex gap-4 md:gap-6 py-4 animate-marquee-fast group-hover/marquee-industries:[animation-play-state:paused]"
              style={{ width: 'max-content' }}
            >
              {/* Triple the industries for seamless loop */}
              {[...industries, ...industries, ...industries].map((industry, index) => (
                <div
                  key={index}
                  className="w-[130px] md:w-[160px] flex-shrink-0"
                >
                  <Card className="group relative overflow-hidden border-2 border-slate-200 hover:border-transparent bg-white hover:shadow-2xl transition-all duration-300 cursor-pointer h-full hover:-translate-y-2">
                    <div className={`absolute inset-0 bg-gradient-to-br ${industry.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <CardContent className="pt-5 pb-5 md:pt-6 md:pb-6 relative z-10 text-center">
                      <div className={`h-12 w-12 md:h-14 md:w-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${industry.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg`}>
                        <industry.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                      </div>
                      <p className="text-xs md:text-sm font-bold text-slate-700 group-hover:text-white transition-colors">{industry.name}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 relative overflow-x-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50 to-fuchsia-50"></div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedCard delay={0.1}>
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 border-violet-200">
                <Heart className="h-4 w-4 mr-2 inline" />
                Simple Pricing
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Try FREE for 7 Days
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                No credit card required. No tricks. Just pure AI-powered growth for your business.
              </p>
            </div>
          </AnimatedCard>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto px-2 md:px-8">
            {pricingPlans.map((plan, index) => (
              <AnimatedCard key={index} delay={index * 0.1}>
                <div className="relative pt-4">
                  {plan.badge && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
                      }`}>
                        {plan.badge}
                      </div>
                    </div>
                  )}
                  <Card
                    className={`relative overflow-hidden transition-all duration-300 mt-3 ${
                      plan.popular
                        ? 'border-4 border-violet-400 shadow-2xl shadow-violet-500/50 md:scale-105'
                        : 'border-2 border-slate-200 hover:border-violet-300 hover:shadow-xl'
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} ${plan.popular ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`}></div>

                    <CardHeader className={`text-center pb-8 pt-12 relative z-10 ${plan.popular ? 'text-white' : ''}`}>
                    <CardTitle className="text-2xl mb-4 font-bold">{plan.duration}</CardTitle>
                    <div className="mb-4">
                      <span className="text-5xl font-black">{plan.price}</span>
                      <span className="text-lg opacity-80">{plan.period}</span>
                    </div>
                    {plan.savings && (
                      <Badge className={`${plan.popular ? 'bg-white/20 text-white border-white/30' : 'bg-green-100 text-green-700 border-green-200'}`}>
                        {plan.savings}
                      </Badge>
                    )}
                  </CardHeader>

                  <CardContent className={`space-y-4 relative z-10 pb-8 ${plan.popular ? 'text-white' : ''}`}>
                    <div className="space-y-3 mb-6">
                      {planFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-white' : 'text-violet-600'}`} />
                          <span className="text-sm font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link to="/signup" className="block">
                      <Button
                        className={`w-full py-6 text-lg font-bold ${
                          plan.popular
                            ? 'bg-white text-violet-600 hover:bg-slate-100 shadow-xl'
                            : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 shadow-lg'
                        } hover:scale-105 transition-all`}
                      >
                        Start Free Trial
                        <Rocket className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                </div>
              </AnimatedCard>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12 text-slate-600 font-medium"
          >
            💳 No credit card required for trial • Cancel anytime • Money-back guarantee
          </motion.p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 md:py-32 bg-slate-50">
        <div className="container mx-auto px-4">
          <AnimatedCard delay={0.1}>
            <div className="text-center mb-12">
              <Badge className="mb-4 px-4 py-2 bg-violet-100 text-violet-700 border-violet-200">
                Results
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6">
                <span className="text-slate-900">Real Results from </span>
                <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                  Real Businesses
                </span>
              </h2>
            </div>
          </AnimatedCard>

          {/* Stats Row */}
          <AnimatedCard delay={0.2}>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-16">
              {resultStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200 px-6 py-5 md:px-8 md:py-6 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <stat.icon className="h-6 w-6 text-violet-600 mx-auto mb-3" />
                  <p className="text-xl md:text-2xl font-black text-slate-900">{stat.value}</p>
                  <p className="text-xs md:text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </AnimatedCard>

          {/* Auto-sliding testimonials marquee */}
          <div className="overflow-hidden -mx-4 md:-mx-8 group/marquee-testimonials">
            <div
              className="flex gap-6 py-4 animate-marquee group-hover/marquee-testimonials:[animation-play-state:paused]"
              style={{ width: 'max-content' }}
            >
              {/* Triple testimonials for seamless loop */}
              {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
                <div
                  key={index}
                  className="w-[320px] md:w-[400px] flex-shrink-0"
                >
                  <Card className="bg-white border border-slate-200 hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1">
                    <CardHeader className="p-5 md:p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-pink-500 text-pink-500" />
                        ))}
                      </div>

                      <CardDescription className="text-sm md:text-base leading-relaxed text-slate-700 mb-5">
                        "{testimonial.quote}"
                      </CardDescription>

                      <div>
                        <p className="font-bold text-slate-900">{testimonial.name}</p>
                        <p className="text-sm text-slate-500">{testimonial.business}, {testimonial.location}</p>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <AnimatedCard delay={0.1}>
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-2 bg-cyan-100 text-cyan-700 border-cyan-200">
                <MessageSquare className="h-4 w-4 mr-2 inline" />
                Got Questions?
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6 text-slate-900">
                We've Got Answers
              </h2>
            </div>
          </AnimatedCard>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <AnimatedCard key={index} delay={index * 0.05}>
                <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-base md:text-lg font-semibold text-slate-900 pr-4">
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="h-5 w-5 text-violet-600" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 text-slate-900 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMThoMnYxMnptMCAwIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Rocket className="h-20 w-20 text-white mx-auto mb-8" />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-6">
              Ready to Dominate Local Search?
            </h2>

            <p className="text-xl md:text-2xl text-violet-100 mb-8">
              Join 500+ businesses already winning with AI-powered SEO. Start your free trial today!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="text-xl px-12 py-8 bg-white text-violet-600 hover:bg-slate-100 font-black shadow-2xl hover:scale-110 transition-all"
                >
                  🚀 Start Free Trial Now
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
            </div>

            <p className="text-violet-100 text-sm">
              ✨ 7 days free • No credit card • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/google-ranker-logo..png"
                  alt="Google Ranker Logo"
                  className="h-16 md:h-20 w-auto object-contain brightness-0 invert"
                />
              </div>
              <p className="text-slate-400 mb-6">
                AI-powered local SEO platform helping businesses dominate Google Maps and local search results.
              </p>
              <div className="flex gap-4">
                {/* Instagram */}
                <a href="https://www.instagram.com/googleranker.io/" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-slate-800 hover:bg-violet-600 flex items-center justify-center transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                {/* Facebook */}
                <a href="https://www.facebook.com/profile.php?id=61581862835181" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-slate-800 hover:bg-violet-600 flex items-center justify-center transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                {/* YouTube */}
                <a href="https://youtube.com/@googlerankerai?si=aTMNWLqtFiAR7TB6" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-slate-800 hover:bg-violet-600 flex items-center justify-center transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-violet-400 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-violet-400 transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-violet-400 transition-colors">Testimonials</a></li>
                <li><a href="#faq" className="hover:text-violet-400 transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about-us" className="hover:text-violet-400 transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-violet-400 transition-colors">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-violet-400 transition-colors">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-violet-400 transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy-policy" className="hover:text-violet-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-violet-400 transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookie-policy" className="hover:text-violet-400 transition-colors">Cookie Policy</Link></li>
                <li><Link to="/gdpr" className="hover:text-violet-400 transition-colors">GDPR</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-500">
              © 2024 Google Ranker. All rights reserved. Built with ❤️ by AI experts in India for businesses worldwide.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919549517771"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-6 z-50 group"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          {/* Pulse animation */}
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25"></div>

          {/* Main button */}
          <div className="relative h-14 w-14 md:h-16 md:w-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transition-colors">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 md:h-8 md:w-8 text-white fill-current"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>

          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Chat with us
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-slate-900"></div>
          </div>
        </motion.div>
      </a>
    </div>
  );
};

// Animated Card Component
const AnimatedCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};

export default LandingPage;

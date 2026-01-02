import React, { useState } from 'react';
import { motion, useScroll, useSpring, useInView } from 'framer-motion';
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
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

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
      name: 'AI-Powered Dashboard',
      icon: BarChart3,
      description: 'Real-time insights and analytics at your fingertips',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      name: 'Smart SEO Audit',
      icon: Target,
      description: 'AI analyzes and optimizes your local presence',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Keyword Magic',
      icon: Sparkles,
      description: 'Discover high-converting local keywords instantly',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      name: 'Auto Posting',
      icon: Calendar,
      description: 'Schedule and publish content automatically',
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      name: 'AI Review Generator',
      icon: MessageSquare,
      description: 'Get more 5-star reviews effortlessly',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Smart Replies',
      icon: Star,
      description: 'AI crafts perfect responses to reviews',
      gradient: 'from-yellow-500 to-orange-500'
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
      popular: false,
      badge: '💎 Best Value',
      gradient: 'from-blue-600 to-cyan-600',
      savings: 'Save ₹9,589'
    },
    {
      duration: '6 Months',
      price: '₹5,999',
      period: '/6 months',
      popular: true,
      badge: '🔥 Most Popular',
      gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
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
      name: 'Sarah Johnson',
      business: 'Italian Restaurant Owner',
      location: 'Chicago, IL',
      quote: 'Our Google Maps ranking jumped from page 3 to TOP 3 in just 2 months! Calls increased by 60% and our tables are always full now.',
      rating: 5,
      image: '👩‍🍳'
    },
    {
      name: 'Michael Chen',
      business: 'HVAC Contractor',
      location: 'Austin, TX',
      quote: 'This AI automation is insane! Saves me 10+ hours weekly. My reviews doubled and so did my leads. Best ROI ever!',
      rating: 5,
      image: '👨‍🔧'
    },
    {
      name: 'Emily Rodriguez',
      business: 'Real Estate Agent',
      location: 'Miami, FL',
      quote: 'Absolute game-changer! I now dominate local search in my area. The AI does all the heavy lifting while I focus on clients.',
      rating: 5,
      image: '👩‍💼'
    },
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
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <MapPin className="h-8 w-8 text-violet-600 relative transform group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Google Ranker
              </span>
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
              className="text-5xl md:text-7xl font-black tracking-tight"
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
              Stop losing customers to competitors. Our AI works 24/7 to rank your business higher on Google Maps and drive real calls, visits, and sales.
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
                  🚀 Get 15 Days FREE
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
              className="flex flex-wrap items-center justify-center gap-8 pt-8"
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <AnimatedCard delay={0.1}>
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-2 bg-violet-100 text-violet-700 border-violet-200">
                <Zap className="h-4 w-4 mr-2 inline" />
                Powerful Features
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  AI Does The Heavy Lifting
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Sit back and watch your business climb to the top of local search while AI handles everything automatically.
              </p>
            </div>
          </AnimatedCard>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedCard key={index} delay={index * 0.1}>
                <Card className="group relative overflow-hidden border-2 border-slate-200 hover:border-violet-300 bg-white hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  <CardHeader className="relative">
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold mb-2 group-hover:text-violet-600 transition-colors">{feature.name}</CardTitle>
                    <CardDescription className="text-base text-slate-600">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <AnimatedCard delay={0.1}>
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-2 bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200">
                <Globe className="h-4 w-4 mr-2 inline" />
                For Every Business
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                  Works For Your Industry
                </span>
              </h2>
            </div>
          </AnimatedCard>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {industries.map((industry, index) => (
              <AnimatedCard key={index} delay={index * 0.05}>
                <Card className="group relative overflow-hidden border-2 border-slate-200 hover:border-transparent bg-white hover:shadow-2xl transition-all duration-300 cursor-pointer">
                  <div className={`absolute inset-0 bg-gradient-to-br ${industry.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <CardContent className="pt-8 pb-8 relative z-10 text-center">
                    <div className={`h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${industry.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 shadow-lg`}>
                      <industry.icon className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 group-hover:text-white transition-colors">{industry.name}</p>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ))}
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
              <h2 className="text-4xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Try FREE for 15 Days
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                No credit card required. No tricks. Just pure AI-powered growth for your business.
              </p>
            </div>
          </AnimatedCard>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 md:px-8">
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
      <section id="testimonials" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <AnimatedCard delay={0.1}>
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-2 bg-pink-100 text-pink-700 border-pink-200">
                <Award className="h-4 w-4 mr-2 inline" />
                Success Stories
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                  Real Results, Real People
                </span>
              </h2>
            </div>
          </AnimatedCard>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedCard key={index} delay={index * 0.1}>
                <Card className="group relative overflow-hidden border-2 border-slate-200 hover:border-violet-300 bg-white hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <CardHeader className="relative z-10">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    <CardDescription className="text-lg italic leading-relaxed text-slate-700 mb-6">
                      "{testimonial.quote}"
                    </CardDescription>

                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl">
                        {testimonial.image}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{testimonial.name}</p>
                        <p className="text-sm text-slate-600">{testimonial.business}</p>
                        <p className="text-xs text-slate-500">{testimonial.location}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </AnimatedCard>
            ))}
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
              <h2 className="text-4xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  We've Got Answers
                </span>
              </h2>
            </div>
          </AnimatedCard>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <AnimatedCard key={index} delay={index * 0.05}>
                <Card className="group border-2 border-slate-200 hover:border-violet-300 bg-white hover:shadow-xl transition-all duration-300 h-full">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold mb-3 group-hover:text-violet-600 transition-colors">
                      {faq.question}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed text-slate-600">
                      {faq.answer}
                    </CardDescription>
                  </CardHeader>
                </Card>
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

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
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
              ✨ 15 days free • No credit card • Cancel anytime
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
                <MapPin className="h-6 w-6 text-violet-400" />
                <span className="text-xl font-bold text-white">Google Ranker</span>
              </div>
              <p className="text-slate-400 mb-6">
                AI-powered local SEO platform helping businesses dominate Google Maps and local search results.
              </p>
              <div className="flex gap-4">
                <a href="#" className="h-10 w-10 rounded-full bg-slate-800 hover:bg-violet-600 flex items-center justify-center transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-slate-800 hover:bg-violet-600 flex items-center justify-center transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-slate-800 hover:bg-violet-600 flex items-center justify-center transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
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
                <li><a href="#" className="hover:text-violet-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-violet-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-violet-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-violet-400 transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy-policy" className="hover:text-violet-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-violet-400 transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-violet-400 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-violet-400 transition-colors">GDPR</a></li>
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

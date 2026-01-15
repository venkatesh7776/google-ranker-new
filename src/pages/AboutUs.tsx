import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Target, Users, Lightbulb, Award, Heart, Rocket, TrendingUp, Zap, Shield } from 'lucide-react';

const AboutUs = () => {
  const whyChooseUs = [
    {
      icon: TrendingUp,
      title: 'Proven Results',
      description: 'Our clients see an average 3x increase in Google visibility within the first 3 months.'
    },
    {
      icon: Zap,
      title: 'AI-Powered Automation',
      description: 'Save 10+ hours every week with our intelligent automation that works round the clock.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: '99.9% uptime with enterprise-grade security. Your data is always safe with us.'
    },
    {
      icon: Heart,
      title: 'Dedicated Support',
      description: 'Our Indian support team is available 24/7 to help you succeed.'
    }
  ];

  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      description: 'We exist to help local businesses compete with big brands in the digital space.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation First',
      description: 'We leverage cutting-edge AI to solve real business problems.'
    },
    {
      icon: Heart,
      title: 'Customer Obsessed',
      description: 'Your success is our success. We measure our impact by your growth.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for excellence in everything we build and deliver.'
    }
  ];

  const milestones = [
    { year: '2022', event: 'Google Ranker founded in Bangalore' },
    { year: '2023', event: 'Launched AI-powered review management' },
    { year: '2023', event: 'Reached 100+ active businesses' },
    { year: '2024', event: 'Expanded to serve businesses across India' },
    { year: '2024', event: 'Introduced automated Google SEO features' },
    { year: '2025', event: 'Serving 1000+ businesses nationwide' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Users className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-black mb-4">About Us</h1>
            <p className="text-xl text-violet-100">
              Empowering local businesses to dominate Google search
            </p>
          </motion.div>
        </div>
      </div>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Our Story */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
            <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src="/google-ranker-logo..png"
                    alt="Google Ranker Logo"
                    className="h-20 md:h-24 w-auto object-contain"
                  />
                  <h3 className="text-2xl font-bold">Built for Local Businesses</h3>
                </div>
                <div className="space-y-4 text-slate-700 leading-relaxed">
                  <p>
                    Google Ranker was born from a simple observation: local businesses struggle to compete online. While big brands have entire marketing teams, local shops, restaurants, and service providers often lack the time, resources, and expertise to manage their online presence effectively.
                  </p>
                  <p>
                    Founded in 2022 in Bangalore, India, we set out to change this. Our team of engineers, AI experts, and marketing professionals came together with one goal: to make enterprise-level local SEO accessible to every business, regardless of size.
                  </p>
                  <p>
                    Today, Google Ranker helps thousands of businesses across India improve their Google visibility, manage reviews effortlessly, and attract more customers through AI-powered automation. We're proud to be a made-in-India solution serving businesses worldwide.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Our Values */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full border-2 border-slate-200 hover:border-violet-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                          <value.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold">{value.title}</h3>
                      </div>
                      <p className="text-slate-600">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Timeline */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-8">Our Journey</h2>
            {/* Mobile Timeline */}
            <div className="md:hidden relative">
              <div className="absolute left-4 top-0 h-full w-1 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full"></div>
              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 pl-2"
                  >
                    <div className="w-4 h-4 bg-violet-500 rounded-full border-4 border-white shadow-lg z-10 flex-shrink-0 mt-4"></div>
                    <Card className="flex-1 border-2 border-slate-200">
                      <CardContent className="p-4">
                        <span className="text-sm font-bold text-violet-600">{milestone.year}</span>
                        <p className="text-slate-700">{milestone.event}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Desktop Timeline */}
            <div className="hidden md:block relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full"></div>
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} gap-8`}
                  >
                    <div className={`w-1/2 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <Card className="inline-block border-2 border-slate-200">
                        <CardContent className="p-4">
                          <span className="text-sm font-bold text-violet-600">{milestone.year}</span>
                          <p className="text-slate-700">{milestone.event}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="w-4 h-4 bg-violet-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                    <div className="w-1/2"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Stats */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 px-12">
                  <CardContent className="p-8">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-5xl font-black text-violet-600">1000+</p>
                    <p className="text-slate-600 text-lg mt-2">Businesses Served</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.section>

          {/* Why Choose Us */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-8">Why Choose Google Ranker?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {whyChooseUs.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full border-2 border-slate-200 hover:border-violet-300 transition-colors hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                          <item.icon className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold">{item.title}</h3>
                      </div>
                      <p className="text-slate-600">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50">
              <CardContent className="p-8">
                <Rocket className="h-12 w-12 mx-auto mb-4 text-violet-600" />
                <h3 className="text-2xl font-bold mb-4">Ready to Grow Your Business?</h3>
                <p className="text-slate-600 mb-6">
                  Join thousands of businesses already using Google Ranker to dominate local search.
                </p>
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold shadow-lg px-10 py-6 text-lg"
                  >
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500">
            © 2024 Google Ranker. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-4">
            <Link to="/privacy-policy" className="hover:text-violet-400 transition-colors text-sm md:text-base">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-violet-400 transition-colors text-sm md:text-base">
              Terms of Service
            </Link>
            <Link to="/" className="hover:text-violet-400 transition-colors text-sm md:text-base">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;

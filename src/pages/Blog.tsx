import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Clock, ArrowRight, Star, TrendingUp, MapPin, MessageSquare } from 'lucide-react';

const Blog = () => {
  const blogPosts = [
    {
      title: '10 Proven Strategies to Get More Google Reviews in 2025',
      excerpt: 'Learn the most effective tactics to encourage your customers to leave positive reviews on your Google Business Profile.',
      category: 'Reviews',
      readTime: '8 min read',
      date: 'Jan 10, 2025',
      icon: Star,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'How to Rank #1 on Google Maps: Complete Guide',
      excerpt: 'A step-by-step guide to optimizing your Google Business Profile for maximum visibility in local search results.',
      category: 'SEO',
      readTime: '12 min read',
      date: 'Jan 5, 2025',
      icon: MapPin,
      color: 'from-violet-500 to-fuchsia-500'
    },
    {
      title: 'The Power of AI in Local SEO: What You Need to Know',
      excerpt: 'Discover how artificial intelligence is revolutionizing local search optimization and how your business can benefit.',
      category: 'AI & Technology',
      readTime: '6 min read',
      date: 'Dec 28, 2024',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Responding to Negative Reviews: Turn Critics into Advocates',
      excerpt: 'Master the art of responding to negative reviews professionally and turn unhappy customers into loyal fans.',
      category: 'Reviews',
      readTime: '7 min read',
      date: 'Dec 20, 2024',
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Google Business Profile Updates: What Changed in 2024',
      excerpt: 'A comprehensive overview of all the major Google Business Profile changes and how to adapt your strategy.',
      category: 'Updates',
      readTime: '10 min read',
      date: 'Dec 15, 2024',
      icon: BookOpen,
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Local SEO for Restaurants: A Complete Playbook',
      excerpt: 'Special strategies and tips for restaurant owners to dominate local search and attract more diners.',
      category: 'Industry Guide',
      readTime: '15 min read',
      date: 'Dec 10, 2024',
      icon: Star,
      color: 'from-amber-500 to-yellow-500'
    }
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
            <BookOpen className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-black mb-4">Blog</h1>
            <p className="text-xl text-violet-100">
              Tips, insights, and strategies for local business success
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
        <div className="max-w-5xl mx-auto">
          {/* Featured Post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  <div className="p-8 md:p-10">
                    <span className="inline-block px-3 py-1 bg-violet-600 text-white text-sm font-medium rounded-full mb-4">
                      Featured
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                      The Ultimate Guide to Google Business Profile Optimization
                    </h2>
                    <p className="text-slate-600 mb-6">
                      Everything you need to know about optimizing your Google Business Profile for maximum visibility and customer engagement. From basics to advanced strategies.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        20 min read
                      </span>
                      <span>Jan 12, 2025</span>
                    </div>
                    <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 group">
                      Read Article
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                  <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center p-10">
                    <MapPin className="h-32 w-32 text-white/20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Blog Posts Grid */}
          <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-2 border-slate-200 hover:border-violet-300 transition-all hover:shadow-lg cursor-pointer group">
                  <CardContent className="p-6">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${post.color} flex items-center justify-center mb-4`}>
                      <post.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-violet-600 uppercase tracking-wider">
                      {post.category}
                    </span>
                    <h3 className="text-lg font-bold mt-2 mb-3 group-hover:text-violet-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                      <span>{post.date}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Newsletter CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
                <p className="text-slate-600 mb-6 max-w-xl mx-auto">
                  Get the latest local SEO tips, Google updates, and business growth strategies delivered to your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  />
                  <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 px-6">
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
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

export default Blog;

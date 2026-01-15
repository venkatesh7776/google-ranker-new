import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Briefcase, Clock, Bell, Mail } from 'lucide-react';

const Careers = () => {
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
            <Briefcase className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-black mb-4">Careers</h1>
            <p className="text-xl text-violet-100">
              Join our team and help businesses grow
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
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="p-8 md:p-12 text-center">
                <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-10 w-10 text-amber-600" />
                </div>

                <h2 className="text-3xl font-bold text-slate-800 mb-4">
                  No Open Positions Right Now
                </h2>

                <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
                  We're not actively hiring at the moment, but we're always interested in connecting with talented individuals who are passionate about helping local businesses succeed.
                </p>

                <div className="bg-white rounded-xl p-6 border border-amber-200 mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Bell className="h-6 w-6 text-violet-600" />
                    <h3 className="text-xl font-semibold">Stay Updated</h3>
                  </div>
                  <p className="text-slate-600 mb-4">
                    Want to be notified when positions open up? Drop us an email with your resume.
                  </p>
                  <a href="mailto:careers@googleranker.com">
                    <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700">
                      <Mail className="h-4 w-4 mr-2" />
                      careers@googleranker.com
                    </Button>
                  </a>
                </div>

                <div className="text-left bg-slate-50 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-800 mb-3">When we do hire, we look for:</h4>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600 mt-1">•</span>
                      <span>Passion for helping small businesses succeed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600 mt-1">•</span>
                      <span>Strong problem-solving skills</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600 mt-1">•</span>
                      <span>Experience in AI, marketing, or software development</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600 mt-1">•</span>
                      <span>Self-motivated individuals who thrive in a startup environment</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-12"
          >
            <p className="text-slate-600 mb-4">
              In the meantime, check out what we're building
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link to="/about-us">
                <Button variant="outline">Learn About Us</Button>
              </Link>
              <Link to="/">
                <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700">
                  View Our Product
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500">
            © 2024 Google Ranker. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/privacy-policy" className="hover:text-violet-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-violet-400 transition-colors">
              Terms of Service
            </Link>
            <Link to="/" className="hover:text-violet-400 transition-colors">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Careers;

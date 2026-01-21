import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Cookie, Settings, BarChart3, Shield, ToggleRight } from 'lucide-react';

const CookiePolicy = () => {
  const lastUpdated = 'December 25, 2024';

  const cookieTypes = [
    {
      icon: Shield,
      title: 'Essential Cookies',
      required: true,
      description: 'These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions you take, such as logging in or filling out forms.',
      examples: ['Session ID', 'Authentication tokens', 'Security cookies', 'Load balancing']
    },
    {
      icon: BarChart3,
      title: 'Analytics Cookies',
      required: false,
      description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our services.',
      examples: ['Google Analytics', 'Page view tracking', 'User behavior analysis', 'Performance metrics']
    },
    {
      icon: Settings,
      title: 'Functional Cookies',
      required: false,
      description: 'These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we use.',
      examples: ['Language preferences', 'Theme settings', 'User preferences', 'Remember me functionality']
    },
    {
      icon: ToggleRight,
      title: 'Marketing Cookies',
      required: false,
      description: 'These cookies may be set through our site by our advertising partners. They may be used to build a profile of your interests and show you relevant adverts on other sites.',
      examples: ['Google Ads', 'Retargeting cookies', 'Social media cookies', 'Conversion tracking']
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
            <Cookie className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-black mb-4">Cookie Policy</h1>
            <p className="text-xl text-violet-100">
              How we use cookies to improve your experience
            </p>
            <p className="text-sm text-violet-200 mt-4">
              Last Updated: {lastUpdated}
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
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50">
            <CardHeader>
              <CardTitle className="text-2xl">What Are Cookies?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p className="text-slate-700 leading-relaxed">
                At Google Ranker, we use cookies to enhance your browsing experience, analyze site traffic, personalize content, and serve targeted advertisements. This Cookie Policy explains what cookies we use, why we use them, and how you can manage your preferences.
              </p>
            </CardContent>
          </Card>

          {/* Cookie Types */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Types of Cookies We Use</h2>
            {cookieTypes.map((cookie, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-slate-200 hover:border-violet-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                        <cookie.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{cookie.title}</h3>
                          {cookie.required ? (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                              Required
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                              Optional
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 mb-4">{cookie.description}</p>
                        <div className="bg-slate-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-slate-700 mb-2">Examples:</p>
                          <div className="flex flex-wrap gap-2">
                            {cookie.examples.map((example, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-600"
                              >
                                {example}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* How to Manage Cookies */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl">How to Manage Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                You can control and manage cookies in various ways. Most browsers allow you to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>View what cookies are stored and delete them individually</li>
                <li>Block third-party cookies</li>
                <li>Block cookies from specific sites</li>
                <li>Block all cookies</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                Please note that if you choose to block or delete cookies, some features of our website may not function properly.
              </p>
              <div className="bg-slate-50 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Browser Cookie Settings:</p>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>• <strong>Chrome:</strong> Settings → Privacy and Security → Cookies</p>
                  <p>• <strong>Firefox:</strong> Options → Privacy & Security → Cookies</p>
                  <p>• <strong>Safari:</strong> Preferences → Privacy → Cookies</p>
                  <p>• <strong>Edge:</strong> Settings → Privacy & Services → Cookies</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Cookies */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl">Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and so forth. These include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li><strong>Google Analytics:</strong> For website traffic analysis</li>
                <li><strong>Google Ads:</strong> For advertising and remarketing</li>
                <li><strong>Firebase:</strong> For authentication services</li>
                <li><strong>Stripe:</strong> For payment processing</li>
              </ul>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl">Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this page periodically for the latest information on our cookie practices.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50">
            <CardHeader>
              <CardTitle className="text-2xl">Questions?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="space-y-2 text-slate-700">
                <p><strong>Email:</strong> privacy@googleranker.io</p>
                <p><strong>WhatsApp:</strong> +91 95495 17771</p>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center pt-8">
            <Link to="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold shadow-lg px-10 py-6 text-lg"
              >
                Return to Homepage
              </Button>
            </Link>
          </div>
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

export default CookiePolicy;

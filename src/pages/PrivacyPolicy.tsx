import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Lock, Eye, Database, UserCheck, Mail, Globe } from 'lucide-react';

const PrivacyPolicy = () => {
  const lastUpdated = 'December 25, 2024';

  const sections = [
    {
      icon: Database,
      title: '1. Information We Collect',
      content: [
        {
          subtitle: '1.1 Information You Provide',
          text: 'When you create an account, we collect your name, email address, business information, and Google Business Profile details. We also collect payment information when you subscribe to our services.'
        },
        {
          subtitle: '1.2 Automatically Collected Information',
          text: 'We automatically collect certain information about your device, including your IP address, browser type, operating system, and usage patterns. We use cookies and similar technologies to enhance your experience.'
        },
        {
          subtitle: '1.3 Google Business Profile Data',
          text: 'When you connect your Google Business Profile, we access and store information necessary to provide our services, including posts, reviews, analytics data, and business details.'
        }
      ]
    },
    {
      icon: Eye,
      title: '2. How We Use Your Information',
      content: [
        {
          subtitle: '2.1 Service Delivery',
          text: 'We use your information to provide, maintain, and improve our AI-powered local SEO services, including automated posting, review management, and analytics.'
        },
        {
          subtitle: '2.2 Communication',
          text: 'We may use your email address to send service updates, promotional materials, and important notifications. You can opt out of marketing emails at any time.'
        },
        {
          subtitle: '2.3 AI Training and Optimization',
          text: 'We use aggregated and anonymized data to train and improve our AI algorithms. Your specific business data is never used to train models accessible to other users.'
        },
        {
          subtitle: '2.4 Analytics and Research',
          text: 'We analyze usage patterns to understand how our service is used and to identify areas for improvement.'
        }
      ]
    },
    {
      icon: Lock,
      title: '3. Data Security',
      content: [
        {
          subtitle: '3.1 Security Measures',
          text: 'We implement industry-standard security measures including encryption (TLS/SSL), secure data centers, regular security audits, and access controls to protect your data.'
        },
        {
          subtitle: '3.2 Data Encryption',
          text: 'All data transmitted between your browser and our servers is encrypted using TLS 1.3. Data at rest is encrypted using AES-256 encryption.'
        },
        {
          subtitle: '3.3 SOC 2 Compliance',
          text: 'We maintain SOC 2 Type II compliance and follow industry best practices for data security and privacy.'
        }
      ]
    },
    {
      icon: UserCheck,
      title: '4. Data Sharing and Disclosure',
      content: [
        {
          subtitle: '4.1 Third-Party Services',
          text: 'We share data with trusted third-party service providers who help us deliver our services, including cloud hosting providers, payment processors, and analytics services. These providers are contractually obligated to protect your data.'
        },
        {
          subtitle: '4.2 Google API Services',
          text: 'Our use of information received from Google APIs adheres to Google API Services User Data Policy, including the Limited Use requirements.'
        },
        {
          subtitle: '4.3 Legal Requirements',
          text: 'We may disclose your information if required by law, court order, or government regulation, or to protect our rights and safety.'
        },
        {
          subtitle: '4.4 Business Transfers',
          text: 'In the event of a merger, acquisition, or sale of assets, your data may be transferred to the acquiring entity.'
        }
      ]
    },
    {
      icon: Shield,
      title: '5. Your Privacy Rights',
      content: [
        {
          subtitle: '5.1 Access and Portability',
          text: 'You have the right to access your personal data and request a copy in a portable format.'
        },
        {
          subtitle: '5.2 Correction and Deletion',
          text: 'You can update your information at any time through your account settings. You may request deletion of your account and associated data.'
        },
        {
          subtitle: '5.3 Data Retention',
          text: 'We retain your data for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data for legal compliance purposes.'
        },
        {
          subtitle: '5.4 GDPR Rights (EU Users)',
          text: 'If you are in the EU, you have additional rights including the right to object to processing, restrict processing, and file complaints with supervisory authorities.'
        },
        {
          subtitle: '5.5 CCPA Rights (California Users)',
          text: 'California residents have the right to know what personal information is collected, request deletion, and opt-out of sale of personal information (we do not sell personal information).'
        }
      ]
    },
    {
      icon: Globe,
      title: '6. International Data Transfers',
      content: [
        {
          subtitle: '6.1 Data Location',
          text: 'Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.'
        },
        {
          subtitle: '6.2 EU-US Data Transfers',
          text: 'For transfers from the EU to the US, we rely on Standard Contractual Clauses and other approved transfer mechanisms.'
        }
      ]
    },
    {
      icon: Mail,
      title: '7. Cookies and Tracking',
      content: [
        {
          subtitle: '7.1 Cookie Usage',
          text: 'We use essential cookies for authentication and functionality, analytics cookies to understand usage, and preference cookies to remember your settings.'
        },
        {
          subtitle: '7.2 Third-Party Cookies',
          text: 'We may use third-party analytics services like Google Analytics. You can opt out through browser settings or third-party opt-out tools.'
        },
        {
          subtitle: '7.3 Do Not Track',
          text: 'We respect Do Not Track signals. You can control cookie preferences through your browser settings.'
        }
      ]
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
            <Shield className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-black mb-4">Privacy Policy</h1>
            <p className="text-xl text-violet-100">
              Your privacy is important to us. Here's how we protect your data.
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
              <CardTitle className="text-2xl">Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                Welcome to Google Ranker. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered local SEO platform. Please read this privacy policy carefully.
              </p>
              <p className="text-slate-700 leading-relaxed">
                By using our service, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
              </p>
            </CardContent>
          </Card>

          {/* Detailed Sections */}
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-2 border-slate-200 hover:border-violet-300 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {section.content.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <h3 className="text-lg font-bold text-slate-900">{item.subtitle}</h3>
                      <p className="text-slate-700 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Children's Privacy */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl">8. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">
                Our service is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl">9. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
              <p className="text-slate-700 leading-relaxed">
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50">
            <CardHeader>
              <CardTitle className="text-2xl">10. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-slate-700">
                <p><strong>Email:</strong> privacy@googleranker.io</p>
                <p><strong>Address:</strong> Google Ranker, Privacy Department, [Your Business Address]</p>
                <p><strong>Response Time:</strong> We aim to respond to all privacy inquiries within 48 hours.</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection Officer */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl">11. Data Protection Officer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed mb-4">
                For EU users, you may contact our Data Protection Officer (DPO) regarding any privacy-related matters:
              </p>
              <div className="space-y-2 text-slate-700">
                <p><strong>DPO Email:</strong> dpo@googleranker.io</p>
                <p><strong>Supervisory Authority:</strong> You have the right to lodge a complaint with your local data protection authority.</p>
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

export default PrivacyPolicy;

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Globe, UserCheck, Database, Lock, FileText, Mail } from 'lucide-react';

const GDPR = () => {
  const lastUpdated = 'December 25, 2024';

  const rights = [
    {
      icon: FileText,
      title: 'Right to Access',
      description: 'You have the right to request copies of your personal data. We will provide this information within 30 days of your request.'
    },
    {
      icon: UserCheck,
      title: 'Right to Rectification',
      description: 'You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.'
    },
    {
      icon: Database,
      title: 'Right to Erasure',
      description: 'You have the right to request that we erase your personal data, under certain conditions. This is also known as the "right to be forgotten".'
    },
    {
      icon: Lock,
      title: 'Right to Restrict Processing',
      description: 'You have the right to request that we restrict the processing of your personal data, under certain conditions.'
    },
    {
      icon: Globe,
      title: 'Right to Data Portability',
      description: 'You have the right to request that we transfer the data we have collected to another organization, or directly to you.'
    },
    {
      icon: Shield,
      title: 'Right to Object',
      description: 'You have the right to object to our processing of your personal data, under certain conditions.'
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
            <Globe className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-black mb-4">GDPR Compliance</h1>
            <p className="text-xl text-violet-100">
              Your data protection rights under the General Data Protection Regulation
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
              <CardTitle className="text-2xl">Our Commitment to GDPR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                Google Ranker is committed to protecting the privacy and security of your personal data. We comply with the General Data Protection Regulation (GDPR), which gives individuals in the European Economic Area (EEA) specific rights regarding their personal data.
              </p>
              <p className="text-slate-700 leading-relaxed">
                This page explains your rights under GDPR and how we handle your personal data in compliance with the regulation.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Rights Under GDPR</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {rights.map((right, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full border-2 border-slate-200 hover:border-violet-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4">
                        <right.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{right.title}</h3>
                      <p className="text-slate-600 text-sm">{right.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Legal Basis */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl">Legal Basis for Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                Under GDPR, we must have a valid legal basis for processing your personal data. We rely on the following legal bases:
              </p>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-bold text-slate-800 mb-2">Contractual Necessity</h4>
                  <p className="text-slate-600 text-sm">
                    Processing necessary to provide our services to you under our Terms of Service.
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-bold text-slate-800 mb-2">Consent</h4>
                  <p className="text-slate-600 text-sm">
                    Where you have given explicit consent for specific processing activities, such as marketing communications.
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-bold text-slate-800 mb-2">Legitimate Interests</h4>
                  <p className="text-slate-600 text-sm">
                    Processing necessary for our legitimate business interests, such as improving our services and fraud prevention.
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-bold text-slate-800 mb-2">Legal Obligation</h4>
                  <p className="text-slate-600 text-sm">
                    Processing necessary to comply with legal requirements, such as tax and accounting obligations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Transfers */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl">International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                Your personal data may be transferred to and processed in countries outside the EEA. When we transfer data internationally, we ensure appropriate safeguards are in place:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Binding Corporate Rules for transfers within our corporate group</li>
                <li>Adequacy decisions where the destination country provides adequate protection</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl">Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li><strong>Account Data:</strong> Retained while your account is active and for 30 days after deletion</li>
                <li><strong>Transaction Data:</strong> Retained for 7 years for tax and legal compliance</li>
                <li><strong>Analytics Data:</strong> Retained for 26 months in anonymized form</li>
                <li><strong>Marketing Data:</strong> Retained until you withdraw consent</li>
              </ul>
            </CardContent>
          </Card>

          {/* How to Exercise Rights */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl">How to Exercise Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                To exercise any of your GDPR rights, you can:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Email our Data Protection Officer at dpo@googleranker.io</li>
                <li>Use the privacy settings in your account dashboard</li>
                <li>Contact us via our support channels</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                We will respond to your request within 30 days. In some cases, we may need to verify your identity before processing your request.
              </p>
            </CardContent>
          </Card>

          {/* Contact DPO */}
          <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50">
            <CardHeader>
              <CardTitle className="text-2xl">Contact Our Data Protection Officer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                If you have any questions about GDPR compliance or wish to exercise your rights, please contact our Data Protection Officer:
              </p>
              <div className="bg-white rounded-lg p-6 border border-violet-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Data Protection Officer</p>
                    <p className="text-violet-600">dpo@googleranker.io</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm">
                  You also have the right to lodge a complaint with your local supervisory authority if you believe your data protection rights have been violated.
                </p>
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

export default GDPR;

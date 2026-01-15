import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Scale, CreditCard, RefreshCw } from 'lucide-react';

const TermsOfService = () => {
  const lastUpdated = 'December 25, 2024';

  const sections = [
    {
      icon: CheckCircle2,
      title: '1. Acceptance of Terms',
      content: [
        {
          subtitle: '1.1 Agreement to Terms',
          text: 'By accessing and using Google Ranker, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.'
        },
        {
          subtitle: '1.2 Eligibility',
          text: 'You must be at least 18 years old and have the authority to enter into these Terms. By using our service, you represent that you meet these requirements.'
        },
        {
          subtitle: '1.3 Business Use',
          text: 'Our service is designed for business use. You represent that you are using our service for legitimate business purposes.'
        }
      ]
    },
    {
      icon: FileText,
      title: '2. Service Description',
      content: [
        {
          subtitle: '2.1 Platform Services',
          text: 'Google Ranker provides AI-powered local SEO services including automated posting, review management, analytics, and Google Business Profile optimization.'
        },
        {
          subtitle: '2.2 Service Availability',
          text: 'We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. We may perform maintenance, updates, or modifications that temporarily affect availability.'
        },
        {
          subtitle: '2.3 Service Modifications',
          text: 'We reserve the right to modify, suspend, or discontinue any part of our service at any time with reasonable notice to users.'
        },
        {
          subtitle: '2.4 Third-Party Integration',
          text: 'Our service integrates with Google Business Profile and other third-party services. We are not responsible for the availability or functionality of these third-party services.'
        }
      ]
    },
    {
      icon: CreditCard,
      title: '3. Account and Subscription',
      content: [
        {
          subtitle: '3.1 Account Creation',
          text: 'You must create an account to use our service. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.'
        },
        {
          subtitle: '3.2 Free Trial',
          text: 'We offer a 7-day free trial. No credit card is required for the trial. After the trial period, you must subscribe to continue using the service.'
        },
        {
          subtitle: '3.3 Subscription Plans',
          text: 'We offer monthly, 6-month, and annual subscription plans. Subscription fees are charged in advance and are non-refundable except as required by law.'
        },
        {
          subtitle: '3.4 Auto-Renewal',
          text: 'Subscriptions automatically renew at the end of each billing period unless you cancel before the renewal date. You will be charged the then-current subscription rate.'
        },
        {
          subtitle: '3.5 Payment Methods',
          text: 'We accept major credit cards and other payment methods as displayed during checkout. You authorize us to charge your payment method for all fees.'
        },
        {
          subtitle: '3.6 Price Changes',
          text: 'We may change subscription prices with 30 days notice. Price changes will apply to subsequent billing periods after the notice period.'
        }
      ]
    },
    {
      icon: RefreshCw,
      title: '4. Cancellation and Refunds',
      content: [
        {
          subtitle: '4.1 Cancellation',
          text: 'You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period.'
        },
        {
          subtitle: '4.2 Refund Policy',
          text: 'We offer a 30-day money-back guarantee for first-time subscribers. Refunds are not provided for subsequent billing periods or after 30 days from initial purchase.'
        },
        {
          subtitle: '4.3 Account Termination',
          text: 'We reserve the right to suspend or terminate your account for violation of these Terms, non-payment, or fraudulent activity.'
        }
      ]
    },
    {
      icon: AlertTriangle,
      title: '5. Acceptable Use Policy',
      content: [
        {
          subtitle: '5.1 Permitted Use',
          text: 'You may use our service only for lawful business purposes in compliance with all applicable laws and regulations.'
        },
        {
          subtitle: '5.2 Prohibited Activities',
          text: 'You may not: (a) violate any laws or regulations; (b) infringe intellectual property rights; (c) transmit malware or harmful code; (d) attempt to gain unauthorized access; (e) abuse or harass others; (f) create fake reviews or engage in review manipulation; (g) spam or send unsolicited communications; (h) resell or redistribute our service without authorization.'
        },
        {
          subtitle: '5.3 Content Guidelines',
          text: 'You are responsible for all content posted through our service. Content must not be illegal, offensive, defamatory, or violate third-party rights.'
        },
        {
          subtitle: '5.4 Google Policies Compliance',
          text: 'You must comply with Google Business Profile policies and guidelines. We are not responsible for violations of Google policies that result in penalties to your account.'
        }
      ]
    },
    {
      icon: Scale,
      title: '6. Intellectual Property',
      content: [
        {
          subtitle: '6.1 Our Intellectual Property',
          text: 'All rights, title, and interest in our service, including software, AI models, algorithms, designs, and content, are owned by Google Ranker or our licensors.'
        },
        {
          subtitle: '6.2 Your Content',
          text: 'You retain ownership of content you submit to our service. By submitting content, you grant us a license to use, modify, and display it as necessary to provide our services.'
        },
        {
          subtitle: '6.3 Trademark',
          text: 'Google Ranker and our logos are trademarks. You may not use our trademarks without prior written permission.'
        },
        {
          subtitle: '6.4 AI-Generated Content',
          text: 'Content generated by our AI for your business becomes your property. However, we retain the right to use anonymized data to improve our AI models.'
        }
      ]
    },
    {
      icon: XCircle,
      title: '7. Disclaimers and Limitations',
      content: [
        {
          subtitle: '7.1 No Guarantees',
          text: 'We do not guarantee specific results, rankings, or outcomes. SEO results depend on many factors outside our control, including Google algorithm changes and competitor activity.'
        },
        {
          subtitle: '7.2 Service "As Is"',
          text: 'Our service is provided "as is" and "as available" without warranties of any kind, either express or implied.'
        },
        {
          subtitle: '7.3 Limitation of Liability',
          text: 'To the maximum extent permitted by law, Google Ranker shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.'
        },
        {
          subtitle: '7.4 Maximum Liability',
          text: 'Our total liability to you for any claims arising from these Terms or our service shall not exceed the amount you paid us in the 12 months preceding the claim.'
        },
        {
          subtitle: '7.5 Third-Party Services',
          text: 'We are not responsible for any third-party services, websites, or content accessed through our platform.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <FileText className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-black mb-4">Terms of Service</h1>
            <p className="text-xl text-cyan-100">
              Please read these terms carefully before using our service.
            </p>
            <p className="text-sm text-cyan-200 mt-4">
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
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="text-2xl">Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                Welcome to Google Ranker. These Terms of Service ("Terms") govern your use of our AI-powered local SEO platform and services. These Terms constitute a legally binding agreement between you and Google Ranker.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Please read these Terms carefully. By accessing or using our service, you acknowledge that you have read, understood, and agree to be bound by these Terms.
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
              <Card className="border-2 border-slate-200 hover:border-blue-300 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
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

          {/* Additional Sections */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl">8. Indemnification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless Google Ranker and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, costs, or expenses (including legal fees) arising from: (a) your use of our service; (b) your violation of these Terms; (c) your violation of any third-party rights; (d) your content or business information.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl">9. Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">9.1 Informal Resolution</h3>
                <p className="text-slate-700 leading-relaxed">
                  Before filing a claim, you agree to try to resolve the dispute informally by contacting us at Support@googleranker.io. We will attempt to resolve the dispute informally within 60 days.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">9.2 Arbitration</h3>
                <p className="text-slate-700 leading-relaxed">
                  If we cannot resolve the dispute informally, any dispute will be resolved through binding arbitration, except where prohibited by law. You waive your right to a jury trial.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">9.3 Class Action Waiver</h3>
                <p className="text-slate-700 leading-relaxed">
                  You agree to resolve disputes with us on an individual basis and waive your right to participate in class actions or class arbitrations.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">9.4 Governing Law</h3>
                <p className="text-slate-700 leading-relaxed">
                  These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl">10. Data and Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed mb-4">
                Your use of our service is also governed by our Privacy Policy. Please review our Privacy Policy to understand how we collect, use, and protect your information.
              </p>
              <Link to="/privacy-policy">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Read Privacy Policy
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl">11. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed mb-4">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by email or through our service at least 30 days before the changes take effect.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Your continued use of our service after changes take effect constitutes acceptance of the modified Terms. If you do not agree to the changes, you must cancel your subscription.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl">12. Miscellaneous</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">12.1 Entire Agreement</h3>
                <p className="text-slate-700 leading-relaxed">
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and Google Ranker regarding our service.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">12.2 Severability</h3>
                <p className="text-slate-700 leading-relaxed">
                  If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">12.3 Waiver</h3>
                <p className="text-slate-700 leading-relaxed">
                  Our failure to enforce any right or provision in these Terms will not constitute a waiver of that right or provision.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">12.4 Assignment</h3>
                <p className="text-slate-700 leading-relaxed">
                  You may not assign or transfer these Terms or your account without our prior written consent. We may assign our rights and obligations without restriction.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">12.5 Force Majeure</h3>
                <p className="text-slate-700 leading-relaxed">
                  We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including natural disasters, war, terrorism, or internet outages.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="text-2xl">13. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-slate-700">
                <p><strong>Email:</strong> legal@googleranker.com</p>
                <p><strong>Support:</strong> Support@googleranker.io</p>
                <p><strong>Address:</strong> Google Ranker, Legal Department, [Your Business Address]</p>
              </div>
            </CardContent>
          </Card>

          {/* Acknowledgment */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    By using Google Ranker, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center pt-8">
            <Link to="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold shadow-lg px-10 py-6 text-lg"
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
            <Link to="/privacy-policy" className="hover:text-blue-400 transition-colors text-sm md:text-base">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-blue-400 transition-colors text-sm md:text-base">
              Terms of Service
            </Link>
            <Link to="/" className="hover:text-blue-400 transition-colors text-sm md:text-base">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfService;
